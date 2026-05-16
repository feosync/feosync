"""
Auth Dependencies - Reusable dependency functions for authentication
"""
from fastapi import Depends, HTTPException, status, Cookie
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.service import AuthService
from app.modules.user.model import User
from app.core.contexte import current_token, current_user_email, current_user_id


async def get_current_user(
    access_token: str | None = Cookie(default=None),
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
    print("Extracting token from cookie:", access_token)  # Debug log
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    current_token.set(access_token)
    user = AuthService.get_current_user(db, access_token)
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
        
    current_user_id.set(current_user.id)
    current_user_email.set(current_user.email)
    return current_user



async def get_admin_user(
    current_user: User = Depends(get_active_user),
) -> User:
    """Vérifie que l'utilisateur est admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user
