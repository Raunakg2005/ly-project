from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from bson import ObjectId
from datetime import datetime

from app.schemas.document import DocumentResponse, UploadResponse
from app.core.security import decode_access_token
from app.database import get_database
from app.services.file_manager import file_manager
from app.services.text_extractor import extract_text
from app.services.signing_service import signing_service
from app.config import settings

router = APIRouter(prefix="/api/documents", tags=["Documents"])
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
    
    # Get user ID from database
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return str(user["_id"])

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    """Upload a document"""
    
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Validate file type
    allowed_types = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed: PDF, JPG, PNG"
        )
    
    try:
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
        
        # Return response
        return UploadResponse(
            success=True,
            message="Document uploaded successfully",
            document=DocumentResponse(
                id=str(result.inserted_id),
                fileName=file.filename,
                fileSize=file_size,
                fileType=file.content_type,
                category="other",
                uploadedAt=document["createdAt"],
                verificationStatus="pending",
                fileHash=file_hash
            )
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 20
):
    """List user's documents"""
    db = get_database()
    
    cursor = db.documents.find(
        {"userId": ObjectId(user_id)}
    ).sort("createdAt", -1).skip(skip).limit(limit)
    
    documents = await cursor.to_list(length=limit)
    
    return [
        DocumentResponse(
            id=str(doc["_id"]),
            fileName=doc["fileName"],
            fileSize=doc["fileSize"],
            fileType=doc["fileType"],
            category=doc["metadata"].get("category", "other"),
            uploadedAt=doc["createdAt"],
            verificationStatus=doc["verificationStatus"],
            fileHash=doc["fileHash"]
        )
        for doc in documents
    ]

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get document by ID"""
    db = get_database()
    
    document = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "userId": ObjectId(user_id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document["_id"] = str(document["_id"])
    document["userId"] = str(document["userId"])
    
    return document

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete document"""
    db = get_database()
    
    # Find document
    document = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "userId": ObjectId(user_id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Delete file from disk
    file_manager.delete_file(document["storageUrl"])
    
    # Delete from database
    await db.documents.delete_one({"_id": ObjectId(document_id)})
    
    return {"success": True, "message": "Document deleted successfully"}
