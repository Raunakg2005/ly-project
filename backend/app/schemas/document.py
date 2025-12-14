from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId as BsonObjectId

class DocumentBase(BaseModel):
    fileName: str
    originalName: str
    fileType: str
    category: str = "other"
    description: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentMetadata(BaseModel):
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)
    description: Optional[str] = None
    category: str = "other"
    tags: List[str] = []

class AIAnalysis(BaseModel):
    authenticityScore: float
    riskLevel: str
    flags: List[str]
    analysisDate: datetime
    confidence: float
    processingTime: float

class Document(DocumentBase):
    id: Optional[str] = Field(alias="_id", default=None)
    userId: str
    fileSize: int
    storageUrl: str
    fileHash: str
    quantumSignature: Optional[str] = None
    metadata: DocumentMetadata
    extractedText: Optional[str] = None
    aiAnalysis: Optional[AIAnalysis] = None
    verificationStatus: str = "pending"
    verificationCount: int = 0
    downloadCount: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {BsonObjectId: str}

class DocumentResponse(BaseModel):
    id: str
    fileName: str
    fileSize: int
    fileType: str
    category: str
    uploadedAt: datetime
    verificationStatus: str
    fileHash: str

class UploadResponse(BaseModel):
    success: bool
    message: str
    document: Optional[DocumentResponse] = None
