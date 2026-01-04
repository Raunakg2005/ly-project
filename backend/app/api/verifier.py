from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timedelta

from app.core.security import decode_access_token
from app.database import get_database

router = APIRouter(prefix="/api/verifier", tags=["Verifier"])
security = HTTPBearer()


async def get_current_user_with_role(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user and verify verifier/admin role"""
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
    
    # Check role
    role = user.get("role", "user")
    if role not in ["verifier", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Verifier or admin role required"
        )
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", "Unknown"),
        "role": role
    }


@router.get("/documents")
async def get_all_documents(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    date_range: Optional[str] = None,
    sort_by: str = "uploadedAt",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user_with_role)
):
    """Get all documents in the system (verifier access)"""
    db = get_database()
    
    # Build query
    query = {}
    
    if search:
        query["$or"] = [
            {"fileName": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    
    if status_filter and status_filter != "all":
        query["verificationStatus"] = status_filter
    
    if date_range and date_range != "all":
        now = datetime.utcnow()
        if date_range == "today":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif date_range == "week":
            start = now - timedelta(days=7)
        elif date_range == "month":
            start = now - timedelta(days=30)
        else:
            start = None
        
        if start:
            query["uploadedAt"] = {"$gte": start}
    
    # Get total count
    total = await db.documents.count_documents(query)
    
    # Sort options
    sort_direction = -1 if sort_order == "desc" else 1
    sort_field = sort_by if sort_by in ["uploadedAt", "fileName", "fileSize"] else "uploadedAt"
    
    # Get documents
    skip = (page - 1) * limit
    docs = await db.documents.find(query).sort(sort_field, sort_direction).skip(skip).limit(limit).to_list(length=limit)
    
    # Serialize documents
    result = []
    for doc in docs:
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(doc.get("userId"))}) if doc.get("userId") else None
        
        # Serialize review history
        review_history = []
        for review in doc.get("review_history", []):
            review_history.append({
                "reviewer_id": str(review["reviewer_id"]),
                "reviewer_name": review.get("reviewer_name", "Unknown"),
                "decision": review["decision"],
                "notes": review.get("notes", ""),
                "reviewed_at": review["reviewed_at"].isoformat() if "reviewed_at" in review else ""
            })
        
        result.append({
            "id": str(doc["_id"]),
            "fileName": doc.get("fileName", "Unknown"),
            "fileSize": doc.get("fileSize", 0),
            "fileType": doc.get("fileType", "unknown"),
            "category": doc.get("category", "uncategorized"),
            "uploadedAt": doc["uploadedAt"].isoformat() if "uploadedAt" in doc else datetime.utcnow().isoformat(),
            "verificationStatus": doc.get("verificationStatus", "pending"),
            "fileHash": doc.get("fileHash", ""),
            "userId": str(doc["userId"]) if doc.get("userId") else "",
            "userName": user.get("name", "Unknown") if user else "Unknown",
            "reviewHistory": review_history
        })
    
    return {
        "documents": result,
        "total": total,
        "page": page,
        "totalPages": (total + limit - 1) // limit
    }


@router.get("/stats")
async def get_verifier_stats(current_user: dict = Depends(get_current_user_with_role)):
    """Get verifier statistics"""
    db = get_database()
    
    # Count pending documents (pending + flagged) - exclude deleted
    pending_count = await db.documents.count_documents({
        "verificationStatus": {"$in": ["pending", "flagged"]},
        "$or": [{"isDeleted": {"$exists": False}}, {"isDeleted": False}]
    })
    
    # Get user's review history
    verifier_id = ObjectId(current_user["id"])
    
    # Count reviews today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    reviewed_today = await db.documents.count_documents({
        "review_history.reviewer_id": verifier_id,
        "review_history.reviewed_at": {"$gte": today_start}
    })
    
    # Count reviews this week
    week_start = today_start - timedelta(days=today_start.weekday())
    reviewed_this_week = await db.documents.count_documents({
        "review_history.reviewer_id": verifier_id,
        "review_history.reviewed_at": {"$gte": week_start}
    })
    
    # Count total reviews
    reviewed_total = await db.documents.count_documents({
        "review_history.reviewer_id": verifier_id
    })
    
    # Calculate approval rate
    approved_count = await db.documents.count_documents({
        "review_history": {
            "$elemMatch": {
                "reviewer_id": verifier_id,
                "decision": "approved"
            }
        }
    })
    
    approval_rate = (approved_count / reviewed_total * 100) if reviewed_total > 0 else 0
    
    return {
        "pending_count": pending_count,
        "reviewed_today": reviewed_today,
        "reviewed_this_week": reviewed_this_week,
        "reviewed_total": reviewed_total,
        "approval_rate": round(approval_rate, 1)
    }


@router.get("/queue")
async def get_review_queue(
    status_filter: Optional[str] = Query("all", regex="^(all|pending|flagged)$"),
    sort_by: Optional[str] = Query("oldest", regex="^(oldest|newest)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user_with_role)
):
    """Get pending documents queue for review"""
    db = get_database()
    
    # Build query - exclude deleted documents
    query = {"$or": [{"isDeleted": {"$exists": False}}, {"isDeleted": False}]}
    
    if status_filter == "all":
        query["verificationStatus"] = {"$in": ["pending", "flagged"]}
    else:
        query["verificationStatus"] = status_filter
    
    # Sort
    sort_direction = 1 if sort_by == "oldest" else -1
    
    # Get documents with pagination
    skip = (page - 1) * limit
    cursor = db.documents.find(query).sort("createdAt", sort_direction).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    
    # Get total count
    total = await db.documents.count_documents(query)
    
    # Enrich with user info
    result_docs = []
    for doc in docs:
        # Get user info
        user = await db.users.find_one({"_id": doc["userId"]})
        
        # Calculate waiting time
        upload_time = doc["createdAt"]
        waiting_time = datetime.utcnow() - upload_time
        
        if waiting_time.days > 0:
            waiting_str = f"{waiting_time.days} days"
        elif waiting_time.seconds >= 3600:
            hours = waiting_time.seconds // 3600
            waiting_str = f"{hours} hours"
        else:
            minutes = waiting_time.seconds // 60
            waiting_str = f"{minutes} minutes"
        
        # Serialize review history
        review_history = doc.get("review_history", [])
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
        
        result_docs.append({
            "id": str(doc["_id"]),
            "file_name": doc["fileName"],
            "file_size": doc["fileSize"],
            "file_type": doc["fileType"],
            "verification_status": doc["verificationStatus"],
            "uploaded_at": doc["createdAt"].isoformat(),
            "reviewHistory": serialized_reviews,  # Add review history
            "user": {
                "id": str(user["_id"]) if user else None,
                "name": user.get("name", "Unknown") if user else "Unknown",
                "email": user.get("email", "") if user else ""
            },
            "waiting_time": waiting_str
        })
    
    return {
        "documents": result_docs,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


@router.post("/quick-review/{document_id}")
async def quick_review(
    document_id: str,
    decision: str = Query(..., regex="^(approved|rejected)$"),
    notes: Optional[str] = None,
    current_user: dict = Depends(get_current_user_with_role)
):
    """Quick review action without modal"""
    db = get_database()
    
    # Get document
    document = await db.documents.find_one({"_id": ObjectId(document_id)})
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if already reviewed
    if document["verificationStatus"] not in ["pending", "flagged"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document already reviewed"
        )
    
    # Update document
    new_status = "verified" if decision == "approved" else "rejected"
    
    review_entry = {
        "reviewer_id": ObjectId(current_user["id"]),
        "reviewer_name": current_user["name"],
        "decision": decision,
        "notes": notes or f"Quick {decision}",
        "reviewed_at": datetime.utcnow()
    }
    
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {
            "$set": {
                "verificationStatus": new_status,
                "reviewedAt": datetime.utcnow(),
                "reviewedBy": current_user["name"]
            },
            "$push": {"review_history": review_entry}
        }
    )
    
    return {
        "success": True,
        "message": f"Document {decision}",
        "new_status": new_status
    }


@router.get("/history")
async def get_review_history(
    decision: Optional[str] = Query("all", regex="^(all|approved|rejected)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user_with_role)
):
    """Get review history for current verifier"""
    db = get_database()
    
    verifier_id = ObjectId(current_user["id"])
    
    # Build query
    query = {"review_history.reviewer_id": verifier_id}
    
    # Get documents
    skip = (page - 1) * limit
    docs = await db.documents.find(query).sort("review_history.reviewed_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Filter by decision and format
    result = []
    for doc in docs:
        # Find this verifier's review
        review = next(
            (r for r in doc.get("review_history", []) if r["reviewer_id"] == verifier_id),
            None
        )
        
        if review and (decision == "all" or review["decision"] == decision):
            result.append({
                "document_id": str(doc["_id"]),
                "file_name": doc["fileName"],
                "decision": review["decision"],
                "notes": review.get("notes", ""),
                "reviewed_at": review["reviewed_at"].isoformat()
            })
    
    total = len(result)
    
    return {
        "reviews": result,
        "total": total,
        "page": page
    }
