from fastapi import APIRouter, Depends, HTTPException, status
from app.api.auth import get_current_user
from app.models.notification_preferences import (
    EmailNotificationSettings,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate
)
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> str:
    """Helper to get just the user ID from current user"""
    return current_user["_id"]  # MongoDB user object uses _id

def get_default_preferences() -> dict:
    """Get default notification preferences"""
    return {
        "document_verified": True,
        "document_rejected": True,
        "document_flagged": True,
        "analysis_complete": True,
        "certificate_ready": True,
        "weekly_summary": False,
        "security_alerts": True
    }

@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(user_id: str = Depends(get_current_user_id)):
    """
    Get current user's notification preferences.
    Returns default preferences if none exist.
    """
    db = get_database()
    
    # Try to find existing preferences
    prefs = await db.notification_preferences.find_one({"user_id": ObjectId(user_id)})
    
    if prefs:
        return {
            "user_id": str(prefs["user_id"]),
            "email_notifications": prefs["email_notifications"],
            "created_at": prefs["created_at"],
            "updated_at": prefs["updated_at"]
        }
    
    # Return defaults if no preferences exist
    now = datetime.utcnow()
    return {
        "user_id": user_id,
        "email_notifications": get_default_preferences(),
        "created_at": now,
        "updated_at": now
    }

@router.put("/preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update notification preferences.
    Creates new preferences if none exist.
    """
    if not preferences.email_notifications:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email notifications settings are required"
        )
    
    db = get_database()
    now = datetime.utcnow()
    
    # Convert Pydantic model to dict
    email_prefs = preferences.email_notifications.model_dump()
    
    # Update or insert
    result = await db.notification_preferences.update_one(
        {"user_id": ObjectId(user_id)},
        {
            "$set": {
                "email_notifications": email_prefs,
                "updated_at": now
            },
            "$setOnInsert": {
                "user_id": ObjectId(user_id),
                "created_at": now
            }
        },
        upsert=True
    )
    
    # Fetch updated preferences
    prefs = await db.notification_preferences.find_one({"user_id": ObjectId(user_id)})
    
    return {
        "user_id": str(prefs["user_id"]),
        "email_notifications": prefs["email_notifications"],
        "created_at": prefs["created_at"],
        "updated_at": prefs["updated_at"]
    }

@router.post("/preferences/reset", response_model=NotificationPreferencesResponse)
async def reset_notification_preferences(user_id: str = Depends(get_current_user_id)):
    """
    Reset notification preferences to defaults.
    """
    db = get_database()
    now = datetime.utcnow()
    
    # Reset to defaults
    result = await db.notification_preferences.update_one(
        {"user_id": ObjectId(user_id)},
        {
            "$set": {
                "email_notifications": get_default_preferences(),
                "updated_at": now
            },
            "$setOnInsert": {
                "user_id": ObjectId(user_id),
                "created_at": now
            }
        },
        upsert=True
    )
    
    # Fetch updated preferences
    prefs = await db.notification_preferences.find_one({"user_id": ObjectId(user_id)})
    
    return {
        "user_id": str(prefs["user_id"]),
        "email_notifications": prefs["email_notifications"],
        "created_at": prefs["created_at"],
        "updated_at": prefs["updated_at"]
    }
