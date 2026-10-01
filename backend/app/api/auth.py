from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import database
from app.db.database import get_db
from app.db.models import User, OTPToken, AuditLog, AdminAccessRequest
from app.schemas.schemas import (
    OTPRequest,
    OTPVerifyRequest,
    OTPResponse,
    UserRegister,
    UserLogin,
    TokenResponse,
    UserResponse,
)
from app.core.security import (
    generate_otp,
    hash_otp,
    verify_otp_hash,
    create_access_token,
    verify_password,
    get_password_hash,
)
from app.core.config import settings
from app.services.email_service import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _save_user_to_mongodb(user: User):
    """Mirror account profile and password hash to MongoDB; never store plaintext credentials."""
    if not database.is_mongodb_connected() or database.mongo_db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Account storage is unavailable. MongoDB is not connected; please try again later.",
        )
    try:
        database.mongo_db["users"].update_one(
            {"email": user.email.lower().strip()},
            {"$set": {
                "user_id": user.id,
                "email": user.email.lower().strip(),
                "full_name": user.full_name,
                "role": user.role,
                "location": user.location,
                "phone_number": user.phone_number,
                "organization": user.organization,
                "hashed_password": user.hashed_password,
                "is_active": bool(user.is_active),
                "is_verified": bool(user.is_verified),
                "created_at": user.created_at,
            }},
            upsert=True,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Account could not be saved to MongoDB. Please try again later.",
        ) from exc

@router.post("/otp/send", response_model=OTPResponse)
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    """
    Generate and deliver a secure 6-digit OTP.
    Enforces 60-second cooldown, 5-minute validity, and SHA-256 hashed storage.
    """
    now = datetime.now(timezone.utc)
    email = payload.email.lower().strip()
    if payload.purpose not in {"LOGIN", "REGISTER", "ADMIN_LOGIN", "ADMIN_REQUEST"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported OTP purpose.")
    if payload.purpose == "ADMIN_LOGIN" and email != settings.ADMIN_EMAIL.lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator OTP is restricted to the configured administrator email.")

    # 1. Cooldown Check: Disallow rapid spamming
    recent_otp = (
        db.query(OTPToken)
        .filter(OTPToken.email == email, OTPToken.is_used == False)
        .order_by(OTPToken.created_at.desc())
        .first()
    )
    if recent_otp:
        # SQLite returns naive datetime, make sure comparison is timezone-aware
        created_at = recent_otp.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        elapsed = (now - created_at).total_seconds()
        if elapsed < settings.OTP_COOLDOWN_SECONDS:
            remaining = int(settings.OTP_COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting a new OTP."
            )

    # 2. Generate 6-digit numerical code
    plain_otp = generate_otp(6)
    hashed_value, salt = hash_otp(plain_otp)
    expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # 3. Store in Database
    otp_record = OTPToken(
        email=email,
        hashed_otp=hashed_value,
        salt=salt,
        purpose=payload.purpose,
        created_at=now,
        expires_at=expires_at,
        is_used=False,
        attempts=0,
    )
    db.add(otp_record)
    db.commit()

    # 4. Dispatch Email
    email_sent = send_otp_email(email, plain_otp, purpose=payload.purpose)
    # When SMTP is configured, never report delivery success if the SMTP server rejected it.
    if settings.SMTP_USER and settings.SMTP_PASSWORD and not email_sent:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The email service could not deliver the verification code. Check SMTP credentials and Gmail App Password configuration.",
        )

    # 5. Return response (includes demo_otp if in dev or SMTP not set)
    demo_otp = plain_otp if (settings.DEBUG or not settings.SMTP_USER) else None

    return OTPResponse(
        message=f"A 6-digit verification code has been dispatched to {email}.",
        email=email,
        expires_in_seconds=settings.OTP_EXPIRE_MINUTES * 60,
        cooldown_seconds=settings.OTP_COOLDOWN_SECONDS,
        demo_otp=demo_otp,
    )

