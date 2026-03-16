"""
Auth Service - Business logic for authentication
"""
from datetime import datetime, timedelta
from typing import Optional
import jwt
from sqlalchemy.orm import Session
from google.auth.transport import requests
from google.oauth2 import id_token

from app.core.config import settings
from app.modules.auth.schemas import GoogleUserInfo, UserResponse
from app.modules.auth.repository import UserRepository
from app.modules.user.model import User


class AuthService:
    """Service for authentication operations"""

    # JWT Configuration
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 1440

    @staticmethod
    def verify_google_token(token: str) -> Optional[GoogleUserInfo]:
        """
        Verify Google OAuth token and extract user info
        
        Args:
            token: Google ID token from client
            
        Returns:
            GoogleUserInfo object if token is valid, None otherwise
        """
        try:
            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.GOOGLE_CLIENT_ID,  # Using Google Client ID from config
            )

            # Verify token is not expired and from Google
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                return None

            # Extract user information
            return GoogleUserInfo(
                sub=idinfo.get("sub"),
                name=idinfo.get("name"),
                email=idinfo.get("email"),
                picture=idinfo.get("picture"),
                email_verified=idinfo.get("email_verified", False),
            )
        except Exception as e:
            print(f"Token verification failed: {str(e)}")
            return None

    @staticmethod
    def create_access_token(user_id: str, email: str) -> str:
        """
        Create JWT access token
        
        Args:
            user_id: User UUID
            email: User email
            
        Returns:
            JWT token string
        """
        expire = datetime.utcnow() + timedelta(
            minutes=AuthService.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        to_encode = {
            "user_id": str(user_id),
            "email": email,
            "exp": expire,
        }
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=AuthService.ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def verify_access_token(token: str) -> Optional[dict]:
        """
        Verify JWT access token
        
        Args:
            token: JWT token string
            
        Returns:
            Token payload dict if valid, None otherwise
        """
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[AuthService.ALGORITHM],
            )
            return payload
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError:
            print("Invalid token")
            return None

    @staticmethod
    def authenticate_google_user(
        db: Session, google_user_info: GoogleUserInfo
    ) -> tuple[User, str]:
        """
        Authenticate or create user from Google OAuth info
        
        Args:
            db: Database session
            google_user_info: Google user information
            
        Returns:
            Tuple of (User, access_token)
        """
        # Check if user already exists by Google ID
        user = UserRepository.get_user_by_google_id(db, google_user_info.sub)

        if not user:
            # Check if user exists by email
            user = UserRepository.get_user_by_email(db, google_user_info.email)

            if user:
                # Link Google account to existing user
                user = UserRepository.update_user(
                    db,
                    user,
                    google_id=google_user_info.sub,
                    profile_picture=google_user_info.picture,
                    google_email=google_user_info.email,
                )
            else:
                # Create new user
                user = UserRepository.create_user(
                    db,
                    name=google_user_info.name,
                    email=google_user_info.email,
                    google_id=google_user_info.sub,
                    profile_picture=google_user_info.picture,
                )

        # Generate JWT token
        access_token = AuthService.create_access_token(
            str(user.id), user.email
        )

        return user, access_token

    @staticmethod
    def get_current_user(
        db: Session, token: str
    ) -> Optional[User]:
        """
        Get current user from JWT token
        
        Args:
            db: Database session
            token: JWT token string
            
        Returns:
            User object if token is valid, None otherwise
        """
        payload = AuthService.verify_access_token(token)
        if not payload:
            return None

        user_id = payload.get("user_id")
        if not user_id:
            return None

        try:
            user = UserRepository.get_user_by_id(db, user_id)
            return user if user and user.is_active else None
        except Exception as e:
            print(f"Error fetching user: {str(e)}")
            return None
