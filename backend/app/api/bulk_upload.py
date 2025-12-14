from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from bson import ObjectId
from datetime import datetime

from app.schemas.document import UploadResponse, DocumentResponse
from app.core.security import decode_access_token
from app.database import get_database
from app.services.file_manager import file_manager
from app.services.text_extractor import extract_text
from app.services.signing_service import signing_service
from app.config import settings

router = APIRouter(prefix="/api/documents", tags=["Documents - Bulk Upload"])
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

@router.post("/upload/bulk")
async def upload_multiple_documents(
    files: List[UploadFile] = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload multiple documents at once"""
    
    if len(files) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 files allowed per upload"
        )
    
    results = []
    errors = []
    
    for file in files:
        try:
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            # Validate file size
            if file_size > settings.MAX_FILE_SIZE:
                errors.append({
                    "file": file.filename,
                    "error": f"File too large. Max size: {settings.MAX_FILE_SIZE} bytes"
                })
                continue
            
            # Validate file type
            allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
            if file.content_type not in allowed_types:
                errors.append({
                    "file": file.filename,
                    "error": f"File type not supported. Allowed: PDF, JPG, PNG"
                })
                continue
            
            # Save file and get hash
            file_path, file_hash = await file_manager.save_file(
                file_content, 
                file.filename, 
                user_id
            )
            
            # Extract text
            extracted_text = await extract_text(file_content, file.content_type)
            
            # Generate digital signature
            signature = signing_service.sign_hash(file_hash)
            
            # Create document record
            document = {
                "userId": ObjectId(user_id),
                "fileName": file.filename,
                "originalName": file.filename,
                "fileSize": file_size,
                "fileType": file.content_type,
                "storageUrl": file_path,
                "fileHash": file_hash,
                "quantumSignature": signature,
                "metadata": {
                    "uploadedAt": datetime.utcnow(),
                    "category": "other",
                    "tags": []
                },
                "extractedText": extracted_text,
                "verificationStatus": "pending",
                "verificationCount": 0,
                "downloadCount": 0,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
            
            # Insert into database
            db = get_database()
            result = await db.documents.insert_one(document)
            
            results.append(DocumentResponse(
                id=str(result.inserted_id),
                fileName=file.filename,
                fileSize=file_size,
                fileType=file.content_type,
                category="other",
                uploadedAt=document["createdAt"],
                verificationStatus="pending",
                fileHash=file_hash
            ))
        
        except Exception as e:
            errors.append({
                "file": file.filename,
                "error": str(e)
            })
    
    return {
        "success": len(results) > 0,
        "uploaded": len(results),
        "failed": len(errors),
        "documents": results,
        "errors": errors
    }
