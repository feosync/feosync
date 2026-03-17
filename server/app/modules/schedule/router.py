# ==============================
# 🔹 Imports FastAPI (routing & dépendances)
# ==============================
from fastapi import APIRouter, Depends

# ==============================
# 🔹 Base de données (SQLAlchemy)
# ==============================
from sqlalchemy.orm import Session

# ==============================
# 🔹 Types & utilitaires
# ==============================
from uuid import UUID

# ==============================
# 🔹 Core (config globale de l'app)
# ==============================
from app.core.database import get_db

# ==============================
# 🔹 Schémas (DTO / validation des données)
# ==============================
from .schema import ScheduleCreate, ScheduleResponse, ScheduleUpdate
from app.modules.scheduled_post.schemas.scheduled_post_schema import ScheduledPostResponse

# ==============================
# 🔹 Services (logique métier)
# ==============================
from .service import ScheduleService 

# ==============================
# 🔹 Modèles (ORM / DB)
# ==============================
from app.modules.user.model import User

# ==============================
# 🔹 Authentification & sécurité
# ==============================
from app.modules.auth.dependencies import get_active_user



schedule_router = APIRouter()

@schedule_router.post("/add")
async def add_schedule(
    schedule_create:ScheduleCreate,
    db: Session = Depends(get_db),
    user:User=Depends(get_active_user))->tuple[ScheduleResponse, ScheduledPostResponse]:
    service = ScheduleService()
    return await service.create_scheduled_post(db=db, schedule_create=schedule_create)


@schedule_router.get("/")
def get_all(db:Session = Depends(get_db), user:User=Depends(get_active_user))->list[ScheduleResponse]:
    service = ScheduleService()
    return service.get_all(db=db)

@schedule_router.get("/{schedule_id}")
def get_schedule_by_id(schedule_id: UUID, db:Session=Depends(get_db)):
    service = ScheduleService()
    return service.get_schedule_by_id(schedule_id=schedule_id,db=db)


@schedule_router.patch("/update/{schedule_id}")
def update_schedule(
    schedule_update:ScheduleUpdate, 
    schedule_id:UUID, 
    db:Session=Depends(get_db),
    user:User=Depends(get_active_user)):
    service = ScheduleService()
    return service.update_schedule(schedule_id=schedule_id, payload=schedule_update, db=db)

@schedule_router.delete("/delete/{schedule_id}")
def delete_schedule(schedule_id:UUID, db:Session=Depends(get_db)):
    service = ScheduleService()
    return service.delete_schedule(db=db, schedule_id=schedule_id)