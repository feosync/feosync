from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from uuid import UUID

# ================================================================
from .schemas.scheduled_post_schema import AiResponse, ScheduledPostResponse
from .services.scheduled_post_service import ScheduledPostService
from .services.update_by_service import AiUpdateService as ai_update_service
from .schemas.scheduled_post_schema import ScheduledPostResponse, ScheduledPostCreate, ScheduledPostUpdate

scheduled_post_router = APIRouter()

# ✅ Routes statiques EN PREMIER
@scheduled_post_router.post("/", response_model=ScheduledPostResponse)
def create_scheduled_post(scheduled_create: ScheduledPostCreate, db: Session = Depends(get_db)):
    service = ScheduledPostService()
    return service.create(db=db, scheduled_create=scheduled_create)

@scheduled_post_router.get("/detail/{scheduled_id}", response_model=ScheduledPostResponse)
def get_scheduled_post(scheduled_id: UUID, db: Session = Depends(get_db)):
    service = ScheduledPostService()
    return service.get_by_id(db=db, scheduled_id=scheduled_id)

# ✅ async car update_caption est une coroutine
@scheduled_post_router.patch("/update", response_model=ScheduledPostResponse)
async def update_caption(scheduled_id: UUID, prompt: str, db: Session = Depends(get_db)):
    return await ai_update_service.update_caption(db=db, scheduled_id=scheduled_id, prompt=prompt)

# ✅ Routes dynamiques EN DERNIER
@scheduled_post_router.get("/{schedule_id}", response_model=list[ScheduledPostResponse])
def get_all_scheduled_post(schedule_id: UUID, db: Session = Depends(get_db)):
    service = ScheduledPostService()
    return service.get_all_by_schedule(db=db, schedule_id=schedule_id)

@scheduled_post_router.patch("/{scheduled_id}", response_model=ScheduledPostResponse)
def update_scheduled_post(scheduled_id: UUID, body: ScheduledPostUpdate, db: Session = Depends(get_db)):
    service = ScheduledPostService()
    return service.update(db=db, scheduled_id=scheduled_id, data=body.model_dump(exclude_unset=True))

@scheduled_post_router.delete("/{scheduled_id}")
def delete_scheduled_post(scheduled_id: UUID, db: Session = Depends(get_db)):
    service = ScheduledPostService()
    return service.delete(db=db, scheduled_id=scheduled_id)