@router.post("/otp/verify", response_model=TokenResponse)
def verify_otp(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify 6-digit OTP using constant-time hash comparison.
    Activates user account upon successful verification.
    """
    now = datetime.now(timezone.utc)
    email = payload.email.lower().strip()
    otp_input = payload.otp.strip()
    if payload.purpose not in {"LOGIN", "REGISTER", "ADMIN_LOGIN", "ADMIN_REQUEST"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported OTP purpose.")
    if payload.purpose == "ADMIN_LOGIN" and email != settings.ADMIN_EMAIL.lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator access is restricted.")

    otp_record = (
        db.query(OTPToken)
        .filter(
            OTPToken.email == email,
            OTPToken.purpose == payload.purpose,
            OTPToken.is_used == False,
        )
        .order_by(OTPToken.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP found. Please request a new code."
        )

    # Check Brute Force attempts
    if otp_record.attempts >= settings.OTP_MAX_ATTEMPTS:
        otp_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Maximum verification attempts exceeded. Please request a new OTP."
        )

    # Check expiration
    expires_at = otp_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        otp_record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This OTP has expired. Please request a new code."
        )

    # Verify Hash
    is_valid = verify_otp_hash(otp_input, otp_record.hashed_otp, otp_record.salt)
    if not is_valid:
        otp_record.attempts += 1
        db.commit()
        remaining_attempts = settings.OTP_MAX_ATTEMPTS - otp_record.attempts
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP code. {remaining_attempts} attempts remaining."
        )

    # Register a new account only after the corresponding registration OTP is verified.
    user = db.query(User).filter(User.email == email).first()
    if payload.purpose == "LOGIN" and not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account was found for this email. Create an account first.",
        )
    if payload.purpose == "REGISTER":
        required_profile = [payload.full_name, payload.password, payload.role, payload.location, payload.phone_number, payload.organization]
        if not all(required_profile):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Name, password, account type, location, phone number, and organization are required.")
        if user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists.")
        if payload.role == "Admin" and email != settings.ADMIN_EMAIL.lower():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Administrator registration is restricted.")
        user = User(
            email=email,
            full_name=payload.full_name,
            role=payload.role,
            location=payload.location,
            phone_number=payload.phone_number,
            organization=payload.organization,
            hashed_password=get_password_hash(payload.password),
            is_verified=True,
            is_active=True,
            last_login=now,
        )
        db.add(user)
    elif payload.purpose == "ADMIN_REQUEST":
        required_profile = [payload.full_name, payload.password, payload.location, payload.phone_number, payload.organization]
        if not all(required_profile):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Name, password, location, phone number, and organization are required.")
        if not user:
            user = User(email=email, full_name=payload.full_name, role="User", location=payload.location, phone_number=payload.phone_number, organization=payload.organization, hashed_password=get_password_hash(payload.password), is_verified=True, is_active=True, last_login=now)
            db.add(user)
            db.flush()
        existing_request = db.query(AdminAccessRequest).filter(AdminAccessRequest.email == email).first()
        if existing_request and existing_request.status == "PENDING":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An administrator access request is already pending for this email.")
        if existing_request:
            existing_request.status = "PENDING"
            existing_request.full_name = payload.full_name
            existing_request.location = payload.location
            existing_request.phone_number = payload.phone_number
            existing_request.organization = payload.organization
            existing_request.user_id = user.id
            existing_request.reviewed_by_user_id = None
            existing_request.review_note = None
            existing_request.reviewed_at = None
        else:
            db.add(AdminAccessRequest(user_id=user.id, full_name=payload.full_name, email=email, location=payload.location, phone_number=payload.phone_number, organization=payload.organization))
        user.is_verified = True
        user.is_active = True
        user.last_login = now
    elif payload.purpose == "ADMIN_LOGIN":
        # Mailbox ownership is verified through the configured administrator OTP.
        if not user:
            user = User(email=email, full_name="System Administrator", role="Admin", is_verified=True, is_active=True, last_login=now)
            db.add(user)
        else:
            user.role = "Admin"
            user.is_verified = True
            user.is_active = True
            user.last_login = now
    elif not user:
        # The configured administrator can bootstrap only by proving mailbox ownership via OTP.
        user = User(email=email, full_name=email.split("@")[0].capitalize(), role="User", is_verified=True, is_active=True, last_login=now)
        db.add(user)
    else:
        user.is_verified = True
        user.is_active = True
        user.last_login = now

    # Mark the OTP as used only after the requested action is valid.
    otp_record.is_used = True

    if payload.purpose in {"REGISTER", "ADMIN_REQUEST", "ADMIN_LOGIN"}:
        db.flush()
        _save_user_to_mongodb(user)

    # Audit Log
    audit = AuditLog(user_id=user.id, action="LOGIN_OTP_SUCCESS", details=f"Verified via OTP: {email}")
    db.add(audit)
    db.commit()
    db.refresh(user)

    # Create JWT
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.post("/register", response_model=TokenResponse)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new clinical research account."""
    email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )
    if payload.role == "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator accounts must use the verified administrator access flow.",
        )

    user = User(
        email=email,
        full_name=payload.full_name,
        role=payload.role,
        location=payload.location,
        phone_number=payload.phone_number,
        organization=payload.organization,
        hashed_password=get_password_hash(payload.password),
        is_verified=True,  # Activated immediately in dev/demo or via OTP
        is_active=True,
        last_login=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()
    _save_user_to_mongodb(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    """Standard password login for verified researchers."""
    email = payload.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()

    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user.last_login = datetime.now(timezone.utc)
    _save_user_to_mongodb(user)
    db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )
