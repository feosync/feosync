# FeoSync – Backend

**Automated social media publishing platform for SMEs** (Facebook, WhatsApp, Instagram)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 + Python 3.11 |
| Database | PostgreSQL 16 + SQLAlchemy 2.0 async |
| Migrations | Alembic |
| Cache / Broker | Redis 7 |
| Workers | Celery 5 + Celery Beat |
| AI | Google Gemini 2.0 Flash |
| Storage | Cloudflare R2 (S3-compatible) |
| Email | Resend |
| Auth | JWT + OAuth 2.0 Meta |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |

---

## Architecture

```
src/app/
├── core/
│   ├── config/        # Pydantic Settings
│   ├── security/      # JWT, Fernet encryption, password hashing
│   └── logging/       # Structlog JSON logging
├── database/
│   ├── base.py        # DeclarativeBase + mixins
│   └── session.py     # Async engine + session factory
├── shared/
│   ├── exceptions/    # HTTP exception hierarchy
│   └── pagination/    # Generic paginated responses
└── modules/
    ├── models.py      # All SQLAlchemy ORM models (single import target for Alembic)
    ├── auth/          # Register · Login · Refresh · Logout · Email verify · Password reset
    ├── users/
    ├── organizations/ # Workspace + branding
    ├── plans/         # Subscription plans + quota enforcement
    ├── facebook_pages/# Meta OAuth · token storage · page management
    ├── whatsapp_accounts/
    ├── templates/     # Post templates (visual zones)
    ├── posts/         # ScheduledPost CRUD
    ├── scheduler/     # Cron rules
    ├── analytics/     # Post analytics + page insights
    ├── ai_generation/ # Gemini captions
    ├── reviews/       # Review import + publish as post
    ├── notifications/ # Resend email
    └── integrations/
        └── meta/      # Meta Graph API client (with retry)

workers/
├── celery_app.py      # Celery factory + Beat schedule
├── scheduler_worker   # Dispatches due posts every 2 min
├── publish_worker     # Publishes to Facebook (with retry)
├── analytics_worker   # Syncs post metrics every 6h
└── sync_worker        # Syncs page insights daily
```

---

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your Meta App credentials, Gemini API key, etc.

# 2. Start all services
docker compose up -d

# 3. Run migrations
docker compose exec api alembic upgrade head

# 4. Visit API docs
open http://localhost:8000/api/docs
```

---

## API Endpoints (v1)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/password-reset/request
POST   /api/v1/auth/password-reset/confirm

GET    /api/v1/organizations/me
PATCH  /api/v1/organizations/me

GET    /api/v1/plans
GET    /api/v1/plans/current

GET    /api/v1/facebook-pages/oauth-url
GET    /api/v1/facebook-pages/callback
GET    /api/v1/facebook-pages
DELETE /api/v1/facebook-pages/{id}

POST   /api/v1/posts
GET    /api/v1/posts
GET    /api/v1/posts/{id}
PATCH  /api/v1/posts/{id}
DELETE /api/v1/posts/{id}

POST   /api/v1/scheduler
GET    /api/v1/scheduler
PATCH  /api/v1/scheduler/{id}
DELETE /api/v1/scheduler/{id}

POST   /api/v1/ai/captions

GET    /api/v1/analytics/dashboard
GET    /api/v1/analytics/posts/{published_post_id}
GET    /api/v1/analytics/pages/{page_id}/insights

POST   /api/v1/reviews
GET    /api/v1/reviews
POST   /api/v1/reviews/{id}/respond
POST   /api/v1/reviews/{id}/publish-as-post
```

---

## Running Tests

```bash
pytest tests/ -v --cov=src
```

---

## Celery Workers

```bash
# Start worker (all queues)
celery -A src.app.workers.celery_app.celery_app worker --loglevel=info

# Start Beat scheduler
celery -A src.app.workers.celery_app.celery_app beat --loglevel=info

# Monitor with Flower
docker compose --profile monitoring up flower
```

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing key (min 32 chars) |
| `ENCRYPTION_KEY` | Fernet key for Meta token encryption |
| `DATABASE_URL` | PostgreSQL async URL |
| `META_APP_ID` / `META_APP_SECRET` | Meta developer app credentials |
| `GEMINI_API_KEY` | Google AI API key |
| `RESEND_API_KEY` | Transactional email |
| `R2_*` | Cloudflare R2 storage |

---

## Production Checklist

- [ ] Set strong `SECRET_KEY` and `ENCRYPTION_KEY`
- [ ] Enable HTTPS via Nginx + Let's Encrypt
- [ ] Set `APP_ENV=production` (disables API docs)
- [ ] Configure `SENTRY_DSN` for error tracking
- [ ] Set `ALLOWED_ORIGINS` to your frontend domain only
- [ ] Configure PostgreSQL connection pooling (PgBouncer recommended)
- [ ] Set up database backups
- [ ] Monitor Celery queues with Flower or Grafana
