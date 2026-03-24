

from requests import Session
from sqlalchemy.orm import Session
from app.core.config import settings
from app.modules.user.model import User

def seed_first_admin(db: Session):
    user = db.query(User).filter_by(email=settings.FIRST_ADMIN_EMAIL).first()
    if user:
        user.is_admin = True
        db.commit()