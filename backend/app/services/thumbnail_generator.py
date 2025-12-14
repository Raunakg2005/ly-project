from PIL import Image
import io
import os
from pathlib import Path
from datetime import datetime

class ThumbnailGenerator:
    def __init__(self, thumbnail_dir: str = "./thumbnails"):
        self.thumbnail_dir = thumbnail_dir
        self.thumbnail_size = (300, 300)
        self._ensure_thumbnail_dir()
    
    def _ensure_thumbnail_dir(self):
        """Create thumbnail directory if it doesn't exist"""
        Path(self.thumbnail_dir).mkdir(parents=True, exist_ok=True)
    
    def get_user_thumbnail_dir(self, user_id: str) -> str:
        """Get or create user-specific thumbnail directory"""
        now = datetime.utcnow()
        thumb_dir = Path(self.thumbnail_dir) / user_id / str(now.year) / f"{now.month:02d}"
        thumb_dir.mkdir(parents=True, exist_ok=True)
        return str(thumb_dir)
    
    async def generate_thumbnail(
        self,
        file_content: bytes,
        filename: str,
        user_id: str
    ) -> str:
        """
        Generate thumbnail for image
        Returns thumbnail path
        """
        try:
            # Open image
            image = Image.open(io.BytesIO(file_content))
            
            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Generate thumbnail
            image.thumbnail(self.thumbnail_size, Image.Resampling.LANCZOS)
            
            # Save thumbnail
            thumb_dir = self.get_user_thumbnail_dir(user_id)
            thumb_filename = f"thumb_{filename}.jpg"
            thumb_path = os.path.join(thumb_dir, thumb_filename)
            
            image.save(thumb_path, "JPEG", quality=85, optimize=True)
            
            return thumb_path
        
        except Exception as e:
            print(f"❌ Thumbnail generation error: {e}")
            return None
    
    def delete_thumbnail(self, thumbnail_path: str) -> bool:
        """Delete thumbnail file"""
        try:
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting thumbnail: {e}")
            return False

# Singleton instance
thumbnail_generator = ThumbnailGenerator()
