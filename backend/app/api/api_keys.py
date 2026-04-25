import hashlib
import secrets
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from bson import ObjectId

from app.core.security import decode_access_token
from app.database import get_database

router = APIRouter(prefix="/api/keys", tags=["API Keys"])
security = HTTPBearer()

# ─────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────

class APIKeyCreateRequest(BaseModel):
    name: str
    expires_in_days: Optional[int] = None  # None = never expires

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


def _generate_raw_key() -> str:
    """Generate a ds_ prefixed cryptographically secure API key."""
    raw = secrets.token_urlsafe(32)
    return f"ds_{raw}"


async def _get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Authenticate via JWT Bearer token."""
    payload = decode_access_token(credentials.credentials)
    if not payload or payload.get("type") == "pre_auth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    db = get_database()
    user = await db.users.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# This is a FastAPI dependency that can authenticate via EITHER JWT OR API Key.
async def authenticate_request(request: Request):
    """
    Dual authentication dependency:
    - Checks for X-API-Key header first
    - Falls back to Authorization: Bearer JWT
    Returns user dict if authenticated.
    """
    db = get_database()

    # Check API Key header
    api_key_header = request.headers.get("X-API-Key")
    if api_key_header:
        key_hash = _hash_key(api_key_header)
        key_doc = await db.api_keys.find_one({
            "key_hash": key_hash,
            "is_active": True
        })
        if not key_doc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")

        # Check expiry
        if key_doc.get("expires_at") and key_doc["expires_at"] < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API key has expired")

        # Update last_used
        await db.api_keys.update_one(
            {"_id": key_doc["_id"]},
            {"$set": {"last_used": datetime.utcnow()}}
        )

        user = await db.users.find_one({"_id": key_doc["user_id"]})
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user

    # Fall back to Bearer JWT
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    token = auth_header.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload or payload.get("type") == "pre_auth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await db.users.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@router.post("")
async def create_api_key(body: APIKeyCreateRequest, user=Depends(_get_current_user)):
    """
    Create a new API key. The full key is returned ONCE — it cannot be retrieved again.
    """
    db = get_database()

    raw_key = _generate_raw_key()
    key_hash = _hash_key(raw_key)
    key_prefix = raw_key[:12]  # show "ds_xxxxxxx" as identifier

    expires_at = None
    if body.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=body.expires_in_days)

    key_doc = {
        "user_id": user["_id"],
        "name": body.name,
        "key_hash": key_hash,
        "key_prefix": key_prefix,
        "created_at": datetime.utcnow(),
        "last_used": None,
        "expires_at": expires_at,
        "is_active": True
    }

    result = await db.api_keys.insert_one(key_doc)

    return {
        "id": str(result.inserted_id),
        "name": body.name,
        "key": raw_key,  # Shown only once!
        "key_prefix": key_prefix,
        "expires_at": expires_at.isoformat() if expires_at else None,
        "created_at": key_doc["created_at"].isoformat(),
        "warning": "Save this key securely. It will not be shown again."
    }


@router.get("")
async def list_api_keys(user=Depends(_get_current_user)):
    """List all API keys for the current user (hashes are never returned)."""
    db = get_database()

    keys = await db.api_keys.find({
        "user_id": user["_id"]
    }).sort("created_at", -1).to_list(length=50)

    result = []
    for k in keys:
        expires_at = k.get("expires_at")
        is_expired = expires_at and expires_at < datetime.utcnow()

        result.append({
            "id": str(k["_id"]),
            "name": k.get("name", ""),
            "key_prefix": k.get("key_prefix", ""),
            "created_at": k["created_at"].isoformat() if k.get("created_at") else None,
            "last_used": k["last_used"].isoformat() if k.get("last_used") else None,
            "expires_at": expires_at.isoformat() if expires_at else None,
            "is_active": k.get("is_active", True) and not is_expired,
            "is_expired": is_expired
        })

    return {"keys": result, "total": len(result)}


@router.delete("/{key_id}")
async def revoke_api_key(key_id: str, user=Depends(_get_current_user)):
    """Revoke (deactivate) an API key."""
    db = get_database()

    key_doc = await db.api_keys.find_one({
        "_id": ObjectId(key_id),
        "user_id": user["_id"]
    })

    if not key_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")

    await db.api_keys.update_one(
        {"_id": ObjectId(key_id)},
        {"$set": {"is_active": False, "revoked_at": datetime.utcnow()}}
    )

    return {"success": True, "message": f"API key '{key_doc['name']}' has been revoked"}
