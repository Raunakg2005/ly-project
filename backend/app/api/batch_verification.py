from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from bson import ObjectId
from datetime import datetime
import time
import asyncio

from app.schemas.verification import AIAnalysisRequest
from app.core.security import decode_access_token
from app.database import get_database
from app.services.document_analyzer import document_analyzer

router = APIRouter(prefix="/api/verification", tags=["Verification - Batch"])
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

@router.post("/analyze/batch")
async def batch_analyze_documents(
    document_ids: List[str],
    user_id: str = Depends(get_current_user_id)
):
    """Analyze multiple documents in batch"""
    
    if len(document_ids) > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 documents per batch"
        )
    
    db = get_database()
    results = []
    errors = []
    
    for doc_id in document_ids:
        try:
            # Get document
            document = await db.documents.find_one({
                "_id": ObjectId(doc_id),
                "userId": ObjectId(user_id)
            })
            
            if not document:
                errors.append({
                    "document_id": doc_id,
                    "error": "Document not found"
                })
                continue
            
            # Skip if already analyzed
            if document.get("aiAnalysis"):
                results.append({
                    "document_id": doc_id,
                    "status": "cached",
                    "analysis": document["aiAnalysis"]
                })
                continue
            
            # Get extracted text
            extracted_text = document.get("extractedText", "")
            if not extracted_text:
                errors.append({
                    "document_id": doc_id,
                    "error": "No text extracted"
                })
                continue
            
            # Analyze
            start_time = time.time()
            analysis = await document_analyzer.analyze_document(
                extracted_text=extracted_text,
                file_name=document["fileName"],
                file_type=document["fileType"],
                category=document.get("metadata", {}).get("category", "other")
            )
            analysis["processingTime"] = time.time() - start_time
            analysis["analyzedAt"] = datetime.utcnow()
            
            if analysis.get("success"):
                # Save analysis
                await db.documents.update_one(
                    {"_id": ObjectId(doc_id)},
                    {
                        "$set": {
                            "aiAnalysis": analysis,
                            "verificationStatus": "analyzed",
                            "updatedAt": datetime.utcnow()
                        }
                    }
                )
                
                results.append({
                    "document_id": doc_id,
                    "status": "analyzed",
                    "analysis": analysis
                })
            else:
                errors.append({
                    "document_id": doc_id,
                    "error": analysis.get("error", "Analysis failed")
                })
            
            # Small delay to avoid API rate limits
            await asyncio.sleep(0.5)
        
        except Exception as e:
            errors.append({
                "document_id": doc_id,
                "error": str(e)
            })
    
    return {
        "success": len(results) > 0,
        "analyzed": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    }
