from app.celery_app import celery_app
import httpx
import asyncio


async def _do_publish(scheduled_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url="http://localhost:8000/api/v1/published/publish",  # ✅ = et pas :
            json={"scheduled_id": scheduled_id},                  # ✅ json= et pas data=
        )
        response.raise_for_status()
        return response.json()


@celery_app.task(bind=True, max_retries=3)
def published_task(self, scheduled_id: str):          # ✅ str et pas UUID
    try:
        result = asyncio.run(_do_publish(scheduled_id))  # ✅ asyncio.run()
        print(f"✅ Publié avec succès : {scheduled_id}")
        return result
    except Exception as exc:
        print(f"❌ Erreur : {exc}")
        raise self.retry(exc=exc, countdown=10)