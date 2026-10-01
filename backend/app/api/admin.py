from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import require_admin
from app.db.database import get_db
from app.db.models import AdminAccessRequest, AuditLog, User
from app.api.geographic import _empty_result

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/map")
def get_admin_geographic_analytics(_: dict = Depends(require_admin)):
    """Admin-only geographic aggregate contract; empty until authorized metadata is available."""
    result = _empty_result()
    result["data_quality"] = {
        "records_with_geographic_metadata": 0,
        "records_without_geographic_metadata": None,
        "suppressed_locations": 0,
    }
    return result

@router.get("/dashboard")
def get_admin_dashboard(_: dict = Depends(require_admin)):
    """Administrative system summary. All metrics are explicitly experimental/demo until real telemetry is integrated."""
    return {
        "data_classification": "experimental_demo",
        "stats": {
            "total_users": 1284,
            "total_doctors": 126,
            "total_patients": 3842,
            "total_mri_scans": 8917,
            "analyses_today": 172,
            "active_ai_models": 3,
            "system_health": "operational",
            "failed_jobs": 2,
        },
        "notice": "Operational and model metrics are experimental/demo values until production telemetry is configured.",
    }

@router.get("/security/summary")
def get_security_summary(_: dict = Depends(require_admin)):
    return {
        "authentication_status": "operational",
        "otp_activity": "normal",
        "failed_login_attempts": 3,
        "active_sessions": 38,
        "sensitive_values": "masked",
    }

@router.get("/access-requests")
def list_admin_access_requests(_: dict = Depends(require_admin), db: Session = Depends(get_db)):
    """List verified requests for elevated administrator access."""
    return db.query(AdminAccessRequest).order_by(AdminAccessRequest.created_at.desc()).all()

@router.post("/access-requests/{request_id}/approve")
def approve_admin_access_request(request_id: str, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    request = db.query(AdminAccessRequest).filter(AdminAccessRequest.id == request_id).first()
    if not request or request.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pending administrator access request not found.")
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requesting user account was not found.")
    user.role = "Admin"
    request.status = "APPROVED"
    request.reviewed_by_user_id = admin["sub"]
    request.reviewed_at = datetime.now(timezone.utc)
    db.add(AuditLog(user_id=admin["sub"], action="ADMIN_ACCESS_APPROVED", details=f"Approved admin access for {request.email}"))
    db.commit()
    return {"id": request.id, "status": request.status, "email": request.email}

@router.post("/access-requests/{request_id}/reject")
def reject_admin_access_request(request_id: str, admin: dict = Depends(require_admin), db: Session = Depends(get_db)):
    request = db.query(AdminAccessRequest).filter(AdminAccessRequest.id == request_id).first()
    if not request or request.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pending administrator access request not found.")
    request.status = "REJECTED"
    request.reviewed_by_user_id = admin["sub"]
    request.reviewed_at = datetime.now(timezone.utc)
    db.add(AuditLog(user_id=admin["sub"], action="ADMIN_ACCESS_REJECTED", details=f"Rejected admin access for {request.email}"))
    db.commit()
    return {"id": request.id, "status": request.status, "email": request.email}
