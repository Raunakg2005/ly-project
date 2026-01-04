from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ShareCreate(BaseModel):
    document_id: str
    expires_in: str  # "1h", "24h", "7d", "never"
    password: Optional[str] = None
    allow_download: bool = True


class ShareResponse(BaseModel):
    id: str
    document_id: str
    share_id: str
    created_by: str
    expires_at: Optional[datetime]
    password_protected: bool
    allow_download: bool
    view_count: int
    created_at: datetime
    share_url: str


class PublicShareResponse(BaseModel):
    document_id: str
    file_name: str
    file_size: int
    file_type: str
    verification_status: str
    allow_download: bool
    download_url: Optional[str] = None
    created_by_name: Optional[str] = None
