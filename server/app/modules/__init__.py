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
from app.modules.plans.router import plans_router 
from app.modules.schedule.router import schedule_router

from app.modules.organisations.model import Organisation
from app.modules.plans.plan_model import Plan
from app.modules.user.user_model import User   
from app.modules.fb_page.models.fb_model import Facebook 
from app.modules.whatsapp.whatsapp_model import Whatsapp
from app.modules.ai.ai_gen_model import AiGeneration
from app.modules.post_template.models.post_temp_model import PostTemplate
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from app.modules.published_post.published_post_model import PublishedPost
from app.modules.post_analitycs.post_analitycs_model import PostAnalitycs  
from app.modules.fb_page.models.page_insights import PageInsights
from app.modules.refresh_token.refresh_token_model import FreshToken
from app.modules.schedule.models.schedule_model import Schedule
