import hashlib
import os
from datetime import datetime
from typing import Optional
from pathlib import Path

class FileManager:
    def __init__(self, upload_dir: str = "./uploads"):
        self.upload_dir = upload_dir
        self._ensure_upload_dir()
    
    def _ensure_upload_dir(self):
        """Create upload directory if it doesn't exist"""
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)
    
    def generate_filename(self, original_filename: str, user_id: str) -> str:
        """Generate unique filename with timestamp"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        ext = Path(original_filename).suffix
        safe_name = "".join(c for c in Path(original_filename).stem if c.isalnum() or c in ('_', '-'))
        return f"{user_id}_{timestamp}_{safe_name}{ext}"
    
    def get_user_directory(self, user_id: str) -> str:
        """Get or create user-specific upload directory"""
        now = datetime.utcnow()
        user_dir = Path(self.upload_dir) / user_id / str(now.year) / f"{now.month:02d}"
        user_dir.mkdir(parents=True, exist_ok=True)
        return str(user_dir)
    
    async def save_file(self, file_content: bytes, filename: str, user_id: str) -> tuple[str, str]:
        """
        Save file to disk
        Returns: (file_path, file_hash)
        """
        # Get user directory
        user_dir = self.get_user_directory(user_id)
        
        # Generate unique filename
        unique_filename = self.generate_filename(filename, user_id)
        file_path = os.path.join(user_dir, unique_filename)
        
        # Calculate SHA-256 hash
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return file_path, file_hash
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from disk"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file: {e}")
            return False
    
    def get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        return os.path.getsize(file_path)

# Singleton instance
file_manager = FileManager()
