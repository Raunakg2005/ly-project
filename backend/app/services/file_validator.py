import magic
from typing import Dict, Optional

class FileValidator:
    """Validate file types using magic numbers (file signatures)"""
    
    # Allowed MIME types
    ALLOWED_TYPES = {
        'application/pdf': 'PDF',
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    }
    
    # Suspicious patterns that might indicate malware
    SUSPICIOUS_PATTERNS = [
        b'<script',
        b'javascript:',
        b'eval(',
        b'exec(',
        b'__import__',
    ]
    
    def __init__(self):
        self.magic = magic.Magic(mime=True)
    
    def validate_file(self, file_content: bytes, declared_type: str) -> Dict:
        """
        Validate file type and check for suspicious content
        Returns: {valid: bool, actual_type: str, issues: []}
        """
        issues = []
        
        # Check for PDF by magic number first (more reliable than MIME type)
        is_pdf_by_magic = file_content.startswith(b'%PDF-')
        
        # Get actual file type from magic numbers
        try:
            actual_type = self.magic.from_buffer(file_content)
        except Exception as e:
            # If magic fails but we detected PDF by magic number, accept it
            if is_pdf_by_magic and declared_type == 'application/pdf':
                actual_type = 'application/pdf'
            else:
                return {
                    "valid": False,
                    "actual_type": None,
                    "declared_type": declared_type,
                    "issues": [f"Could not determine file type: {e}"],
                    "security_score": 0
                }
        
        # Override actual_type if we detected PDF by magic number
        # This handles cases where python-magic incorrectly identifies PDFs as text/plain
        if is_pdf_by_magic and declared_type == 'application/pdf':
            actual_type = 'application/pdf'
        
        # Check if actual type matches declared type
        if actual_type not in self.ALLOWED_TYPES:
            issues.append(f"File type not allowed: {actual_type}")
        
        # Check for type mismatch (spoofing attempt)
        # Skip this check if we detected PDF by magic number
        if declared_type and declared_type != actual_type and not is_pdf_by_magic:
            # Allow some MIME type variations
            if not self._is_type_variation(declared_type, actual_type):
                issues.append(f"Type mismatch: declared '{declared_type}' but actual is '{actual_type}'")
        
        # Scan for suspicious patterns
        suspicious = self._scan_for_threats(file_content)
        if suspicious:
            issues.extend(suspicious)
        
        # Calculate security score
        security_score = 100 - (len(issues) * 20)
        security_score = max(0, min(100, security_score))
        
        return {
            "valid": len(issues) == 0,
            "actual_type": actual_type,
            "declared_type": declared_type,
            "issues": issues,
            "security_score": security_score,
            "file_type_name": self.ALLOWED_TYPES.get(actual_type, "Unknown")
        }
    
    def _is_type_variation(self, type1: str, type2: str) -> bool:
        """Check if two MIME types are variations of the same type"""
        variations = [
            ('image/jpg', 'image/jpeg'),
            ('application/x-pdf', 'application/pdf'),
        ]
        
        for var1, var2 in variations:
            if (type1 == var1 and type2 == var2) or (type1 == var2 and type2 == var1):
                return True
        return False
    
    def _scan_for_threats(self, file_content: bytes) -> list:
        """Basic threat scanning for suspicious patterns"""
        threats = []
        
        # Only scan first 10KB for performance
        sample = file_content[:10240]
        
        for pattern in self.SUSPICIOUS_PATTERNS:
            if pattern in sample:
                threats.append(f"Suspicious pattern detected: {pattern.decode('utf-8', errors='ignore')}")
        
        return threats

# Singleton instance
file_validator = FileValidator()
