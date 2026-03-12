"""
Auth Dependencies - Reusable dependency functions for authentication
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.service import AuthService
from app.modules.user.user_model import User


async def get_token_from_header(authorization: str | None = None) -> str:
    """
    Extract bearer token from Authorization header
    
    Args:
        authorization: Authorization header value
        
    Returns:
        Token string
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return parts[1]


async def get_current_user(
    authorization: str | None = None,
    db: Session = Depends(get_db),
) -> User:
    """
    Get current authenticated user from JWT token
    
    Args:
        authorization: Authorization header
        db: Database session
        
    Returns:
        Current user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = await get_token_from_header(authorization)

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
    
    Args:
        current_user: Current user dependency
        
    Returns:
        Current active user
        
    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return current_user
