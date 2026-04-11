from sqlalchemy.orm import Session
from app.modules.plans.model import Plan


PLANS = [
    {
        "name": "Free",
        "price": 0.0,
        "max_org": 1,
        "max_ai_image": 0,
        "max_ai_caption": 0,
        "max_post_month": 7,
        "features": ["1 organisation", "7 posts/mois", "Sans IA"],
        "is_active": True,
        "is_default": True,   # ← plan assigné à l'inscription
    },
]


def seed_plans(db: Session) -> None:
    for data in PLANS:
        exists = db.query(Plan).filter_by(name=data["name"]).first()
        if not exists:
            db.add(Plan(**data))
    db.commit()