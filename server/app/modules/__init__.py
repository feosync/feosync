"""
Modules package for the FeoSync application.

This package contains all the core modules used by the server application.
"""

# Import modules here to make them available at the package level
# =====================================================================
#              ALLL ROUTER IMPORT
# =====================================================================
from app.modules.auth.router import auth_router
from app.modules.ai_generation.router import ai_router
from app.modules.fb_page.router import fb_page_router
from app.modules.notifications.router import notif_router
from app.modules.organisations.router import organisation_router    
from app.modules.plans.router import plans_router 
from app.modules.scheduled_post.router import scheduled_post_router
from app.modules.post_template.router import post_template_router
from app.modules.published_post.router import published_post_router
from app.modules.post_analytics.router import  post_analytics_router
from app.modules.user.router import user_router, admin_user_router
from app.modules.Webhooks.router import app_webhooks_router
from app.modules.collaborators.router import router as collaborators_router
from app.modules.payment.router.transaction import app_payment_router
from app.modules.payment.router.subcription import subcription_router
from app.modules.payment.router.webhook import webhook_router

from app.modules.organisations.model import Organisation
from app.modules.plans.model import Plan
from app.modules.user.model import User   
from app.modules.fb_page.model import Facebook , PageInsights
from app.modules.whatsapp.whatsapp_model import Whatsapp
from app.modules.ai_generation.models.ai_generation_model import AiGeneration
from app.modules.post_template.model import PostTemplate
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from app.modules.published_post.model import PublishedPost
from app.modules.post_analytics.model import PostAnalytics
from app.modules.refresh_token.refresh_token_model import FreshToken
from app.modules.collaborators.model import Collaborator, Invitation
from app.modules.scheduled_post.models.scheduled_post_image import ScheduledPostImage
from app.modules.payment.models.subscription import Subscription
