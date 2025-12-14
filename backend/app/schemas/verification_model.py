from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId as BsonObjectId

class VerificationCreate(BaseModel):
    document_id: str
    verifier_id: Optional[str] = None
    priority: str = "normal"  # low, normal, high, urgent

class VerificationUpdate(BaseModel):
    status: Optional[str] = None
    verifier_notes: Optional[str] = None
    decision: Optional[str] = None  # approved, rejected, flagged

class VerificationHistory(BaseModel):
    timestamp: datetime
    action: str
    performed_by: Optional[str] = None
    notes: Optional[str] = None

class VerificationModel(BaseModel):
    """
    Separate verification model for detailed audit trail
    Stores complete verification history and reviewer actions
    """
    id: Optional[str] = Field(alias="_id", default=None)
    document_id: str
    user_id: str
    verifier_id: Optional[str] = None
    
    # Verification details
    status: str = "pending"  # pending, in_review, completed, rejected
    priority: str = "normal"
    decision: Optional[str] = None  # approved, rejected, flagged, needs_review
    
    # AI Analysis summary
    ai_score: Optional[float] = None
    ai_risk_level: Optional[str] = None
    ai_flags: List[str] = []
    
    # Manual review
    verifier_notes: Optional[str] = None
    review_duration: Optional[float] = None  # seconds
    
    # Timestamps
    requested_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Audit trail
    history: List[VerificationHistory] = []
    
    # Metadata
    verification_count: int = 1  # How many times this doc has been verified
    is_resubmission: bool = False
    previous_verification_id: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {BsonObjectId: str}
