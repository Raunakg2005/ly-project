from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timedelta
from pathlib import Path
import os
from app.database import get_database
from bson import ObjectId

class FileCleanupScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.cleanup_days = 30  # Delete files older than 30 days
        self.check_interval_hours = 24  # Run cleanup daily
    
    async def cleanup_old_files(self):
        """Clean up soft-deleted files older than 30 days"""
        print(f"🧹 Running file cleanup job at {datetime.utcnow()}")
        
        try:
            db = get_database()
            
            # Find soft-deleted documents older than 30 days
            cutoff_date = datetime.utcnow() - timedelta(days=self.cleanup_days)
            
            old_documents = await db.documents.find({
                "isDeleted": True,
                "deletedAt": {"$lt": cutoff_date}
            }).to_list(length=1000)
            
            deleted_count = 0
            for doc in old_documents:
                try:
                    # Delete file from disk
                    if os.path.exists(doc["storageUrl"]):
                        os.remove(doc["storageUrl"])
                    
                    # Delete thumbnail if exists
                    if doc.get("thumbnailUrl") and os.path.exists(doc["thumbnailUrl"]):
                        os.remove(doc["thumbnailUrl"])
                    
                    # Delete from database
                    await db.documents.delete_one({"_id": doc["_id"]})
                    deleted_count += 1
                
                except Exception as e:
                    print(f"❌ Error deleting document {doc['_id']}: {e}")
            
            print(f"✅ Cleanup complete: {deleted_count} files deleted")
            
        except Exception as e:
            print(f"❌ Cleanup job failed: {e}")
    
    async def cleanup_orphaned_files(self):
        """Clean up files on disk that don't have database records"""
        print(f"🔍 Scanning for orphaned files at {datetime.utcnow()}")
        
        try:
            db = get_database()
            upload_dir = Path("./uploads")
            
            if not upload_dir.exists():
                return
            
            # Get all file paths from database
            documents = await db.documents.find({}, {"storageUrl": 1}).to_list(length=None)
            db_files = set([doc["storageUrl"] for doc in documents])
            
            orphaned_count = 0
            for file_path in upload_dir.rglob("*"):
                if file_path.is_file():
                    file_path_str = str(file_path)
                    if file_path_str not in db_files:
                        # File exists on disk but not in database
                        try:
                            os.remove(file_path)
                            orphaned_count += 1
                        except Exception as e:
                            print(f"❌ Error deleting orphaned file {file_path}: {e}")
            
            print(f"✅ Orphan cleanup complete: {orphaned_count} files deleted")
            
        except Exception as e:
            print(f"❌ Orphan cleanup failed: {e}")
    
    def start(self):
        """Start the cleanup scheduler"""
        # Schedule cleanup jobs
        self.scheduler.add_job(
            self.cleanup_old_files,
            'interval',
            hours=self.check_interval_hours,
            id='cleanup_old_files'
        )
        
        self.scheduler.add_job(
            self.cleanup_orphaned_files,
            'interval',
            hours=self.check_interval_hours * 7,  # Weekly
            id='cleanup_orphaned_files'
        )
        
        self.scheduler.start()
        print(f"✅ File cleanup scheduler started (runs every {self.check_interval_hours}h)")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        print("🛑 File cleanup scheduler stopped")

# Singleton instance
cleanup_scheduler = FileCleanupScheduler()
