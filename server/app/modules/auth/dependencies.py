"""
Auth Dependencies - Reusable dependency functions for authentication
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.service import AuthService
from app.modules.user.user_model import User

# HTTPBearer scheme for Swagger UI recognition
security = HTTPBearer(
    description="Bearer token for JWT authentication",
    auto_error=False
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token in Bearer header
    
    This dependency extracts and validates the JWT token from the Authorization header.
    Used by Swagger UI to provide authentication UI for API endpoints.
    
    Args:
        credentials: Bearer token credentials from Authorization header
        db: Database session
        
    Returns:
        Current user object
        
    Raises:
        HTTPException: If credentials missing, invalid, or user not found
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    
    user = AuthService.get_current_user(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get current active user
    
    Ensures the authenticated user is active (not deactivated).
    
    Args:
        current_user: Current user from JWT token
        
    Returns:
        Current active user object
        
    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return current_user
