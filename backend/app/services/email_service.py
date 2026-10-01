import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("neuroscan.email")

def send_otp_email(recipient_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    """
    Send 6-digit verification OTP to the user via SMTP (e.g. Gmail with App Password).
    Falls back gracefully to logging if credentials are not configured, enabling zero-friction testing.
    """
    subject = f"[{settings.APP_NAME}] Your {purpose} Security Code: {otp_code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0F1D; color: #F8FAFC; margin: 0; padding: 20px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #111A30; border-radius: 12px; border: 1px solid #1E293B; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .badge {{ display: inline-block; background: rgba(14, 165, 233, 0.15); color: #0EA5E9; border: 1px solid rgba(14, 165, 233, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }}
        .title {{ font-size: 22px; font-weight: 700; color: #FFFFFF; margin: 0 0 8px 0; }}
        .desc {{ font-size: 14px; color: #94A3B8; line-height: 1.5; margin: 0 0 24px 0; }}
        .otp-box {{ background: #0A0F1D; border: 1px dashed #0EA5E9; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px; }}
        .otp-digits {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38BDF8; margin: 0; font-family: monospace; }}
        .validity {{ font-size: 12px; color: #64748B; margin-top: 8px; }}
        .disclaimer {{ border-top: 1px solid #1E293B; padding-top: 16px; font-size: 11px; color: #64748B; line-height: 1.4; }}
        .alert {{ color: #F59E0B; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="badge">NeuroScan AI • Clinical Research Prototype</div>
        <h1 class="title">Secure Authentication Code</h1>
        <p class="desc">You have requested a secure one-time verification code for access to the <strong>NeuroScan AI</strong> medical MRI analysis platform.</p>
        
        <div class="otp-box">
          <p class="otp-digits">{otp_code}</p>
          <div class="validity">Valid for <strong>{settings.OTP_EXPIRE_MINUTES} minutes</strong> • Do not share this code</div>
        </div>
        
        <p class="desc" style="font-size: 13px;">If you did not initiate this request, you can safely ignore this email. Multiple incorrect attempts will automatically lock this session.</p>
        
        <div class="disclaimer">
          <strong class="alert">Research Prototype Notice:</strong> NeuroScan AI is an educational and research decision-support prototype. It is not an FDA-cleared diagnostic device. AI outputs require qualified clinical review.
        </div>
      </div>
    </body>
    </html>
    """

    # If SMTP credentials are configured, deliver via TLS SMTP
    if settings.SMTP_USER and settings.SMTP_PASSWORD and settings.SMTP_PASSWORD != "your_app_password":
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL or settings.SMTP_USER}>"
            msg["To"] = recipient_email

            text_fallback = f"Your NeuroScan AI verification code is: {otp_code}. Valid for {settings.OTP_EXPIRE_MINUTES} minutes."
            msg.attach(MIMEText(text_fallback, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL or settings.SMTP_USER, [recipient_email], msg.as_string())
            server.quit()
            logger.info(f"Successfully sent OTP email to {recipient_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {recipient_email}: {str(e)}")
            # Fallback to local log
            print(f"\n=======================================================")
            print(f"[NEUROSCAN EMAIL FALLBACK] (SMTP Failed: {e})")
            print(f"To: {recipient_email}")
            print(f"OTP CODE: {otp_code} (Expires in {settings.OTP_EXPIRE_MINUTES} mins)")
            print(f"=======================================================\n")
            return False
    else:
        # Development / Demo mode: print clearly to terminal console
        print(f"\n=======================================================")
        print(f"[NEUROSCAN DEV EMAIL] SMTP credentials not set in .env")
        print(f"Recipient: {recipient_email}")
        print(f"Purpose:   {purpose}")
        print(f"6-Digit OTP: >>> {otp_code} <<< (Valid for {settings.OTP_EXPIRE_MINUTES} minutes)")
        print(f"=======================================================\n")
        return True

