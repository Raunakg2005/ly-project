from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timedelta

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
    
    # Validate file with magic numbers and threat scan
    from app.services.file_validator import file_validator
    validation = file_validator.validate_file(file_content, file.content_type)
    
    if not validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File validation failed: {', '.join(validation['issues'])}"
        )
    
    if validation["security_score"] < 70:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File failed security check (score: {validation['security_score']}/100)"
        )
    
    try:
        # Save file and get hash
        file_path, file_hash = await file_manager.save_file(
            file_content, 
            file.filename, 
            user_id
        )
        
        # Check for duplicate file by hash
        db = get_database()
        user_obj_id = ObjectId(user_id)
        
        existing_doc = await db.documents.find_one({
            "userId": user_obj_id,
            "fileHash": file_hash
        })
        
        if existing_doc:
            # Delete the file we just saved since it's a duplicate
            file_manager.delete_file(file_path)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Duplicate file detected. A document with the same content already exists: {existing_doc.get('fileName', 'unknown')}"
            )
        
        # Extract text
        extracted_text = await extract_text(file_content, file.content_type)
        
        # Generate digital signature
        signature = signing_service.sign_hash(file_hash)
        
        # Generate thumbnail for images
        thumbnail_path = None
        if any(img_type in file.content_type.lower() for img_type in ['image', 'jpeg', 'jpg', 'png']):
            from app.services.thumbnail_generator import thumbnail_generator
            thumbnail_path = await thumbnail_generator.generate_thumbnail(
                file_content,
                file.filename,
                user_id
            )
        
        # Create document record
        document = {
            "userId": ObjectId(user_id),
            "fileName": file.filename,
            "originalName": file.filename,
            "fileSize": file_size,
            "fileType": file.content_type,
            "storageUrl": file_path,
            "thumbnailUrl": thumbnail_path,
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
            "version": 1,
            "isDeleted": False,
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

@router.get("/")
async def list_documents(
    user_id: str = Depends(get_current_user_id),
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    date_range: Optional[str] = None,
    sort_by: str = "createdAt",
    sort_order: str = "desc",
    page: int = 1,
    limit: int = 10,
    include_deleted: bool = False
):
    """
    List user's documents with search, filter, sort, and pagination
    
    Query Parameters:
    - search: Search by document name (case-insensitive)
    - status_filter: Filter by verification status (pending/analyzed/verified/flagged/all)
    - date_range: Filter by date (last7/last30/last90/all)
    - sort_by: Sort field (createdAt/fileName/fileSize)
    - sort_order: Sort order (asc/desc)
    - page: Page number (default: 1)
    - limit: Items per page (default: 10, max: 100)
    - include_deleted: Include deleted documents (default: false)
    """
    db = get_database()
    
    # Build query
    query = {"userId": ObjectId(user_id)}
    
    if not include_deleted:
        query["isDeleted"] = {"$ne": True}
    
    # Add search filter
    if search:
        query["fileName"] = {"$regex": search, "$options": "i"}
    
    # Add status filter
    if status_filter and status_filter != "all":
        query["verificationStatus"] = status_filter
    
    # Add date range filter
    if date_range and date_range != "all":
        now = datetime.utcnow()
        date_map = {
            "last7": now - timedelta(days=7),
            "last30": now - timedelta(days=30),
            "last90": now - timedelta(days=90)
        }
        if date_range in date_map:
            query["createdAt"] = {"$gte": date_map[date_range]}
    
    # Calculate pagination
    limit = min(limit, 100)  # Max 100 items per page
    skip = (page - 1) * limit
    
    # Build sort
    sort_direction = 1 if sort_order == "asc" else -1
    
    # Get documents
    cursor = db.documents.find(query).sort(sort_by, sort_direction).skip(skip).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    # Helper function to serialize review history
    def serialize_review_history(history):
        if not history:
            return []
        return [
            {
                "reviewer_id": str(item.get("reviewer_id", "")),
                "reviewer_name": item.get("reviewer_name", ""),
                "decision": item.get("decision", ""),
                "notes": item.get("notes", ""),
                "reviewed_at": item.get("reviewed_at").isoformat() if item.get("reviewed_at") else None
            }
            for item in history
        ]
    
    # Build response with review history
    result = []
    for doc in documents:
        result.append({
            "id": str(doc["_id"]),
            "fileName": doc["fileName"],
            "fileSize": doc["fileSize"],
            "fileType": doc["fileType"],
            "category": doc["metadata"].get("category", "other"),
            "uploadedAt": doc["createdAt"].isoformat(),
            "verificationStatus": doc["verificationStatus"],
            "fileHash": doc["fileHash"],
            "reviewHistory": serialize_review_history(doc.get("review_history", []))
        })
    
    return result

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
    
    # Serialize review history
    review_history = document.get("review_history", [])
    serialized_reviews = []
    if review_history:
        for review in review_history:
            serialized_reviews.append({
                "reviewer_id": str(review.get("reviewer_id", "")),
                "reviewer_name": review.get("reviewer_name", ""),
                "decision": review.get("decision", ""),
                "notes": review.get("notes", ""),
                "reviewed_at": review.get("reviewed_at").isoformat() if review.get("reviewed_at") else None
            })
    
    document["_id"] = str(document["_id"])
    document["userId"] = str(document["userId"])
    document["reviewHistory"] = serialized_reviews
    
    return document

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    hard_delete: bool = False,
    user_id: str = Depends(get_current_user_id)
):
    """Delete document (soft delete by default)"""
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
    
    if hard_delete:
        # Hard delete - remove file and database entry
        file_manager.delete_file(document["storageUrl"])
        
        # Delete thumbnail if exists
        if document.get("thumbnailUrl"):
            from app.services.thumbnail_generator import thumbnail_generator
            thumbnail_generator.delete_thumbnail(document["thumbnailUrl"])
        
        await db.documents.delete_one({"_id": ObjectId(document_id)})
        return {"success": True, "message": "Document permanently deleted"}
    else:
        # Soft delete - mark as deleted
        await db.documents.update_one(
            {"_id": ObjectId(document_id)},
            {
                "$set": {
                    "isDeleted": True,
                    "deletedAt": datetime.utcnow(),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        return {"success": True, "message": "Document moved to trash"}
