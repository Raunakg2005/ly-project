from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import FileResponse
from bson import ObjectId
import os
from datetime import datetime, timedelta
import secrets

from app.core.security import decode_access_token
from app.database import get_database

router = APIRouter(prefix="/api/preview", tags=["Document Preview"])

# In-memory store for preview tokens (in production, use Redis)
preview_tokens = {}

@router.get("/{document_id}")
async def preview_document(
    document_id: str,
    token: str = Query(...)
):
    """Public endpoint for previewing documents using temporary token"""
    
    # Verify token
    if token not in preview_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired preview token"
        )
    
    token_data = preview_tokens[token]
    
    # Check if token is for this document
    if token_data["document_id"] != document_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not match document"
        )
    
    # Check if token expired
    if datetime.utcnow() > token_data["expires_at"]:
        del preview_tokens[token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Preview token expired"
        )
    
    db = get_database()
    
    # Get document
    document = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "userId": ObjectId(token_data["user_id"])
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    file_path = document["storageUrl"]
    
    # Debug logging
    print(f"Preview request for: {document['fileName']}")
    print(f"File path: {file_path}")
    print(f"File exists: {os.path.exists(file_path)}")
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found on server: {file_path}"
        )
    
    # Return file with inline content-disposition (for browser viewing, not download)
    return FileResponse(
        path=file_path,
        media_type=document["fileType"],
        headers={
            "Content-Disposition": f'inline; filename="{document["fileName"]}"'
        }
    )

@router.post("/token/{document_id}")
async def generate_preview_token(
    document_id: str,
    token: str = Query(...)
):
    """Generate a temporary preview token for a document"""
    
    # Decode JWT to get user
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication"
        )
    
    email = payload.get("sub")
    role = payload.get("role", "user")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication"
        )
    
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    user_id = str(user["_id"])
    
    # Verify document exists and check ownership/role
    document = await db.documents.find_one({"_id": ObjectId(document_id)})
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Allow if: user owns document OR user is verifier/admin
    doc_owner_id = str(document.get("userId"))
    is_owner = doc_owner_id == user_id
    is_verifier = role in ["verifier", "admin"]
    
    if not (is_owner or is_verifier):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to preview this document"
        )
    
    # Generate preview token (valid for 5 minutes)
    preview_token = secrets.token_urlsafe(32)
    preview_tokens[preview_token] = {
        "document_id": document_id,
        "user_id": doc_owner_id,  # Store original owner for file access
        "expires_at": datetime.utcnow() + timedelta(minutes=5)
    }
    
    return {
        "preview_token": preview_token,
        "expires_in": 300  # 5 minutes in seconds
    }
