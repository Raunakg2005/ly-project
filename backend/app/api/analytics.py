from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from bson import ObjectId
from datetime import datetime, timedelta

from app.core.security import decode_access_token
from app.database import get_database

router = APIRouter(prefix="/api/verifier", tags=["Verifier Analytics"])
security = HTTPBearer()

async def get_current_user_with_role(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user with role verification"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    email = payload.get("sub")
    role = payload.get("role", "user")
    
    if role not in ["verifier", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verifiers can access this endpoint"
        )
    
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return {"id": str(user["_id"]), "email": email, "role": role}


@router.get("/analytics")
async def get_verifier_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user_with_role)
):
    """Get analytics data for verifier dashboard"""
    db = get_database()
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get all documents with review history in the date range
    pipeline = [
        {
            "$match": {
                "review_history": {"$exists": True, "$ne": []}
            }
        },
        {"$unwind": "$review_history"},
        {
            "$match": {
                "review_history.reviewed_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_reviews": {"$sum": 1},
                "approved": {
                    "$sum": {"$cond": [{"$eq": ["$review_history.decision", "approved"]}, 1, 0]}
                },
                "rejected": {
                    "$sum": {"$cond": [{"$eq": ["$review_history.decision", "rejected"]}, 1, 0]}
                },
                "flagged": {
                    "$sum": {"$cond": [{"$eq": ["$review_history.decision", "flagged"]}, 1, 0]}
                }
            }
        }
    ]
    
    overview_result = await db.documents.aggregate(pipeline).to_list(length=1)
    
    if not overview_result:
        overview = {
            "total_reviews": 0,
            "approved": 0,
            "rejected": 0,
            "flagged": 0,
            "approval_rate": 0
        }
    else:
        stats = overview_result[0]
        total = stats["total_reviews"]
        overview = {
            "total_reviews": total,
            "approved": stats["approved"],
            "rejected": stats["rejected"],
            "flagged": stats["flagged"],
            "approval_rate": round((stats["approved"] / total * 100) if total > 0 else 0, 1)
        }
    
    # Get daily trends
    daily_pipeline = [
        {
            "$match": {
                "review_history": {"$exists": True, "$ne": []}
            }
        },
        {"$unwind": "$review_history"},
        {
            "$match": {
                "review_history.reviewed_at": {"$gte": start_date, "$lte": end_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$review_history.reviewed_at"
                    }
                },
                "total": {"$sum": 1},
                "approved": {
                    "$sum": {"$cond": [{"$eq": ["$review_history.decision", "approved"]}, 1, 0]}
                },
                "rejected": {
                    "$sum": {"$cond": [{"$eq": ["$review_history.decision", "rejected"]}, 1, 0]}
                },
                "flagged": {
                    "$sum": {"$cond": [{"$eq": ["$review_history.decision", "flagged"]}, 1, 0]}
                }
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    daily_results = await db.documents.aggregate(daily_pipeline).to_list(length=None)
    daily_trends = [
        {
            "date": result["_id"],
            "total": result["total"],
            "approved": result["approved"],
            "rejected": result["rejected"],
            "flagged": result["flagged"]
        }
        for result in daily_results
    ]
    
    # Get recent activity (last 20 reviews)
    recent_pipeline = [
        {
            "$match": {
                "review_history": {"$exists": True, "$ne": []}
            }
        },
        {"$unwind": "$review_history"},
        {
            "$match": {
                "review_history.reviewed_at": {"$gte": start_date}
            }
        },
        {
            "$project": {
                "fileName": 1,
                "decision": "$review_history.decision",
                "reviewer_name": "$review_history.reviewer_name",
                "reviewed_at": "$review_history.reviewed_at",
                "notes": "$review_history.notes"
            }
        },
        {"$sort": {"reviewed_at": -1}},
        {"$limit": 20}
    ]
    
    recent_results = await db.documents.aggregate(recent_pipeline).to_list(length=20)
    recent_activity = [
        {
            "document_name": result["fileName"],
            "status": result["decision"],
            "reviewer_name": result.get("reviewer_name", "Unknown"),
            "reviewed_at": result["reviewed_at"].isoformat(),
            "notes": result.get("notes", "")
        }
        for result in recent_results
    ]
    
    # Get pending queue count
    pending_count = await db.documents.count_documents({
        "verificationStatus": {"$in": ["pending", "flagged"]},
        "$or": [{"isDeleted": {"$exists": False}}, {"isDeleted": False}]
    })
    
    return {
        "overview": {
            **overview,
            "pending_queue": pending_count
        },
        "trends": {
            "daily_reviews": daily_trends
        },
        "recent_activity": recent_activity,
        "period_days": days
    }
