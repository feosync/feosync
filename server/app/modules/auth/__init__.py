"""
Auth Module - Google OAuth authentication

This module provides Google OAuth2 authentication for FeoSync.
"""

from app.modules.auth.router import auth_router
from app.modules.auth.service import AuthService
from app.modules.auth.repository import UserRepository
from app.modules.auth.dependencies import get_current_user, get_active_user

__all__ = [
    "auth_router",
    "AuthService",
    "UserRepository",
    "get_current_user",
    "get_active_user",
]
