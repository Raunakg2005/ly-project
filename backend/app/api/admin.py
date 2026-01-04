from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, List
from app.database import get_database
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Admin role check dependency
async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# Pydantic models
class UpdateRoleRequest(BaseModel):
    role: str

class UpdateStatusRequest(BaseModel):
    status: str

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str

class ResetPasswordRequest(BaseModel):
    new_password: str

# Get system statistics
@router.get("/stats")
async def get_admin_stats(admin: dict = Depends(require_admin)):
    """Get system-wide statistics for admin dashboard"""
    db = get_database()
    
    # Count users by role
    total_users = await db.users.count_documents({})
    admin_users = await db.users.count_documents({"role": "admin"})
    verifier_users = await db.users.count_documents({"role": "verifier"})
    regular_users = await db.users.count_documents({"role": "user"})
    
    # Count documents by status
    total_documents = await db.documents.count_documents({})
    verified_docs = await db.documents.count_documents({"verificationStatus": "verified"})
    pending_docs = await db.documents.count_documents({"verificationStatus": "pending"})
    flagged_docs = await db.documents.count_documents({"verificationStatus": "flagged"})
    
    
    # Active users (users who have uploaded documents)
    week_ago = datetime.utcnow() - timedelta(days=7)
    active_user_ids = await db.documents.distinct("userId", {})
    active_users = len(active_user_ids)
    
    # Storage calculation (sum of all document sizes)
    pipeline = [
        {"$group": {"_id": None, "totalSize": {"$sum": "$fileSize"}}}
    ]
    storage_result = await db.documents.aggregate(pipeline).to_list(1)
    total_storage = storage_result[0]["totalSize"] if storage_result else 0
    
    return {
        "users": {
            "total": total_users,
            "admins": admin_users,
            "verifiers": verifier_users,
            "regular": regular_users,
            "active_7d": active_users
        },
        "documents": {
            "total": total_documents,
            "verified": verified_docs,
            "pending": pending_docs,
            "flagged": flagged_docs
        },
        "storage": {
            "total_bytes": total_storage,
            "total_mb": round(total_storage / (1024 * 1024), 2),
            "total_gb": round(total_storage / (1024 * 1024 * 1024), 2)
        }
    }

# Get all users with pagination
@router.get("/users")
async def get_all_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    admin: dict = Depends(require_admin)
):
    """Get all users with filtering and pagination"""
    db = get_database()
    
    query = {}
    
    # Search filter
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    # Role filter
    if role and role != "all":
        query["role"] = role
    
    # Status filter (banned, active)
    if status == "banned":
        query["banned"] = True
    elif status == "active":
        query["$or"] = [
            {"banned": {"$exists": False}},
            {"banned": False}
        ]
    
    # Get total count
    total = await db.users.count_documents(query)
    
    # Get paginated users
    skip = (page - 1) * limit
    cursor = db.users.find(query).skip(skip).limit(limit).sort("createdAt", -1)
    users = await cursor.to_list(length=limit)
    
    # Get document count for each user
    user_list = []
    for user in users:
        doc_count = await db.documents.count_documents({"userId": user["_id"]})
        user_list.append({
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "user"),
            "banned": user.get("banned", False),
            "documentCount": doc_count,
            "createdAt": user.get("createdAt", datetime.utcnow()).isoformat(),
            "lastLogin": user.get("lastLogin", "").isoformat() if user.get("lastLogin") else None
        })
    
    return {
        "users": user_list,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

# Update user role
@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    request: UpdateRoleRequest,
    admin: dict = Depends(require_admin)
):
    """Update a user's role"""
    db = get_database()
    
    # Validate role
    if request.role not in ["user", "verifier", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be: user, verifier, or admin"
        )
    
    # Update user
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": request.role, "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"success": True, "role": request.role}

# Update user status (ban/unban)
@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    request: UpdateStatusRequest,
    admin: dict = Depends(require_admin)
):
    """Ban or unban a user"""
    db = get_database()
    
    banned = request.status == "banned"
    
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"banned": banned, "updatedAt": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"success": True, "status": request.status}

# Delete user permanently
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin: dict = Depends(require_admin)
):
    """Permanently delete a user and all their documents"""
    db = get_database()
    
    # Find user first
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete all user's documents
    await db.documents.delete_many({"userId": ObjectId(user_id)})
    
    # Delete user
    await db.users.delete_one({"_id": ObjectId(user_id)})
    
    return {
        "success": True,
        "message": f"User {user.get('email')} and all their documents deleted"
    }

# Create new user
@router.post("/users")
async def create_user(
    request: CreateUserRequest,
    admin: dict = Depends(require_admin)
):
    """Create a new user (admin only)"""
    db = get_database()
    
    # Validate role
    if request.role not in ["user", "verifier", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be: user, verifier, or admin"
        )
    
    # Check if email already exists
    existing = await db.users.find_one({"email": request.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(request.password)
    
    # Create user
    new_user = {
        "name": request.name,
        "email": request.email,
        "password": hashed_password,
        "role": request.role,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "emailVerified": True,
        "banned": False
    }
    
    result = await db.users.insert_one(new_user)
    
    return {
        "success": True,
        "user_id": str(result.inserted_id),
        "email": request.email,
        "role": request.role
    }

# Reset user password
@router.patch("/users/{user_id}/password")
async def reset_user_password(
    user_id: str,
    request: ResetPasswordRequest,
    admin: dict = Depends(require_admin)
):
    """Reset a user's password (admin only)"""
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Hash new password
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(request.new_password)
    
    # Update password
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "password": hashed_password,
            "password_changed_at": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }}
    )
    
    return {
        "success": True,
        "message": f"Password reset for {user.get('email')}"
    }

# Get activity log
@router.get("/activity")
async def get_activity_log(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: dict = Depends(require_admin)
):
    """Get recent system activity (placeholder - can be expanded)"""
    db = get_database()
    
    # For now, get recent document uploads as activity
    skip = (page - 1) * limit
    cursor = db.documents.find({}).sort("createdAt", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    
    activities = []
    for doc in docs:
        user = await db.users.find_one({"_id": doc["userId"]})
        activities.append({
            "id": str(doc["_id"]),
            "action": "document_upload",
            "user": user.get("name", "Unknown") if user else "Unknown",
            "details": f"Uploaded {doc.get('fileName', 'document')}",
            "timestamp": doc.get("createdAt", datetime.utcnow()).isoformat()
        })
    
    total = await db.documents.count_documents({})
    
    return {
        "activities": activities,
        "total": total,
        "page": page,
        "limit": limit
    }
