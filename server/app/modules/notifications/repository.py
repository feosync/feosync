from uuid import UUID
from sqlalchemy.orm import Session
from app.modules.notifications.model import Notification


class NotificationRepository:

    @staticmethod
    def get_by_user(
        db: Session,
        user_id: UUID,
        unread_only: bool = False
    ) -> list[Notification]:
        q = db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            q = q.filter(Notification.is_read == False)
        return q.order_by(Notification.created_at.desc()).all()

    @staticmethod
    def get_by_id(db: Session, notif_id: UUID) -> Notification | None:
        return db.query(Notification).filter(Notification.id == notif_id).first()

    @staticmethod
    def get_summary(db: Session, user_id: UUID) -> dict:
        total = db.query(Notification).filter(Notification.user_id == user_id).count()
        unread = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
        return {"total": total, "unread": unread}

    @staticmethod
    def create(db: Session, data: dict) -> Notification:
        notif = Notification(**data)
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def mark_read(db: Session, notif_id: UUID, user_id: UUID) -> Notification | None:
        notif = db.query(Notification).filter(
            Notification.id == notif_id,
            Notification.user_id == user_id
        ).first()
        if notif:
            notif.is_read = True
            db.commit()
            db.refresh(notif)
        return notif

    @staticmethod
    def mark_all_read(db: Session, user_id: UUID) -> int:
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return count

    @staticmethod
    def mark_email_sent(db: Session, notif_id: UUID) -> None:
        notif = db.query(Notification).filter(Notification.id == notif_id).first()
        if notif:
            notif.email_sent = True
            db.commit()

    @staticmethod
    def delete(db: Session, notif_id: UUID, user_id: UUID) -> bool:
        notif = db.query(Notification).filter(
            Notification.id == notif_id,
            Notification.user_id == user_id
        ).first()
        if notif:
            db.delete(notif)
            db.commit()
            return True
        return False