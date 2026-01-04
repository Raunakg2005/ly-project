from fastapi import APIRouter, HTTPException
from app.services.email_service import email_service
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/test", tags=["testing"])

class TestEmailRequest(BaseModel):
    to_email: EmailStr
    test_type: str = "verified"  # verified or certificate

@router.post("/send-email")
async def test_send_email(request: TestEmailRequest):
    """
    Test endpoint to send notification emails.
    test_type: 'verified' or 'certificate'
    """
    try:
        if request.test_type == "verified":
            html = email_service.get_document_verified_template(
                user_name="Test User",
                document_name="test_document.pdf"
            )
            subject = "✅ Document Verified - DocShield"
        elif request.test_type == "certificate":
            html = email_service.get_certificate_ready_template(
                user_name="Test User",
                document_name="test_document.pdf",
                certificate_id="CERT-TEST123"
            )
            subject = "🏆 Certificate Ready - DocShield"
        else:
            raise HTTPException(status_code=400, detail="Invalid test_type. Use 'verified' or 'certificate'")
        
        success = await email_service.send_email(
            to=request.to_email,
            subject=subject,
            html=html
        )
        
        if success:
            return {
                "success": True,
                "message": f"Test email sent to {request.to_email}",
                "type": request.test_type
            }
        else:
            raise HTTPException(status_code=500, detail="Email sending failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
