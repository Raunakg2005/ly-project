import pyotp
import qrcode
import io
import base64
import os
import hashlib
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from pydantic import BaseModel
from bson import ObjectId
from jose import jwt

from app.core.security import decode_access_token, get_password_hash, verify_password
from app.database import get_database
from app.config import settings

router = APIRouter(prefix="/api/auth/2fa", tags=["Two-Factor Authentication"])
security = HTTPBearer()

# ─────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────

class TwoFAVerifyRequest(BaseModel):
    code: str  # 6-digit TOTP or 8-char backup code

class TwoFALoginRequest(BaseModel):
    pre_auth_token: str
    code: str

class TwoFADisableRequest(BaseModel):
    code: str

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

async def _get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get fully authenticated user from JWT."""
    payload = decode_access_token(credentials.credentials)
    if not payload or payload.get("type") == "pre_auth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    db = get_database()
    user = await db.users.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def _create_pre_auth_token(email: str) -> str:
    """Short-lived token used only for the 2FA second step (5-minute expiry)."""
    return jwt.encode(
        {"sub": email, "type": "pre_auth", "exp": datetime.utcnow() + timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def _generate_qr_base64(secret: str, email: str, app_name: str = "DocShield") -> str:
    """Generate QR code as base64 PNG."""
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=email, issuer_name=app_name)
    qr = qrcode.QRCode(box_size=6, border=2)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _generate_backup_codes() -> tuple[list[str], list[str]]:
    """Returns (plain_codes, hashed_codes). Store hashes, show plain ones once."""
    plain = [secrets.token_hex(4).upper() for _ in range(8)]  # e.g. "A3F2C1D9"
    hashed = [hashlib.sha256(c.encode()).hexdigest() for c in plain]
    return plain, hashed


def _verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)


def _verify_backup_code(code: str, stored_hashes: list[str]) -> int | None:
    """Returns the index of the matched backup code, or None."""
    code_hash = hashlib.sha256(code.upper().encode()).hexdigest()
    for i, h in enumerate(stored_hashes):
        if h == code_hash:
            return i
    return None


# ─────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────

@router.post("/setup")
async def setup_2fa(user=Depends(_get_current_user)):
    """
    Generate a TOTP secret and return the QR code (base64 PNG) + manual secret.
    Does NOT enable 2FA yet — user must confirm with /enable after scanning.
    """
    db = get_database()
    secret = pyotp.random_base32()
    email = user["email"]

    # Store pending secret (not yet active – two_fa_enabled stays False)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"totp_pending_secret": secret}}
    )

    qr_base64 = _generate_qr_base64(secret, email)

    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "message": "Scan the QR code with your authenticator app, then call /enable with your first code"
    }


@router.post("/enable")
async def enable_2fa(body: TwoFAVerifyRequest, user=Depends(_get_current_user)):
    """
    Confirm TOTP setup by verifying the user's first code.
    Generates backup codes and activates 2FA on the account.
    """
    db = get_database()
    pending_secret = user.get("totp_pending_secret")

    if not pending_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending 2FA setup. Call /setup first."
        )

    if not _verify_totp(pending_secret, body.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code. Please try again."
        )

    plain_codes, hashed_codes = _generate_backup_codes()

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "two_fa_enabled": True,
                "totp_secret": pending_secret,
                "backup_codes": hashed_codes,
                "two_fa_enabled_at": datetime.utcnow()
            },
            "$unset": {"totp_pending_secret": ""}
        }
    )

    return {
        "success": True,
        "message": "2FA enabled successfully",
        "backup_codes": plain_codes,
        "warning": "Save these backup codes securely. They will not be shown again."
    }


@router.post("/verify")
async def verify_2fa_login(body: TwoFALoginRequest):
    """
    Second step of 2FA login. Exchange pre_auth_token + TOTP/backup code for full JWT.
    """
    # Decode pre-auth token
    try:
        payload = jwt.decode(body.pre_auth_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired pre-auth token")

    if payload.get("type") != "pre_auth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    db = get_database()
    user = await db.users.find_one({"email": payload["sub"]})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    totp_secret = user.get("totp_secret")
    code = body.code.strip().replace("-", "").replace(" ", "")

    # Try TOTP first
    if totp_secret and _verify_totp(totp_secret, code):
        pass  # Valid TOTP
    else:
        # Try backup codes
        backup_hashes = user.get("backup_codes", [])
        idx = _verify_backup_code(code, backup_hashes)
        if idx is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication code"
            )
        # Consume the backup code (remove it)
        new_backup_hashes = [h for i, h in enumerate(backup_hashes) if i != idx]
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"backup_codes": new_backup_hashes}}
        )

    # Issue full JWT
    from app.core.security import create_access_token
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "role": user.get("role", "user"),
            "pwd_changed_at": user.get("password_changed_at").isoformat() if user.get("password_changed_at") else None
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/disable")
async def disable_2fa(body: TwoFADisableRequest, user=Depends(_get_current_user)):
    """Disable 2FA. Requires current TOTP code or a backup code to confirm."""
    db = get_database()

    if not user.get("two_fa_enabled"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA is not enabled")

    totp_secret = user.get("totp_secret")
    code = body.code.strip()

    # Try TOTP
    valid = totp_secret and _verify_totp(totp_secret, code)
    if not valid:
        # Try backup code
        backup_hashes = user.get("backup_codes", [])
        idx = _verify_backup_code(code, backup_hashes)
        valid = idx is not None

    if not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid code")

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"two_fa_enabled": False},
            "$unset": {"totp_secret": "", "backup_codes": "", "totp_pending_secret": ""}
        }
    )

    return {"success": True, "message": "2FA has been disabled"}


@router.get("/status")
async def get_2fa_status(user=Depends(_get_current_user)):
    """Get current 2FA status for the logged-in user."""
    backup_codes = user.get("backup_codes", [])
    return {
        "two_fa_enabled": user.get("two_fa_enabled", False),
        "backup_codes_remaining": len(backup_codes),
        "enabled_at": user.get("two_fa_enabled_at").isoformat() if user.get("two_fa_enabled_at") else None
    }


@router.post("/backup-codes/regenerate")
async def regenerate_backup_codes(body: TwoFAVerifyRequest, user=Depends(_get_current_user)):
    """Regenerate backup codes (requires current TOTP code)."""
    db = get_database()

    if not user.get("two_fa_enabled"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA is not enabled")

    if not _verify_totp(user.get("totp_secret", ""), body.code):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid TOTP code")

    plain_codes, hashed_codes = _generate_backup_codes()

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"backup_codes": hashed_codes}}
    )

    return {
        "backup_codes": plain_codes,
        "warning": "Previous backup codes have been invalidated. Save these securely."
    }
