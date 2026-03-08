"""FastAPI dependency for extracting the authenticated user from JWT."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.security.jwt import decode_access_token
from src.app.database.session import get_db
from src.app.modules.auth.repository import AuthRepository
from src.app.modules.models import User
from src.app.shared.exceptions.http_exceptions import UnauthorizedError

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    if not credentials:
        raise UnauthorizedError()
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, ValueError):
        raise UnauthorizedError("Invalid token")

    repo = AuthRepository(db)
    user = await repo.get_user_by_id(user_id)
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive")
    return user


# Convenient alias
CurrentUser = Annotated[User, Depends(get_current_user)]
