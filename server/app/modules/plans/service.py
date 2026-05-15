from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from .model import Plan
from .repository import PlanRepository
from .schemas import PlanCreate, PlanUpdate
from app.modules.user.model import User
from app.modules.payment.service.subscription import SubscriptionService 
from app.modules.payment.schemas.subscription import ProductResponse, PriceResponse
sub_service = SubscriptionService()
class PlanService:

    # ── Admin : CRUD ──────────────────────────────────────────────────────────

    @staticmethod
    def create(db: Session, payload: PlanCreate, current_user: User) -> Plan:
        existing = db.query(Plan).filter(Plan.name == payload.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Un plan nommé '{payload.name}' existe déjà"
            )
        product:ProductResponse = sub_service.create_product(name=payload.name, description= str(payload.features))
        if not product or not product.id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur lors de la création du produit Stripe"
            )
            
        price:PriceResponse = sub_service.create_price(
            product_id=product.id,
            unit_amount=int(payload.price*100),
            currency="EUR",
            recurring_interval= "month"
            )
        if not price or not price.id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erreur lors de la création du prix Stripe"
            )
            
        payload.price_id = price.id
        return PlanRepository.create(db, payload.model_dump())

    @staticmethod
    def update(db: Session, plan_id: int, payload: PlanUpdate, current_user: User) -> Plan:
        plan = _get_or_404(db, plan_id)
        return PlanRepository.update(db, plan, payload.model_dump(exclude_unset=True))

    @staticmethod
    def delete(db: Session, plan_id: int, current_user: User) -> dict:
        plan = _get_or_404(db, plan_id)

        # Vérifie qu'aucun utilisateur actif n'est sur ce plan
        if plan.user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"{len(plan.user)} utilisateur(s) sont sur ce plan — désactivez-le plutôt"
            )
        PlanRepository.delete(db, plan)
        return {"detail": f"Plan '{plan.name}' supprimé"}

    # ── Public : lecture ──────────────────────────────────────────────────────

    @staticmethod
    def get_all_public(db: Session) -> list[Plan]:
        """Retourne uniquement les plans actifs (vue utilisateur)"""
        return PlanRepository.get_all(db, active_only=True)

    @staticmethod
    def get_all_admin(db: Session, current_user: User) -> list[Plan]:
        """Retourne tous les plans y compris inactifs (vue admin)"""
        
        return PlanRepository.get_all(db, active_only=False)

    @staticmethod
    def get_by_id(db: Session, plan_id: int) -> Plan:
        return _get_or_404(db, plan_id)

    # ── User : souscrire / changer de plan ───────────────────────────────────

    @staticmethod
    def subscribe(db: Session, plan_id: int, current_user: User) -> User:
        plan = _get_or_404(db, plan_id)
        if not plan.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce plan n'est plus disponible"
            )
        current_user.plan_id = plan.id
        db.commit()
        db.refresh(current_user)
        return current_user

    @staticmethod
    def unsubscribe(db: Session, current_user: User) -> User:
        """Passe l'utilisateur sur le plan gratuit (None)"""
        current_user.plan_id = None
        db.commit()
        db.refresh(current_user)
        return current_user
    
    @staticmethod
    def get_by_stripe_price_id(db: Session, price_id: str) -> Plan | None:
        return PlanRepository.get_by_stripe_price_id(db, price_id)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _get_or_404(db: Session, plan_id: int) -> Plan:
    plan = PlanRepository.get_by_id(db, plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan {plan_id} introuvable"
        )
    return plan