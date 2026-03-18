from contextvars import ContextVar

# ✅ Variable de contexte — propre à chaque requête
current_token: ContextVar[str | None] = ContextVar("current_token", default=None)
current_user_id:  ContextVar[str | None] = ContextVar("current_user", default=None)
current_user_email:  ContextVar[str | None] = ContextVar("current_user_email", default=None)
