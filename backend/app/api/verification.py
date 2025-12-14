from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from datetime import datetime
import time

from app.schemas.verification import AIAnalysisRequest, AIAnalysisResult, VerificationRequest, VerificationResponse
from app.core.security import decode_access_token
from app.database import get_database
from app.services.document_analyzer import document_analyzer

router = APIRouter(prefix="/api/verification", tags=["Verification"])
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
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return str(user["_id"])

@router.post("/analyze")
async def analyze_document(
    request: AIAnalysisRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Analyze document with AI"""
    db = get_database()
    
    # Get document
    document = await db.documents.find_one({
        "_id": ObjectId(request.document_id),
        "userId": ObjectId(user_id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if already analyzed
    if document.get("aiAnalysis"):
        return {
            "success": True,
            "message": "Document already analyzed",
            "analysis": document["aiAnalysis"],
            "cached": True
        }
    
    # Get extracted text
    extracted_text = document.get("extractedText", "")
    if not extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No text extracted from document. Cannot analyze."
        )
    
    # Analyze with AI
    start_time = time.time()
    analysis = await document_analyzer.analyze_document(
        extracted_text=extracted_text,
        file_name=document["fileName"],
        file_type=document["fileType"],
        category=document.get("metadata", {}).get("category", "other")
    )
    processing_time = time.time() - start_time
    analysis["processingTime"] = processing_time
    
    if not analysis.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {analysis.get('error', 'Unknown error')}"
        )
    
    # Save analysis to document
    analysis["analyzedAt"] = datetime.utcnow()
    await db.documents.update_one(
        {"_id": ObjectId(request.document_id)},
        {
            "$set": {
                "aiAnalysis": analysis,
                "verificationStatus": "analyzed",
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "message": "Document analyzed successfully",
        "analysis": analysis,
        "cached": False
    }

@router.post("/request", response_model=VerificationResponse)
async def request_verification(
    request: VerificationRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Request document verification"""
    db = get_database()
    
    # Get document
    document = await db.documents.find_one({
        "_id": ObjectId(request.document_id),
        "userId": ObjectId(user_id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Auto-analyze if not already analyzed
    if not document.get("aiAnalysis"):
        # Trigger analysis
        extracted_text = document.get("extractedText", "")
        if extracted_text:
            start_time = time.time()
            analysis = await document_analyzer.analyze_document(
                extracted_text=extracted_text,
                file_name=document["fileName"],
                file_type=document["fileType"],
                category=document.get("metadata", {}).get("category", "other")
            )
            analysis["processingTime"] = time.time() - start_time
            analysis["analyzedAt"] = datetime.utcnow()
            
            # Save analysis
            await db.documents.update_one(
                {"_id": ObjectId(request.document_id)},
                {"$set": {"aiAnalysis": analysis}}
            )
    
    # Update verification status
    await db.documents.update_one(
        {"_id": ObjectId(request.document_id)},
        {
            "$set": {
                "verificationStatus": "verified" if document.get("aiAnalysis", {}).get("authenticityScore", 0) > 70 else "pending_review",
                "verificationCount": document.get("verificationCount", 0) + 1,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    # Get updated document
    updated_doc = await db.documents.find_one({"_id": ObjectId(request.document_id)})
    
    return VerificationResponse(
        id=str(updated_doc["_id"]),
        document_id=request.document_id,
        status=updated_doc["verificationStatus"],
        created_at=updated_doc["createdAt"],
        analysis=AIAnalysisResult(**updated_doc["aiAnalysis"]) if updated_doc.get("aiAnalysis") else None
    )

@router.get("/{document_id}")
async def get_verification_status(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get verification status of a document"""
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
    
    return {
        "document_id": str(document["_id"]),
        "status": document.get("verificationStatus", "pending"),
        "analysis": document.get("aiAnalysis"),
        "verificationCount": document.get("verificationCount", 0)
    }
