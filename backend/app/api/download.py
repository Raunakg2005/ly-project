from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from datetime import datetime
import os

from app.core.security import decode_access_token
from app.database import get_database

router = APIRouter(prefix="/api/documents", tags=["Documents - Download"])
security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user ID from JWT token"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return str(user["_id"])

@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Download document file"""
    db = get_database()
    
    # Find document and verify ownership
    document = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "userId": ObjectId(user_id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    file_path = document["storageUrl"]
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    # Update download count
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {
            "$inc": {"downloadCount": 1},
            "$set": {"lastDownloadedAt": datetime.utcnow()}
        }
    )
    
    # Return file
    return FileResponse(
        path=file_path,
        filename=document["fileName"],
        media_type=document["fileType"]
    )
