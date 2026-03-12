"""
FeoSync – complete ORM model set.
All models live here so Alembic's env.py has a single import target.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


# ── Enums ────────────────────────────────────────────────────────────────────

class OrgSector(str, enum.Enum):
    RESTAURANT = "restaurant"
    RETAIL = "retail"
    HOTEL = "hotel"
    HEALTH = "health"
    EDUCATION = "education"
    AGENCY = "agency"
    OTHER = "other"


class OrgTone(str, enum.Enum):
    FORMAL = "formal"
    CASUAL = "casual"
    HUMOROUS = "humorous"
    INSPIRATIONAL = "inspirational"
    PROFESSIONAL = "professional"


class ScheduleRuleType(str, enum.Enum):
    FIXED_TIME = "fixed_time"
    RECURRING = "recurring"
    EVENT_TRIGGERED = "event_triggered"


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PublishedChannel(str, enum.Enum):
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    WHATSAPP = "whatsapp"


class ReviewSource(str, enum.Enum):
    GOOGLE = "google"
    FACEBOOK = "facebook"
    TRIPADVISOR = "tripadvisor"
    MANUAL = "manual"


class ScheduleLogStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


class UserRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


# ── Plan ─────────────────────────────────────────────────────────────────────

class Plan(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "plans"

    name: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    price_ariary: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_pages: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)
    max_posts_month: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    max_ai_gen: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    max_schedules: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    features: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="plan")


# ── User ─────────────────────────────────────────────────────────────────────

class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("plans.id", ondelete="SET NULL"), nullable=True
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), nullable=False, default=UserRole.OWNER
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # relationships
    plan: Mapped["Plan | None"] = relationship("Plan", back_populates="users")
    organization: Mapped["Organization | None"] = relationship(
        "Organization", back_populates="user", uselist=False
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )


# ── Organization ─────────────────────────────────────────────────────────────

class Organization(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "organizations"
    __table_args__ = (UniqueConstraint("user_id", name="uq_org_user"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sector: Mapped[OrgSector | None] = mapped_column(
        Enum(OrgSector, name="org_sector"), nullable=True
    )
    tone: Mapped[OrgTone | None] = mapped_column(
        Enum(OrgTone, name="org_tone"), nullable=True
    )
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    brand_colors: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    editorial_profile: Mapped[str | None] = mapped_column(Text, nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="organization")
    facebook_pages: Mapped[list["FacebookPage"]] = relationship(
        "FacebookPage", back_populates="organization", cascade="all, delete-orphan"
    )
    whatsapp_account: Mapped["WhatsAppAccount | None"] = relationship(
        "WhatsAppAccount", back_populates="organization", uselist=False, cascade="all, delete-orphan"
    )
    post_templates: Mapped[list["PostTemplate"]] = relationship(
        "PostTemplate", back_populates="organization", cascade="all, delete-orphan"
    )
    schedules: Mapped[list["Schedule"]] = relationship(
        "Schedule", back_populates="organization", cascade="all, delete-orphan"
    )
    scheduled_posts: Mapped[list["ScheduledPost"]] = relationship(
        "ScheduledPost", back_populates="organization", cascade="all, delete-orphan"
    )
    ai_generations: Mapped[list["AIGeneration"]] = relationship(
        "AIGeneration", back_populates="organization", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="organization", cascade="all, delete-orphan"
    )


# ── Facebook Page ─────────────────────────────────────────────────────────────

class FacebookPage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "facebook_pages"

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    fb_page_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    page_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    access_token_enc: Mapped[str] = mapped_column(Text, nullable=False)  # Fernet-encrypted
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    picture_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    fan_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="facebook_pages")
    page_insights: Mapped[list["PageInsight"]] = relationship(
        "PageInsight", back_populates="facebook_page", cascade="all, delete-orphan"
    )


# ── WhatsApp Account ─────────────────────────────────────────────────────────

class WhatsAppAccount(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "whatsapp_accounts"
    __table_args__ = (UniqueConstraint("org_id", name="uq_wa_org"),)

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    phone: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    waba_id: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    access_token_enc: Mapped[str] = mapped_column(Text, nullable=False)
    broadcast_lists: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="whatsapp_account")


# ── Post Template ─────────────────────────────────────────────────────────────

class PostTemplate(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "post_templates"

    org_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    asset_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    zones: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)  # layout zones config
    caption_template: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_app_template: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    usage_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships
    organization: Mapped["Organization | None"] = relationship("Organization", back_populates="post_templates")


# ── Schedule ──────────────────────────────────────────────────────────────────

class Schedule(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "schedules"

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    rule_type: Mapped[ScheduleRuleType] = mapped_column(
        Enum(ScheduleRuleType, name="schedule_rule_type"), nullable=False
    )
    cron_expr: Mapped[str | None] = mapped_column(String(100), nullable=True)
    data_source_config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("post_templates.id", ondelete="SET NULL"), nullable=True
    )
    channels: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    page_ids: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    next_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="schedules")
    template: Mapped["PostTemplate | None"] = relationship("PostTemplate")
    logs: Mapped[list["ScheduleLog"]] = relationship(
        "ScheduleLog", back_populates="schedule", cascade="all, delete-orphan"
    )
    scheduled_posts: Mapped[list["ScheduledPost"]] = relationship(
        "ScheduledPost", back_populates="rule", foreign_keys="[ScheduledPost.rule_id]"
    )


# ── Scheduled Post ─────────────────────────────────────────────────────────────

class ScheduledPost(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "scheduled_posts"

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False
    )
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    publish_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    status: Mapped[PostStatus] = mapped_column(
        Enum(PostStatus, name="post_status"), nullable=False, default=PostStatus.SCHEDULED, index=True
    )
    channels: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    page_ids: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    rule_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("schedules.id", ondelete="SET NULL"), nullable=True
    )
    ai_gen_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ai_generations.id", ondelete="SET NULL"), nullable=True
    )
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("post_templates.id", ondelete="SET NULL"), nullable=True
    )
    retry_count: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="scheduled_posts")
    rule: Mapped["Schedule | None"] = relationship(
        "Schedule", back_populates="scheduled_posts", foreign_keys=[rule_id]
    )
    ai_generation: Mapped["AIGeneration | None"] = relationship("AIGeneration")
    template: Mapped["PostTemplate | None"] = relationship("PostTemplate")
    published_post: Mapped["PublishedPost | None"] = relationship(
        "PublishedPost", back_populates="scheduled_post", uselist=False, cascade="all, delete-orphan"
    )


# ── Published Post ────────────────────────────────────────────────────────────

class PublishedPost(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "published_posts"
    __table_args__ = (UniqueConstraint("scheduled_post_id", name="uq_published_scheduled"),)

    scheduled_post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("scheduled_posts.id", ondelete="CASCADE"), nullable=False
    )
    fb_post_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    channel: Mapped[PublishedChannel] = mapped_column(
        Enum(PublishedChannel, name="published_channel"), nullable=False
    )
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    initial_reach: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    initial_impressions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships
    scheduled_post: Mapped["ScheduledPost"] = relationship("ScheduledPost", back_populates="published_post")
    analytics: Mapped[list["PostAnalytic"]] = relationship(
        "PostAnalytic", back_populates="published_post", cascade="all, delete-orphan"
    )
    review: Mapped["Review | None"] = relationship("Review", back_populates="published_as_post")


# ── Post Analytics ────────────────────────────────────────────────────────────

class PostAnalytic(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "post_analytics"

    published_post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("published_posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    reach: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    impressions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reactions: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    comments_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    shares_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    clicks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships
    published_post: Mapped["PublishedPost"] = relationship("PublishedPost", back_populates="analytics")


# ── Page Insight ──────────────────────────────────────────────────────────────

class PageInsight(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "page_insights"
    __table_args__ = (
        UniqueConstraint("facebook_page_id", "date", name="uq_insight_page_date"),
    )

    facebook_page_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("facebook_pages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[datetime] = mapped_column(Date, nullable=False)
    fans_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    impressions_unique: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    engaged_users: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    new_followers: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reach: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    video_views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # relationships
    facebook_page: Mapped["FacebookPage"] = relationship("FacebookPage", back_populates="page_insights")


# ── AI Generation ─────────────────────────────────────────────────────────────

class AIGeneration(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_generations"

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content_input: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    prompt_used: Mapped[str | None] = mapped_column(Text, nullable=True)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    caption_variants: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    tokens_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cost_usd: Mapped[float | None] = mapped_column(Numeric(10, 6), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="completed")

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="ai_generations")


# ── Review ────────────────────────────────────────────────────────────────────

class Review(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "reviews"

    org_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source: Mapped[ReviewSource] = mapped_column(
        Enum(ReviewSource, name="review_source"), nullable=False
    )
    external_id: Mapped[str | None] = mapped_column(String(200), nullable=True, unique=True)
    reviewer_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    rating: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    review_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    handled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    published_as_post_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("published_posts.id", ondelete="SET NULL"), nullable=True
    )
    response_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    # relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="reviews")
    published_as_post: Mapped["PublishedPost | None"] = relationship(
        "PublishedPost", back_populates="review"
    )


# ── Schedule Log ──────────────────────────────────────────────────────────────

class ScheduleLog(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "schedule_logs"

    schedule_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False, index=True
    )
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[ScheduleLogStatus] = mapped_column(
        Enum(ScheduleLogStatus, name="schedule_log_status"), nullable=False
    )
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_msg: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_post_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("scheduled_posts.id", ondelete="SET NULL"), nullable=True
    )

    # relationships
    schedule: Mapped["Schedule"] = relationship("Schedule", back_populates="logs")


# ── Refresh Token ─────────────────────────────────────────────────────────────

class RefreshToken(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")
