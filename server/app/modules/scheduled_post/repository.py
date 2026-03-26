from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from app.modules.scheduled_post.models.scheduled_post_model import ScheduledPost
from app.modules.scheduled_post.models.scheduled_post_ai_image import ScheduledPostAiImage
from datetime import date, timedelta
from sqlalchemy import extract, and_
from app.shared.pagination.paginator import PaginationParams
from app.modules.scheduled_post.models.scheduled_post_model import PostStatus

class ScheduledPostRepository:

    @staticmethod
    def create(db: Session, data: dict) -> ScheduledPost:
        post = ScheduledPost(**data)
        db.add(post)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def get_by_id(db: Session, post_id: UUID) -> ScheduledPost | None:
        return db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()

    @staticmethod
    def get_by_org(db: Session, org_id: UUID) -> list[ScheduledPost]:
        return (
            db.query(ScheduledPost)
            .filter(ScheduledPost.organisation_id == org_id)
            .order_by(ScheduledPost.created_at.desc())
            .all()
        )



    @staticmethod
    def get_by_org_paginated(
        db: Session,
        org_id: UUID,
        params: PaginationParams,
        status: PostStatus | None = None,
        search: str | None = None,
        year: int | None = None,
        month: int | None = None,
        week: int | None = None,
    ) -> tuple[list[ScheduledPost], int]:
        query = db.query(ScheduledPost).filter(
            ScheduledPost.organisation_id == org_id
        )

        if status:
            query = query.filter(ScheduledPost.status == status)

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(ScheduledPost.caption.ilike(term))

        if year:
            query = query.filter(extract("year", ScheduledPost.created_at) == year)

        if month:
            query = query.filter(extract("month", ScheduledPost.created_at) == month)

        if week and year:
            week_start = date.fromisocalendar(year, week, 1)   
            week_end   = date.fromisocalendar(year, week, 7)   
            query = query.filter(
                ScheduledPost.created_at >= week_start,
                ScheduledPost.created_at <  week_end + timedelta(days=1),
            )

        total = query.count()
        items = (
            query
            .order_by(ScheduledPost.created_at.desc())
            .offset(params.offset)
            .limit(params.limit)
            .all()
        )
        return items, total

    @staticmethod
    def update(db: Session, post: ScheduledPost, data: dict) -> ScheduledPost:
        for key, value in data.items():
            if hasattr(post, key):
                setattr(post, key, value)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def delete(db: Session, post: ScheduledPost) -> None:
        db.delete(post)
        db.commit()


class AiImageRepository:

    @staticmethod
    def deactivate_all(db: Session, post_id: UUID) -> None:
        db.query(ScheduledPostAiImage).filter(
            ScheduledPostAiImage.scheduled_post_id == post_id,
            ScheduledPostAiImage.is_active == True,
        ).update({
            "is_active": False,
            "replaced_at": datetime.now(timezone.utc),
        })
        db.commit()

    @staticmethod
    def create(db: Session, data: dict) -> ScheduledPostAiImage:
        img = ScheduledPostAiImage(**data)
        db.add(img)
        db.commit()
        db.refresh(img)
        return img