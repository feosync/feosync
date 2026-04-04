from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.published_post.model import PublishedPost
from datetime import date, timedelta
from sqlalchemy import extract, or_
from app.shared.pagination.paginator import PaginationParams


class PublishedPostRepository:



    @staticmethod
    def get_all_by_org(
        db: Session,
        org_id: UUID,
        params: PaginationParams,
        search: str | None = None,
        year: int | None = None,
        month: int | None = None,
        week: int | None = None,
    ) -> tuple[list[PublishedPost], int]:
        from app.modules.fb_page.model import Facebook

        query = (
            db.query(PublishedPost)
            .join(Facebook, PublishedPost.facebook_page_id == Facebook.id)
            .filter(Facebook.organisation_id == org_id)
        )

        if search:
            # recherche sur post_id ou channel — adapte selon tes besoins
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    PublishedPost.post_id.ilike(term),
                    PublishedPost.channel.ilike(term),
                )
            )

        if year:
            query = query.filter(extract("year", PublishedPost.published_at) == year)

        if month:
            query = query.filter(extract("month", PublishedPost.published_at) == month)

        if week and year:
            week_start = date.fromisocalendar(year, week, 1)
            week_end   = date.fromisocalendar(year, week, 7)
            query = query.filter(
                PublishedPost.published_at >= week_start,
                PublishedPost.published_at <  week_end + timedelta(days=1),
            )

        total = query.count()
        items = (
            query
            .order_by(PublishedPost.published_at.desc())
            .offset(params.offset)
            .limit(params.limit)
            .all()
        )
        return items, total

    @staticmethod
    def get_by_id(db: Session, post_id: UUID) -> PublishedPost | None:
        return db.query(PublishedPost).filter(PublishedPost.id == post_id).first()
    
    @staticmethod
    def get_by_post_id_with_page_id(db:Session, post_id:str):
        return db.query(PublishedPost).filter(PublishedPost.post_id == post_id).first()
    
    @staticmethod
    def get_by_scheduled_post(db: Session, scheduled_post_id: UUID) -> PublishedPost | None:
        return db.query(PublishedPost).filter(
            PublishedPost.scheduled_post_id == scheduled_post_id
        ).first()

    @staticmethod
    def get_by_page(db: Session, facebook_page_id: UUID) -> list[PublishedPost]:
        return (
            db.query(PublishedPost)
            .filter(PublishedPost.facebook_page_id == facebook_page_id)
            .order_by(PublishedPost.published_at.desc())
            .all()
        )

    @staticmethod
    def create(db: Session, data: dict) -> PublishedPost:
        post = PublishedPost(**data)
        db.add(post)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def update(db: Session, post: PublishedPost, data: dict) -> PublishedPost:
        for key, value in data.items():
            if hasattr(post, key) and value is not None:
                setattr(post, key, value)
        db.commit()
        db.refresh(post)
        return post


    @staticmethod
    def set_auto_comment(
        db: Session,
        post: PublishedPost,
        is_auto_comment: bool,
        instructions: str | None,
        keywords: str | None,
    ) -> PublishedPost:
        post.is_auto_comment = is_auto_comment
        post.instructions    = instructions
        post.keywords        = keywords
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def delete(db: Session, post: PublishedPost) -> None:
        db.delete(post)
        db.commit()