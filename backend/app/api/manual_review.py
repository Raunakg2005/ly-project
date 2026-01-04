from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.schemas.verification_model import VerificationUpdate
from app.core.security import decode_access_token
from app.database import get_database

router = APIRouter(prefix="/api/verification", tags=["Verification - Manual Review"])
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

async def get_user_role(user_id: str) -> str:
    """Get user role from database"""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user.get("role", "user") if user else "user"

@router.get("/queue/flagged")
async def get_flagged_documents(
    user_id: str = Depends(get_current_user_id),
    skip: int = 0,
    limit: int = 20
):
    """Get queue of flagged documents for manual review (Verifier/Admin only)"""
    
    # Check if user is verifier or admin
    role = await get_user_role(user_id)
    if role not in ['verifier', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verifiers can access review queue"
        )
    
    db = get_database()
    
    # Find documents with high risk or low authenticity
    query = {
        "$or": [
            {"aiAnalysis.riskLevel": {"$in": ["high", "critical"]}},
            {"aiAnalysis.authenticityScore": {"$lt": 70}},
            {"aiAnalysis.flags.0": {"$exists": True}}  # Has at least 1 flag
        ],
        "verificationStatus": {"$in": ["analyzed", "pending_review"]},
        "isDeleted": {"$ne": True}
    }
    
    cursor = db.documents.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    # Get total count
    total_count = await db.documents.count_documents(query)
    
    return {
        "total": total_count,
        "documents": [
            {
                "id": str(doc["_id"]),
                "fileName": doc["fileName"],
                "userId": str(doc["userId"]),
                "uploadedAt": doc["createdAt"],
                "aiAnalysis": doc.get("aiAnalysis"),
                "verificationStatus": doc.get("verificationStatus")
            }
            for doc in documents
        ]
    }

@router.post("/{document_id}/review")
async def manual_review(
    document_id: str,
    review: VerificationUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Manual review of a document by verifier"""
    
    # Check if user is verifier or admin
    role = await get_user_role(user_id)
    if role not in ['verifier', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verifiers can perform manual reviews"
        )
    
    db = get_database()
    
    document = await db.documents.find_one({"_id": ObjectId(document_id)})
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Get reviewer name
    reviewer = await db.users.find_one({"_id": ObjectId(user_id)})
    reviewer_name = reviewer.get("name", "Unknown") if reviewer else "Unknown"
    
    # Create review entry for history
    review_entry = {
        "reviewer_id": ObjectId(user_id),
        "reviewer_name": reviewer_name,
        "decision": review.decision,
        "notes": review.verifier_notes or "",
        "reviewed_at": datetime.utcnow()
    }
    
    # Update document status
    new_status = "verified" if review.decision == "approved" else "rejected"
    if review.decision == "flagged":
        new_status = "flagged"
    
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {
            "$set": {
                "verificationStatus": new_status,
                "updatedAt": datetime.utcnow()
            },
            "$push": {"review_history": review_entry},  # Add to review_history array
            "$inc": {"verificationCount": 1}
        }
    )
    
    return {
        "success": True,
        "message": f"Document {review.decision}",
        "verification": {
            "document_id": document_id,
            "verifier_id": user_id,
            "verifier_name": reviewer_name,
            "decision": review.decision,
            "notes": review.verifier_notes,
            "reviewed_at": datetime.utcnow().isoformat()
        }
    }

@router.post("/{document_id}/assign")
async def assign_verifier(
    document_id: str,
    verifier_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Assign a document to a specific verifier (Admin only)"""
    
    # Check if user is admin
    role = await get_user_role(user_id)
    if role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign verifiers"
        )
    
    db = get_database()
    
    # Verify verifier exists and has verifier role
    verifier = await db.users.find_one({"_id": ObjectId(verifier_id)})
    if not verifier or verifier.get("role") != "verifier":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verifier ID"
        )
    
    # Assign to document
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {
            "$set": {
                "assignedVerifier": verifier_id,
                "assignedAt": datetime.utcnow(),
                "verificationStatus": "assigned",
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "message": f"Document assigned to {verifier.get('name', 'verifier')}",
        "verifier": {
            "id": str(verifier["_id"]),
            "name": verifier.get("name"),
            "email": verifier.get("email")
        }
    }
