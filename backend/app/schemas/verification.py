from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AIAnalysisRequest(BaseModel):
    document_id: str

class AIAnalysisResult(BaseModel):
    authenticityScore: float
    riskLevel: str
    flags: List[str]
    summary: str
    confidence: float
    processingTime: float
    analyzedAt: datetime

class VerificationRequest(BaseModel):
    document_id: str
    priority: str = "normal"  # low, normal, high

class VerificationResponse(BaseModel):
    id: str
    document_id: str
    status: str
    created_at: datetime
    analysis: Optional[AIAnalysisResult] = None
