from sqlalchemy.orm import declarative_base # type: ignore

Base = declarative_base()

from app.modules.plans.plan_model import Plan
from app.modules.user.user_model import User
from app.modules.organisations.models.org_model import organisation
