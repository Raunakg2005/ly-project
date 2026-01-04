from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmailNotificationSettings(BaseModel):
    """Email notification settings"""
    document_verified: bool = True
    document_rejected: bool = True
    document_flagged: bool = True
    analysis_complete: bool = True
    certificate_ready: bool = True
    weekly_summary: bool = False
    security_alerts: bool = True  # Always recommended

class NotificationPreferencesBase(BaseModel):
    """Base notification preferences"""
    email_notifications: EmailNotificationSettings

class NotificationPreferencesUpdate(BaseModel):
    """Update notification preferences"""
    email_notifications: Optional[EmailNotificationSettings] = None

class NotificationPreferencesResponse(BaseModel):
    """Notification preferences response"""
    user_id: str
    email_notifications: EmailNotificationSettings
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
