"""
Auth Router - Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.auth.schemas import (
    GoogleTokenRequest,
        GoogleCallbackRequest,
    UserResponse,
    AuthError,
)
from app.modules.auth.service import AuthService
from app.modules.auth.dependencies import get_current_user, get_active_user
from app.modules.user.model import User
from app.core.config import settings

import httpx


auth_router = APIRouter()

is_production = settings.APP_ENV == "production"
def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,    # JS ne peut pas lire → protège contre XSS
        secure=is_production,     # True en production HTTPS
        samesite="none" if is_production else "lax",  # none partout, secure selon env
        max_age=86400,    # 24h en secondes
        path="/",         # cookie valide sur toutes les routes
    )

@auth_router.post(
    "/google/auth",
    responses={
        400: {"model": AuthError, "description": "Invalid token"},
        401: {"model": AuthError, "description": "Token verification failed"},
    },
)
async def google_auth(
    request: GoogleTokenRequest,
    background_tasks: BackgroundTasks,
    response: Response,
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
            db, google_user_info, background_tasks 
        )
        print("Authenticated user:", user.email, "Access token:", access_token)  # Debug log
        _set_auth_cookie(response, access_token)  # Set cookie for browser clients
        return {
            "message": "Authentication successful",
            "user": UserResponse.model_validate(user),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to authenticate user: {str(e)}",
        )


@auth_router.post("/google/callback")
async def google_callback(
    request: GoogleCallbackRequest,
    background_tasks: BackgroundTasks,
    response: Response,
    db: Session = Depends(get_db),
):
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": request.code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": request.redirect_uri,
                "grant_type": "authorization_code",
            }
        )
    token_data = r.json()
    if "error" in token_data:
        raise HTTPException(status_code=400, detail=token_data.get("error_description", "OAuth error"))

    id_token = token_data.get("id_token")
    google_user_info = AuthService.verify_google_token(id_token)
    if not google_user_info:
        raise HTTPException(status_code=401, detail="Token Google invalide")

    user, access_token = AuthService.authenticate_google_user(
        db, google_user_info, background_tasks  # ← passe ici
    )
    print("Authenticated user:", user.email, "Access token:", access_token)  # Debug log

    _set_auth_cookie(response, access_token)  # Set cookie for browser clients
    return {
        "message": "Authentication successful",
        "user": UserResponse.model_validate(user),
    }

@auth_router.get(
    "/me",
    response_model=UserResponse,
    responses={
        401: {"model": AuthError, "description": "Missing or invalid Bearer token"},
    },
    summary="Get current user info",
    tags=["User Info"],
)
async def get_current_user_info(
    current_user: User = Depends(get_active_user),
):
    """
    Get current authenticated user information
    
    **Security:** Requires valid JWT Bearer token from Google OAuth authentication
    
    Usage:
    1. Call POST /google/auth with Google ID token → get access_token
    2. Use the access_token with Bearer authentication: `Authorization: Bearer {access_token}`
    3. This endpoint returns your current user profile
    
    Args:
        current_user: Current active user from Bearer JWT token
        
    Returns:
        UserResponse: Current user information (id, name, email, profile_picture, etc.)
        
    Raises:
        HTTPException 401: If Bearer token is missing or invalid
        HTTPException 403: If user account is deactivated
    """
    print("Current user info requested for:", current_user.email)  # Debug log
    return UserResponse.model_validate(current_user)


@auth_router.post(
    "/logout",
    responses={
        200: {"description": "Successfully logged out"},
        401: {"model": AuthError, "description": "Missing or invalid Bearer token"},
        403: {"model": AuthError, "description": "User account is deactivated"},
    },
    summary="Logout user",
    tags=["User Info"],
)
async def logout(
    response: Response,
    current_user: User = Depends(get_active_user),
):
    response.delete_cookie(                           # ← supprime le cookie
        key="access_token",
        path="/",
        httponly=True,
        secure=is_production,     # même valeur que dans set_cookie
        samesite= "none" if is_production else "lax",
    )
   
    return {"detail": "Déconnecté avec succès", "status": "success"}



@auth_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "auth"}


@auth_router.get("/debug/validate")
async def debug_validate(authorization: str | None = Header(None)):
    """
    Debug token validation endpoint
    Shows what the server receives from Authorization header
    Useful for troubleshooting Bearer token issues
    """
    return {
        "authorization_header_received": authorization,
        "instruction_1": "Make sure you send: Authorization: Bearer {your_token}",
        "instruction_2": "The header value should start with 'Bearer '",
        "your_current_header": authorization if authorization else "NO HEADER RECEIVED",
        "status": "valid" if authorization and authorization.startswith("Bearer ") else "INVALID or MISSING"
    }

