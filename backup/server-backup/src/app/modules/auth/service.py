"""Auth service – registration, login, token rotation."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from src.app.core.security.jwt import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    create_refresh_token,
    decode_email_verification_token,
    decode_password_reset_token,
    hash_password,
    verify_password,
)
from src.app.modules.auth.repository import AuthRepository
from src.app.modules.auth.schemas import RegisterRequest, TokenResponse
from src.app.modules.models import User
from src.app.modules.organizations.repository import OrganizationRepository
from src.app.shared.exceptions.http_exceptions import (
    BadRequestError,
    ConflictError,
    NotFoundError,
    UnauthorizedError,
)


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repo = AuthRepository(db)
        self.org_repo = OrganizationRepository(db)

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        existing = await self.repo.get_user_by_email(payload.email)
        if existing:
            raise ConflictError("Email already in use")

        pw_hash = hash_password(payload.password)
        user = await self.repo.create_user(payload.email, pw_hash)
        await self.org_repo.create_organization(user.id, payload.org_name)
        await self.db.flush()

        return await self._issue_tokens(user)

    async def login(
        self,
        email: str,
        password: str,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> TokenResponse:
        user = await self.repo.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("Account is disabled")

        await self.repo.update_last_login(user.id)
        return await self._issue_tokens(user, user_agent=user_agent, ip_address=ip_address)

    async def refresh(
        self,
        raw_token: str,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> TokenResponse:
        token_record = await self.repo.get_refresh_token(raw_token)
        if not token_record:
            raise UnauthorizedError("Invalid refresh token")
        if token_record.revoked:
            raise UnauthorizedError("Refresh token has been revoked")
        if token_record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(tz=timezone.utc):
            raise UnauthorizedError("Refresh token expired")

        # Rotate: revoke old, issue new
        await self.repo.revoke_refresh_token(raw_token)
        user = await self.repo.get_user_by_id(token_record.user_id)
        if not user:
            raise UnauthorizedError("User not found")

        return await self._issue_tokens(user, user_agent=user_agent, ip_address=ip_address)

    async def logout(self, raw_token: str) -> None:
        await self.repo.revoke_refresh_token(raw_token)

    async def logout_all(self, user_id: str) -> None:
        import uuid as _uuid
        await self.repo.revoke_all_user_tokens(_uuid.UUID(user_id))

    async def verify_email(self, token: str) -> None:
        from jose import JWTError
        try:
            email = decode_email_verification_token(token)
        except JWTError:
            raise BadRequestError("Invalid or expired verification token")

        user = await self.repo.get_user_by_email(email)
        if not user:
            raise NotFoundError("User")
        await self.repo.mark_email_verified(user.id)

    async def request_password_reset(self, email: str) -> str:
        """Returns the reset token (caller sends email)."""
        user = await self.repo.get_user_by_email(email)
        if not user:
            # Don't leak existence; return silently but still return a dummy token
            return ""
        return create_password_reset_token(email)

    async def confirm_password_reset(self, token: str, new_password: str) -> None:
        from jose import JWTError
        try:
            email = decode_password_reset_token(token)
        except JWTError:
            raise BadRequestError("Invalid or expired reset token")

        user = await self.repo.get_user_by_email(email)
        if not user:
            raise NotFoundError("User")

        new_hash = hash_password(new_password)
        await self.repo.update_password(user.id, new_hash)
        await self.repo.revoke_all_user_tokens(user.id)

    # ── Private helpers ───────────────────────────────────────────────────────

    async def _issue_tokens(
        self,
        user: User,
        user_agent: str | None = None,
        ip_address: str | None = None,
    ) -> TokenResponse:
        from src.app.core.config.settings import settings

        access = create_access_token(
            subject=str(user.id),
            extra_claims={"email": user.email},
        )
        raw_refresh, expires_at = create_refresh_token(str(user.id))
        await self.repo.save_refresh_token(
            user.id, raw_refresh, expires_at,
            user_agent=user_agent, ip_address=ip_address,
        )
        return TokenResponse(
            access_token=access,
            refresh_token=raw_refresh,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )
