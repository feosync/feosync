from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class GoogleTokenRequest(BaseModel):
    """Google OAuth token request"""
    token: str

    class Config:
        json_schema_extra = {
            "example": {
                "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
            }
        }
class GoogleCallbackRequest(BaseModel):
    code: str
    redirect_uri: str


class UserBase(BaseModel):
    """Base user schema"""
    name: str
    email: EmailStr


class UserCreate(UserBase):
    """User creation schema"""
    google_id: str
    profile_picture: Optional[str] = None
    is_admin: bool = False
    plan_id: Optional[int] = None


class UserResponse(UserBase):
    """User response schema"""
    id: UUID
    google_id: Optional[str]
    profile_picture: Optional[str]
    is_active: bool
    is_admin: bool
    plan_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    customer_id: Optional[str]

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    """JWT token data"""
    user_id: UUID
    email: str
    exp: datetime


class LoginResponse(BaseModel):
    """Login response with token and user"""
    access_token: str
    token_type: str
    user: UserResponse

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "name": "John Doe",
                    "email": "john@example.com",
                    "google_id": "123456789",
                    "profile_picture": "https://example.com/profile.jpg",
                    "is_active": True,
                    "is_admin": False,
                    "plan_id": 1,
                    "created_at": "2026-03-12T10:00:00",
                    "updated_at": "2026-03-12T10:00:00"
                }
            }
        }


class GoogleUserInfo(BaseModel):
    """Google user info from token"""
    sub: str  # Google ID
    name: str
    email: str
    picture: Optional[str] = None
    email_verified: bool
    plan_id: Optional[int] = None


class AuthError(BaseModel):
    """Authentication error response"""
    detail: str

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid token or user not found"
            }
        }
