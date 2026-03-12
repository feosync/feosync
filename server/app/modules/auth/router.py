"""
Auth Router - Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.schemas import (
    GoogleTokenRequest,
    LoginResponse,
    UserResponse,
    AuthError,
)
from app.modules.auth.service import AuthService
from app.modules.auth.dependencies import get_current_user, get_active_user
from app.modules.user.user_model import User


auth_router = APIRouter()


@auth_router.post(
    "/google/auth",
    response_model=LoginResponse,
    responses={
        400: {"model": AuthError, "description": "Invalid token"},
        401: {"model": AuthError, "description": "Token verification failed"},
    },
)
async def google_auth(
    request: GoogleTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Google OAuth authentication endpoint
    
    Handles both login and registration:
    - If user doesn't exist → creates new account automatically
    - If user exists → returns existing user
    - Always returns access token
    
    Args:
        request: Google OAuth token request
        db: Database session
        
    Returns:
        LoginResponse with access token and user info
        
    Raises:
        HTTPException: If token is invalid or user creation fails
    """
    # Verify Google token
    google_user_info = AuthService.verify_google_token(request.token)
    if not google_user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token",
        )

    try:
        # Authenticate or create user (same behavior for both login and register)
        user, access_token = AuthService.authenticate_google_user(
            db, google_user_info
        )

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to authenticate user: {str(e)}",
        )


@auth_router.get(
    "/me",
    response_model=UserResponse,
    responses={
        401: {"model": AuthError, "description": "Unauthorized"},
    },
)
async def get_current_user_info(
    current_user: User = Depends(get_active_user),
):
    """
    Get current authenticated user info
    
    Args:
        current_user: Current user from JWT token
        
    Returns:
        Current user info
    """
    return UserResponse.model_validate(current_user)


@auth_router.post(
    "/logout",
    responses={
        200: {"description": "Successfully logged out"},
        401: {"model": AuthError, "description": "Unauthorized"},
    },
)
async def logout(
    current_user: User = Depends(get_active_user),
):
    """
    Logout endpoint
    
    Note: With JWT tokens, logout is typically handled client-side
    by removing the token. This endpoint can be used for tracking
    or revoking tokens server-side if needed.
    
    Args:
        current_user: Current user from JWT token
        
    Returns:
        Success message
    """
    return {
        "detail": "Successfully logged out",
        "message": "Please remove the token from client storage",
    }


@auth_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "auth"}

