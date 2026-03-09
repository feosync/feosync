"""
Modules package for the FeoSync application.

This package contains all the core modules used by the server application.
"""

# Import modules here to make them available at the package level

from app.modules.auth.router import auth_router
from app.modules.ai.router import ai_router
from app.modules.fb_page.router import fb_page_router
from app.modules.notifications.router import notif_router
from app.modules.organisations.router import organisation_router            