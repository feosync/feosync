from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.published_post.model import PublishedPost
from datetime import date, timedelta
from sqlalchemy import extract, or_
from app.shared.pagination.paginator import PaginationParams


class PublishedPostRepository:
    # Repository pour gérer les opérations liées aux PublishedPost
    # (lecture, création, mise à jour, suppression)



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
        # Import local pour éviter les dépendances circulaires
        from app.modules.fb_page.model import Facebook

        # Construction de la requête de base :
        # - jointure entre PublishedPost et Facebook
        # - filtrage par organisation
        query = (
            db.query(PublishedPost)
            .join(Facebook, PublishedPost.facebook_page_id == Facebook.id)
            .filter(Facebook.organisation_id == org_id)
        )

        if search:
            # Recherche textuelle sur post_id ou channel
            # ilike = insensible à la casse
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    PublishedPost.post_id.ilike(term),
                    PublishedPost.channel.ilike(term),
                )
            )

        if year:
            # Filtrer par année de publication
            query = query.filter(extract("year", PublishedPost.published_at) == year)

        if month:
            # Filtrer par mois de publication
            query = query.filter(extract("month", PublishedPost.published_at) == month)

        if week and year:
            # Calcul du début et de la fin de la semaine ISO
            # (ex: semaine 1, 2, etc.)
            week_start = date.fromisocalendar(year, week, 1)
            week_end   = date.fromisocalendar(year, week, 7)

            # Filtrer les posts dans cette plage de dates
            query = query.filter(
                PublishedPost.published_at >= week_start,
                PublishedPost.published_at <  week_end + timedelta(days=1),
            )

        # Nombre total d'éléments (avant pagination)
        total = query.count()

        # Récupération des éléments paginés
        items = (
            query
            # Tri du plus récent au plus ancien
            .order_by(PublishedPost.published_at.desc())
            # Pagination
            .offset(params.offset)
            .limit(params.limit)
            .all()
        )

        # Retourne les résultats + le total
        return items, total

    @staticmethod
    def get_by_post_model_id(db: Session, post_id_model: UUID) -> PublishedPost | None:
        # Récupérer un post par son ID principal
        return db.query(PublishedPost).filter(PublishedPost.id == post_id_model).first()
    @staticmethod
    def get_by_post_id(db: Session, post_id: str) -> PublishedPost | None:
        # Récupérer un post par son ID principal
        return db.query(PublishedPost).filter(PublishedPost.post_id == post_id).first()
    
    @staticmethod
    def get_by_scheduled_post(db: Session, scheduled_post_id: UUID) -> PublishedPost | None:
        # Récupérer un post publié à partir de l'ID du post planifié
        return db.query(PublishedPost).filter(
            PublishedPost.scheduled_post_id == scheduled_post_id
        ).first()

    @staticmethod
    def get_by_page(db: Session, facebook_page_id: UUID) -> list[PublishedPost]:
        # Récupérer tous les posts d'une page Facebook donnée
        return (
            db.query(PublishedPost)
            .filter(PublishedPost.facebook_page_id == facebook_page_id)
            # Trier du plus récent au plus ancien
            .order_by(PublishedPost.published_at.desc())
            .all()
        )

    @staticmethod
    def create(db: Session, data: dict) -> PublishedPost:
        # Création d'un nouveau PublishedPost à partir d'un dictionnaire
        post = PublishedPost(**data)

        # Ajout dans la session
        db.add(post)

        # Sauvegarde en base de données
        db.commit()

        # Rafraîchir l'objet avec les données de la DB (id, timestamps, etc.)
        db.refresh(post)

        return post

    @staticmethod
    def update(db: Session, post: PublishedPost, data: dict) -> PublishedPost:
        # Mise à jour dynamique des champs du post
        for key, value in data.items():
            # Vérifie que l'attribut existe et que la valeur n'est pas None
            if hasattr(post, key) and value is not None:
                setattr(post, key, value)

        # Sauvegarde des modifications
        db.commit()

        # Rafraîchir les données
        db.refresh(post)

        return post

    @staticmethod
    def delete(db: Session, post: PublishedPost) -> None:
        # Suppression du post
        db.delete(post)

        # Appliquer la suppression en base
        db.commit()