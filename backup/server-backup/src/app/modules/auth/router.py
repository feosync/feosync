"""Authentication endpoints."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Request

from src.app.database.session import DbSession
from src.app.modules.auth.schemas import (
    EmailVerifyRequest,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from src.app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, db: DbSession) -> TokenResponse:
    """Create a new user account + organization."""
    return await AuthService(db).register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, request: Request, db: DbSession) -> TokenResponse:
    return await AuthService(db).login(
        payload.email,
        payload.password,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshTokenRequest, request: Request, db: DbSession) -> TokenResponse:
    return await AuthService(db).refresh(
        payload.refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )


@router.post("/logout", status_code=204)
async def logout(payload: RefreshTokenRequest, db: DbSession) -> None:
    await AuthService(db).logout(payload.refresh_token)


@router.post("/logout-all", status_code=204)
async def logout_all(request: Request, db: DbSession) -> None:
    from src.app.modules.auth.dependencies import get_current_user
    user = await get_current_user(request, db)
    await AuthService(db).logout_all(str(user.id))


@router.post("/verify-email", status_code=204)
async def verify_email(payload: EmailVerifyRequest, db: DbSession) -> None:
    await AuthService(db).verify_email(payload.token)


@router.post("/password-reset/request", status_code=204)
async def request_password_reset(
    payload: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: DbSession,
) -> None:
    svc = AuthService(db)
    token = await svc.request_password_reset(payload.email)
    if token:
        from src.app.modules.notifications.email_service import send_password_reset_email
        background_tasks.add_task(send_password_reset_email, payload.email, token)


@router.post("/password-reset/confirm", status_code=204)
async def confirm_password_reset(payload: PasswordResetConfirm, db: DbSession) -> None:
    await AuthService(db).confirm_password_reset(payload.token, payload.new_password)
