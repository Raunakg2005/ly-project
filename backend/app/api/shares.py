from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timedelta
import secrets
import string
import bcrypt

from app.schemas.share import ShareCreate, ShareResponse, PublicShareResponse
from app.core.security import decode_access_token
from app.database import get_database

router = APIRouter(prefix="/api/shares", tags=["Shares"])
security = HTTPBearer()


def generate_share_id(length: int = 8) -> str:
    """Generate a random alphanumeric share ID"""
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


def calculate_expiration(expires_in: str) -> Optional[datetime]:
    """Calculate expiration datetime based on expires_in string"""
    now = datetime.utcnow()
    
    if expires_in == "never":
        return None
    elif expires_in == "1h":
        return now + timedelta(hours=1)
    elif expires_in == "24h":
        return now + timedelta(hours=24)
    elif expires_in == "7d":
        return now + timedelta(days=7)
    else:
        raise ValueError(f"Invalid expires_in value: {expires_in}")


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
    
    # Check if password was changed after token was issued
    token_pwd_changed_at = payload.get("pwd_changed_at")
    user_pwd_changed_at = user.get("password_changed_at")
    
    if user_pwd_changed_at:
        from datetime import datetime
        user_pwd_time = user_pwd_changed_at.isoformat() if isinstance(user_pwd_changed_at, datetime) else str(user_pwd_changed_at)
        
        if token_pwd_changed_at != user_pwd_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired due to password change. Please login again."
            )
    
    # Check if user is banned
    if user.get("banned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended"
        )
    
    return str(user["_id"])


@router.post("", response_model=ShareResponse)
async def create_share(
    share_data: ShareCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new share link for a document"""
    db = get_database()
    
    # Verify document exists and belongs to user
    document = await db.documents.find_one({
        "_id": ObjectId(share_data.document_id),
        "userId": ObjectId(user_id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Generate unique share ID
    share_id = generate_share_id()
    while await db.shares.find_one({"share_id": share_id}):
        share_id = generate_share_id()
    
    # Calculate expiration
    expires_at = calculate_expiration(share_data.expires_in)
    
    # Hash password if provided
    password_hash = None
    if share_data.password:
        password_hash = bcrypt.hashpw(
            share_data.password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
    
    # Create share document
    share = {
        "document_id": ObjectId(share_data.document_id),
        "share_id": share_id,
        "user_id": ObjectId(user_id),
        "expires_at": expires_at,
        "password_hash": password_hash,
        "allow_download": share_data.allow_download,
        "view_count": 0,
        "last_viewed_at": None,
        "created_at": datetime.utcnow(),
        "is_revoked": False
    }
    
    result = await db.shares.insert_one(share)
    
    # Build share URL
    share_url = f"http://localhost:3000/share/{share_id}"
    
    return ShareResponse(
        id=str(result.inserted_id),
        document_id=share_data.document_id,
        share_id=share_id,
        created_by=user_id,
        expires_at=expires_at,
        password_protected=password_hash is not None,
        allow_download=share_data.allow_download,
        view_count=0,
        created_at=share["created_at"],
        share_url=share_url
    )


@router.get("", response_model=List[ShareResponse])
async def list_shares(user_id: str = Depends(get_current_user_id)):
    """List all shares created by the current user"""
    db = get_database()
    
    cursor = db.shares.find({
        "user_id": ObjectId(user_id),
        "is_revoked": False
    }).sort("created_at", -1)
    
    shares = await cursor.to_list(length=None)
    
    result = []
    for share in shares:
        share_url = f"http://localhost:3000/share/{share['share_id']}"
        result.append(ShareResponse(
            id=str(share["_id"]),
            document_id=str(share["document_id"]),
            share_id=share["share_id"],
            created_by=str(share["user_id"]),
            expires_at=share.get("expires_at"),
            password_protected=share.get("password_hash") is not None,
            allow_download=share["allow_download"],
            view_count=share["view_count"],
            created_at=share["created_at"],
            share_url=share_url
        ))
    
    return result


@router.get("/{share_id}", response_model=ShareResponse)
async def get_share(
    share_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get details of a specific share (owner only)"""
    db = get_database()
    
    share = await db.shares.find_one({
        "share_id": share_id,
        "user_id": ObjectId(user_id)
    })
    
    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found"
        )
    
    share_url = f"http://localhost:3000/share/{share['share_id']}"
    
    return ShareResponse(
        id=str(share["_id"]),
        document_id=str(share["document_id"]),
        share_id=share["share_id"],
        created_by=str(share["user_id"]),
        expires_at=share.get("expires_at"),
        password_protected=share.get("password_hash") is not None,
        allow_download=share["allow_download"],
        view_count=share["view_count"],
        created_at=share["created_at"],
        share_url=share_url
    )


@router.delete("/{share_id}")
async def revoke_share(
    share_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Revoke/delete a share link"""
    db = get_database()
    
    result = await db.shares.update_one(
        {
            "share_id": share_id,
            "user_id": ObjectId(user_id)
        },
        {
            "$set": {
                "is_revoked": True,
                "revoked_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found"
        )
    
    return {"success": True, "message": "Share revoked successfully"}
