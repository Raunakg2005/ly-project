from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from datetime import datetime
from bson import ObjectId as BsonObjectId

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type: Any, _handler):
        from pydantic_core import core_schema
        return core_schema.union_schema([
            core_schema.is_instance_schema(BsonObjectId),
            core_schema.no_info_plain_validator_function(cls.validate),
        ])

    @classmethod
    def validate(cls, v):
        if isinstance(v, BsonObjectId):
            return str(v)
        if isinstance(v, str) and BsonObjectId.is_valid(v):
            return v
        raise ValueError("Invalid ObjectId")

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: Optional[str] = Field(alias="_id", default=None)
    role: str = "user"
    subscription: dict = {
        "plan": "free",
        "status": "active"
    }
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {BsonObjectId: str}

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
