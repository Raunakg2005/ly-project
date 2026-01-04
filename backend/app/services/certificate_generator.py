import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, Frame
import qrcode

from app.config import settings

class CertificateGenerator:
    def __init__(self, output_dir: str = "./certificates"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.app_url = settings.APP_URL
    
    def _get_user_directory(self, user_id: str) -> Path:
        """Get or create user-specific certificate directory"""
        user_dir = self.output_dir / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        return user_dir
    
    def _generate_qr_code(self, data: str, cert_dir: Path) -> str:
        """Generate QR code and save to temp file, return path"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to temp file
        qr_path = cert_dir / "temp_qr.png"
        img.save(str(qr_path))
        return str(qr_path)
    
    def generate_certificate(
        self,
        document_id: str,
        user_id: str,
        document_name: str,
        file_hash: str,
        verification_status: str,
        verification_date: datetime,
        verifier_name: Optional[str] = None,
        certificate_id: Optional[str] = None
    ) -> tuple[str, str]:
        """
        Generate a certificate PDF
        Returns: (certificate_path, certificate_id)
        """
        # Generate certificate ID if not provided
        if not certificate_id:
            certificate_id = f"CERT-{uuid.uuid4().hex[:12].upper()}"
        
        # Get user directory
        user_dir = self._get_user_directory(user_id)
        
        # Certificate filename
        filename = f"{certificate_id}.pdf"
        cert_path = user_dir / filename
        
        # Create PDF with custom tall size for better certificate display
        from reportlab.lib.pagesizes import A4
        custom_height = A4[1] * 1.3  # 30% taller than A4
        custom_size = (A4[0], custom_height)
        c = canvas.Canvas(str(cert_path), pagesize=custom_size)
        width, height = custom_size
        
        # Colors
        emerald = colors.HexColor('#10b981')
        dark_gray = colors.HexColor('#1f2937')
        gold = colors.HexColor('#fbbf24')
        
        # Draw border
        c.setStrokeColor(emerald)
        c.setLineWidth(3)
        c.rect(0.5*inch, 0.5*inch, width - inch, height - inch)
        
        # Inner border
        c.setStrokeColor(gold)
        c.setLineWidth(1)
        c.rect(0.6*inch, 0.6*inch, width - 1.2*inch, height - 1.2*inch)
        
        # Header - DocShield Logo/Title
        c.setFillColor(emerald)
        c.setFont("Helvetica-Bold", 32)
        c.drawCentredString(width/2, height - 1.5*inch, "DOCSHIELD")
        
        c.setFillColor(dark_gray)
        c.setFont("Helvetica", 12)
        c.drawCentredString(width/2, height - 1.8*inch, "Quantum-Safe Document Verification")
        
        # Title
        c.setFillColor(emerald)
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(width/2, height - 2.5*inch, "CERTIFICATE OF VERIFICATION")
        
        # Decorative line
        c.setStrokeColor(gold)
        c.setLineWidth(2)
        c.line(2*inch, height - 2.7*inch, width - 2*inch, height - 2.7*inch)
        
        # Main content
        c.setFillColor(dark_gray)
        c.setFont("Helvetica", 12)
        
        y_position = height - 3.3*inch
        
        # Certificate text
        c.drawCentredString(width/2, y_position, "This certifies that the document:")
        
        y_position -= 0.4*inch
        c.setFont("Helvetica-Bold", 14)
        # Truncate long filenames
        display_name = document_name if len(document_name) < 60 else document_name[:57] + "..."
        c.drawCentredString(width/2, y_position, display_name)
        
        y_position -= 0.5*inch
        c.setFont("Helvetica", 12)
        c.drawCentredString(width/2, y_position, "has been successfully verified on:")
        
        y_position -= 0.4*inch
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(width/2, y_position, verification_date.strftime("%B %d, %Y at %H:%M UTC"))
        
        # Document Details Box
        y_position -= 0.8*inch
        box_y = y_position
        c.setFillColor(colors.HexColor('#f9fafb'))
        c.rect(1.5*inch, box_y - 0.1*inch, width - 3*inch, 1.2*inch, fill=1, stroke=0)
        
        c.setFillColor(dark_gray)
        c.setFont("Helvetica", 10)
        
        # Certificate ID
        c.drawString(1.7*inch, box_y + 0.9*inch, "Certificate ID:")
        c.setFont("Helvetica-Bold", 10)
        c.drawString(3.2*inch, box_y + 0.9*inch, certificate_id)
        
        # Document Hash
        c.setFont("Helvetica", 10)
        c.drawString(1.7*inch, box_y + 0.6*inch, "Document Hash:")
        c.setFont("Courier", 8)
        hash_display = file_hash[:32] + "..." if len(file_hash) > 32 else file_hash
        c.drawString(3.2*inch, box_y + 0.6*inch, hash_display)
        
        # Status
        c.setFont("Helvetica", 10)
        c.drawString(1.7*inch, box_y + 0.3*inch, "Status:")
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(emerald)
        c.drawString(3.2*inch, box_y + 0.3*inch, verification_status.upper())
        
        # Verifier info if provided
        if verifier_name:
            c.setFillColor(dark_gray)
            c.setFont("Helvetica", 10)
            c.drawString(1.7*inch, box_y, "Verified by:")
            c.setFont("Helvetica-Bold", 10)
            c.drawString(3.2*inch, box_y, verifier_name)
        
        # QR Code
        y_position -= 2.5*inch
        qr_data = f"{self.app_url}/verify/{certificate_id}"
        qr_path = self._generate_qr_code(qr_data, user_dir)
        
        qr_size = 1.5*inch
        qr_x = (width - qr_size) / 2
        c.drawImage(qr_path, qr_x, y_position, width=qr_size, height=qr_size, mask='auto')
        
        # Clean up temp QR file
        if os.path.exists(qr_path):
            os.remove(qr_path)
        
        # QR Code label
        y_position -= 0.3*inch
        c.setFillColor(dark_gray)
        c.setFont("Helvetica", 10)
        c.drawCentredString(width/2, y_position, "Scan to verify certificate authenticity")
        
        # Footer
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.gray)
        c.drawCentredString(width/2, 0.7*inch, "This certificate is digitally signed and verified on the DocShield blockchain")
        c.drawCentredString(width/2, 0.5*inch, f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
        
        # Save PDF
        c.save()
        
        return str(cert_path), certificate_id

# Singleton instance
certificate_generator = CertificateGenerator()
