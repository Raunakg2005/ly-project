from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta
from app.schemas.user import UserCreate, UserLogin, Token, User
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from app.database import get_database
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    """Register new user"""
    db = get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user.model_dump()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["role"] = "user"
    user_dict["subscription"] = {"plan": "free", "status": "active"}
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    # Convert ObjectId to string
    if created_user and "_id" in created_user:
        created_user["_id"] = str(created_user["_id"])
    
    return created_user

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user and return JWT token"""
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    
    # Check if user exists and verify password
    # Support both 'password' and 'hashed_password' field names for backwards compatibility
    password_field = user.get("hashed_password") or user.get("password") if user else None
    
    if not user or not password_field or not verify_password(credentials.password, password_field):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is banned
    if user.get("banned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended",
        )
    
    # Create access token with user role
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "role": user.get("role", "user"),
            "pwd_changed_at": user.get("password_changed_at").isoformat() if user.get("password_changed_at") else None
        },
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
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
    
    # Check if password was changed after token was issued (invalidate old sessions)
    token_pwd_changed_at = payload.get("pwd_changed_at")
    user_pwd_changed_at = user.get("password_changed_at")
    
    if user_pwd_changed_at:
        # If user has password_changed_at but token doesn't, or they don't match - token is invalid
        from datetime import datetime
        user_pwd_time = user_pwd_changed_at.isoformat() if isinstance(user_pwd_changed_at, datetime) else str(user_pwd_changed_at)
        
        if token_pwd_changed_at != user_pwd_time:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired due to password change. Please login again.",
            )
    
    # Check if user is banned - CRITICAL SECURITY CHECK
    if user.get("banned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended",
        )
    
    # Convert ObjectId to string
    if "_id" in user:
        user["_id"] = str(user["_id"])
    
    return user

@router.get("/me")
async def get_current_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user with role"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication"
        )
    
    email = payload.get("sub")
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Ensure name is never None
    user_name = user.get("name")
    if user_name is None:
        user_name = ""
    
    # Check if user is banned
    if user.get("banned", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended",
        )
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user_name,
        "role": user.get("role", "user"),
        "banned": user.get("banned", False)
    }

@router.put("/profile", response_model=User)
async def update_profile(
    profile: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update user profile"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    email = payload.get("sub")
    db = get_database()
    
    # Update user name
    result = await db.users.update_one(
        {"email": email},
        {"$set": {"name": profile.get("name")}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update profile"
        )
    
    # Return updated user
    user = await db.users.find_one({"email": email})
    if "_id" in user:
        user["_id"] = str(user["_id"])
    
    return user

@router.post("/change-password")
async def change_password(
    password_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Change user password"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    email = payload.get("sub")
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not verify_password(password_data.get("current_password"), user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    hashed_password = get_password_hash(password_data.get("new_password"))
    from datetime import datetime
    await db.users.update_one(
        {"email": email},
        {"$set": {
            "hashed_password": hashed_password,
            "password_changed_at": datetime.utcnow()
        }}
    )
    
    return {"success": True, "message": "Password changed successfully"}
