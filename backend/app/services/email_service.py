import httpx
from typing import Dict, Optional
from app.config import settings

class EmailService:
    """Service for sending emails via Next.js API"""
    
    def __init__(self):
        # Next.js API endpoint (adjust port if different)
        self.api_url = f"{settings.APP_URL}/api/send-email"
    
    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        from_email: Optional[str] = None
    ) -> bool:
        """
        Send email via Next.js API
        
        Args:
            to: Recipient email
            subject: Email subject
            html: HTML email body
            from_email: Optional sender email
            
        Returns:
            bool: True if sent successfully
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    json={
                        "to": to,
                        "subject": subject,
                        "html": html,
                        "from": from_email
                    }
                )
                
                if response.status_code == 200:
                    print(f"✅ Email sent to {to}: {subject}")
                    return True
                else:
                    print(f"❌ Email failed: {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Email error: {str(e)}")
            return False
    
    def get_document_verified_template(
        self,
        user_name: str,
        document_name: str
    ) -> str:
        """Generate HTML for document verified email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Document Verified!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Great news! Your document <strong>{document_name}</strong> has been successfully verified.</p>
                    <p>You can now:</p>
                    <ul>
                        <li>Download your verification certificate</li>
                        <li>View verification details</li>
                        <li>Share your verified document</li>
                    </ul>
                    <a href="{settings.APP_URL}/documents" class="button">View Document</a>
                </div>
                <div class="footer">
                    <p>DocShield - Quantum-Safe Document Verification</p>
                    <p>You're receiving this because you enabled document verification notifications.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def get_certificate_ready_template(
        self,
        user_name: str,
        document_name: str,
        certificate_id: str
    ) -> str:
        """Generate HTML for certificate ready email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .cert-id {{ background: #e0e7ff; padding: 10px; border-left: 4px solid #8b5cf6; margin: 15px 0; font-family: monospace; }}
                .button {{ display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏆 Certificate Ready!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Your verification certificate for <strong>{document_name}</strong> is ready to download!</p>
                    <div class="cert-id">
                        <strong>Certificate ID:</strong> {certificate_id}
                    </div>
                    <p>This certificate includes:</p>
                    <ul>
                        <li>QR code for instant verification</li>
                        <li>Unique certificate ID</li>
                        <li>Verification timestamp</li>
                        <li>Digital signature</li>
                    </ul>
                    <a href="{settings.APP_URL}/documents" class="button">Download Certificate</a>
                </div>
                <div class="footer">
                    <p>DocShield - Quantum-Safe Document Verification</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def get_document_rejected_template(
        self,
        user_name: str,
        document_name: str,
        reviewer_notes: str,
        reviewer_name: str = "Verifier"
    ) -> str:
        """Generate HTML for document rejected email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .reason-box {{ background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }}
                .button {{ display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>❌ Document Rejected</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Unfortunately, your document <strong>{document_name}</strong> has been rejected during verification.</p>
                    <div class="reason-box">
                        <strong>Reason:</strong><br>
                        {reviewer_notes}
                    </div>
                    <p><strong>Reviewed by:</strong> {reviewer_name}</p>
                    <p>You can:</p>
                    <ul>
                        <li>Review the rejection reason above</li>
                        <li>Upload a corrected version of the document</li>
                        <li>Contact support if you believe this is an error</li>
                    </ul>
                    <a href="{settings.APP_URL}/documents" class="button">View Documents</a>
                </div>
                <div class="footer">
                    <p>DocShield - Quantum-Safe Document Verification</p>
                    <p>You're receiving this because you enabled document verification notifications.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def get_document_flagged_template(
        self,
        user_name: str,
        document_name: str,
        reviewer_notes: str,
        reviewer_name: str = "Verifier"
    ) -> str:
        """Generate HTML for document flagged email"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .warning-box {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
                .button {{ display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Document Flagged for Review</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Your document <strong>{document_name}</strong> has been flagged during verification and requires additional review.</p>
                    <div class="warning-box">
                        <strong>Verifier Notes:</strong><br>
                        {reviewer_notes}
                    </div>
                    <p><strong>Reviewed by:</strong> {reviewer_name}</p>
                    <p>What this means:</p>
                    <ul>
                        <li>Your document requires further verification</li>
                        <li>A verifier has noted concerns that need to be addressed</li>
                        <li>You may be asked to provide additional information</li>
                        <li>The document is currently on hold pending review</li>
                    </ul>
                    <p>We'll notify you once the review is complete.</p>
                    <a href="{settings.APP_URL}/documents" class="button">View Document Status</a>
                </div>
                <div class="footer">
                    <p>DocShield - Quantum-Safe Document Verification</p>
                    <p>You're receiving this because you enabled document verification notifications.</p>
                </div>
            </div>
        </body>
        </html>
        """

# Singleton instance
email_service = EmailService()
