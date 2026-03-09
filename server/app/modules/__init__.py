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

from app.modules.organisations.models.org_model import organisation
from app.modules.plans.plan_model import Plan
from app.modules.user.user_model import User   
from app.modules.fb_page.fb_model import facebook 
from app.modules.whatsapp.whatsapp_model import whatsapp
from app.modules.ai.ai_gen_model import ai_generattion