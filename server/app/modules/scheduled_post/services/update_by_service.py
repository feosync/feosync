# i--------------MODEL AND SCHEMA IMPORT --------------------
from ..schemas.ai_image_schema import ScheduledPostAiImageCreate as AiImgCreate, ScheduledResponse
from ..models.scheduled_post_ai_image import ScheduledPostAiImage
from ..models.scheduled_post_model import *
from ..schemas.scheduled_post_schema import AiCreate, AiResponse

# -----------------REPOSITORY AND SERVICE ---------------------------
from ..repository.ai_imge_repository import AiImageRepository as ai_image_repository
from ..services.scheduled_post_service import ScheduledPostService as scheduled_service
from .scheduled_post_service import ScheduledPostService as schedule_service

# --------------------AUTRE ------------------------------
from sqlalchemy.orm import Session 
from datetime import UTC, datetime
from . import update_by_service
from uuid import UUID
import httpx



class AiUpdateService:
    def __init__(self):
        pass
    
    # ✅ staticmethod car pas besoin de self/cls
    @staticmethod
    def add_ai_image(db: Session, ai_img_create: AiImgCreate):
        return ai_image_repository.add_ai_image(db=db, ai_image=ai_img_create.model_dump())
    
    @staticmethod
    async def get_schedule_by_id(schedule_id: UUID) -> ScheduledResponse:
        # ✅ f-string pour interpoler l'URL
        api_url = f"http://localhost:8000/api/v1/schedule/{schedule_id}"
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url)
            response.raise_for_status()
        return ScheduledResponse(**response.json())  # ✅ désérialiser le JSON
    
    @staticmethod
    async def generate_caption(ai_create: AiCreate) -> AiResponse:
        api_url = "http://localhost:8000/api/v1/ai/generate"
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url, json=ai_create.model_dump(mode="json"))
            response.raise_for_status()
            data = response.json()
            if isinstance(data.get("output_data"), str):
                data["output_data"] = {"content": data["output_data"]}
            
            return AiResponse(**data)
            
    
    @staticmethod
    async def update_caption(db: Session, scheduled_id: UUID, prompt: str):
        scheduled = scheduled_service.get_by_id(db=db, scheduled_id=scheduled_id)
        if not scheduled:
            raise ValueError("Scheduled post introuvable")

        schedule: ScheduledResponse = await AiUpdateService.get_schedule_by_id(scheduled.schedule_id)

        ai_create = AiCreate(
            organisation_id=schedule.organisation_id,
            prompt_used=prompt,
            model_used="gemini-3-flash-preview",
        )

        ai_response: AiResponse = await AiUpdateService.generate_caption(ai_create)

        caption = (
            ai_response.output_data.get("content")
            if isinstance(ai_response.output_data, dict)
            else ai_response.output_data
        )

        updated = scheduled_service.update(
            data={"caption": caption},
            db=db,
            scheduled_id=scheduled_id,
        )

        # Return a dict (or schema instance) that includes both
        return {
            **updated.__dict__,
            "ai_generation_id": ai_response.id,  # or whatever field name maps here
        }
