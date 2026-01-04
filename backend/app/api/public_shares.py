from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from bson import ObjectId
from datetime import datetime
import bcrypt

from app.schemas.share import PublicShareResponse
from app.database import get_database

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/share/{share_id}", response_model=PublicShareResponse)
async def get_public_share(
    share_id: str,
    password: Optional[str] = Query(None)
):
    """
    Public endpoint to access a shared document
    No authentication required
    """
    db = get_database()
    
    # Find the share
    share = await db.shares.find_one({
        "share_id": share_id,
        "is_revoked": False
    })
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or has been revoked"
        )
    
    # Check expiration
    if share.get("expires_at"):
        if datetime.utcnow() > share["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Share link has expired"
            )
    
    # Check password if protected
    if share.get("password_hash"):
        if not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password required"
            )
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), share["password_hash"].encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )
    
    # Get document details
    document = await db.documents.find_one({"_id": share["document_id"]})
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Increment view count
    await db.shares.update_one(
        {"_id": share["_id"]},
        {
            "$inc": {"view_count": 1},
            "$set": {"last_viewed_at": datetime.utcnow()}
        }
    )
    
    # Get creator name (optional)
    creator = await db.users.find_one({"_id": share["user_id"]})
    creator_name = creator.get("name") if creator else None
    
    # Build download URL if allowed
    download_url = None
    if share["allow_download"]:
        download_url = f"/api/public/share/{share_id}/download"
    
    return PublicShareResponse(
        document_id=str(document["_id"]),
        file_name=document["fileName"],
        file_size=document["fileSize"],
        file_type=document["fileType"],
        verification_status=document["verificationStatus"],
        allow_download=share["allow_download"],
        download_url=download_url,
        created_by_name=creator_name
    )


@router.get("/share/{share_id}/download")
async def download_shared_document(
    share_id: str,
    password: Optional[str] = Query(None)
):
    """
    Download a shared document
    No authentication required
    """
    from fastapi.responses import FileResponse
    
    db = get_database()
    
    # Find the share
    share = await db.shares.find_one({
        "share_id": share_id,
        "is_revoked": False
    })
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found or has been revoked"
        )
    
    # Check expiration
    if share.get("expires_at"):
        if datetime.utcnow() > share["expires_at"]:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="Share link has expired"
            )
    
    # Check password if protected
    if share.get("password_hash"):
        if not password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Password required"
            )
        
        if not bcrypt.checkpw(password.encode('utf-8'), share["password_hash"].encode('utf-8')):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )
    
    # Check download permission
    if not share.get("allow_download", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Download not allowed for this share"
        )
    
    # Get document
    document = await db.documents.find_one({"_id": share["document_id"]})
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Return file
    file_path = document["storageUrl"]
    
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    return FileResponse(
        path=file_path,
        filename=document["fileName"],
        media_type=document["fileType"]
    )
