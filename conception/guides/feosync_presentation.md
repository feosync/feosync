# FeoSync — Présentation technique
### Entretien Bay Consulting · Poste Développeur Fullstack

---

## 1. Contexte métier

### Origine du projet

Les PME et entrepreneurs malgaches gèrent leurs pages Facebook **manuellement** :
- Publication irrégulière → perte d'engagement
- Pas de planification → dépendance à la disponibilité humaine
- Aucun outil adapté au marché local (prix, langue, contexte)

### Solution

**FeoSync** est une plateforme SaaS de gestion des réseaux sociaux qui permet de :
- **Planifier** des publications Facebook à l'avance
- **Générer** du contenu (texte + image) via l'IA (Google Gemini)
- **Publier automatiquement** via Meta Graph API
- **Analyser** les performances (reach, impressions, engagement)

### Cible
PME, agences marketing, entrepreneurs — Madagascar et océan Indien.

---

## 2. Conception de la solution

### Architecture globale

```
┌────────────────────────────────────────────────────────────┐
│                      UTILISATEUR                            │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼─────────────────────────────────┐
│            FRONTEND — Next.js 14 (Vercel)                   │
│   Auth Google │ Dashboard │ Wizard post │ Analytics         │
└──────────────────────────┬─────────────────────────────────┘
                           │ REST API + JWT Bearer
┌──────────────────────────▼─────────────────────────────────┐
│               BACKEND — FastAPI (Python)                     │
│                                                              │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────────┐    │
│  │   Auth   │  │   Posts    │  │   AI Generation     │    │
│  │  Google  │  │   CRUD     │  │   Google Gemini     │    │
│  │  OAuth   │  │   Celery   │  │   caption + image   │    │
│  └──────────┘  └────────────┘  └─────────────────────┘    │
│                                                              │
│  ┌──────────┐  ┌────────────┐  ┌─────────────────────┐    │
│  │ Facebook │  │ Analytics  │  │   Notifications     │    │
│  │ Graph API│  │ Insights   │  │   Email + in-app    │    │
│  └──────────┘  └────────────┘  └─────────────────────┘    │
└──────────────┬───────────────────────────┬─────────────────┘
               │                           │
┌──────────────▼──────────┐   ┌────────────▼──────────────┐
│  PostgreSQL              │   │  Redis + Celery            │
│  SQLAlchemy ORM (sync)   │   │  Tasks planifiées (eta)    │
└──────────────────────────┘   └───────────────────────────┘
```

### Flux principal — cycle de vie d'un post

```
1. User crée un post (DRAFT)
      ↓
2. Génère caption via Gemini API
      ↓
3. Upload image → URL publique (static/uploads/)
      ↓
4. Confirme → SCHEDULED
      ↓ (SQLAlchemy after_update event)
5. Celery planifie la task avec eta=publish_at
      ↓ (à l'heure prévue)
6. Celery exécute → Meta Graph API POST /photos
      ↓
7. Post → PUBLISHED + notification email + in-app
```

---

## 3. Organisation du code

### Structure — Architecture modulaire par domaine

```
server/app/
├── core/
│   ├── config.py          ← Settings (Pydantic BaseSettings)
│   ├── database.py        ← SessionLocal, engine
│   └── base.py            ← Base SQLAlchemy
│
├── modules/               ← Un dossier par domaine métier
│   ├── auth/
│   ├── organisations/
│   ├── fb_page/
│   ├── scheduled_post/    ← Domaine présenté ici
│   │   ├── models/
│   │   │   └── scheduled_post_model.py
│   │   ├── schemas.py     ← Pydantic (validation I/O)
│   │   ├── repository.py  ← Accès DB (CRUD pur, sans logique)
│   │   ├── service.py     ← Logique métier
│   │   └── router.py      ← Endpoints FastAPI
│   ├── published_post/
│   ├── ai_generation/
│   └── notifications/
│
└── celery/
    ├── celery_app.py
    └── task/
        ├── published_post.py        ← Task de publication
        └── scheduled_post_events.py ← Event listener SQLAlchemy
```

### Principe de séparation des responsabilités

| Couche | Rôle | Exemple |
|--------|------|---------|
| `router.py` | HTTP, auth, injection de dépendances | `@router.patch("/{post_id}/confirm")` |
| `service.py` | Logique métier, orchestration | Valide, met à jour le statut, déclenche Celery |
| `repository.py` | CRUD pur, sans logique | `get_by_id`, `create`, `update`, `delete` |
| `schemas.py` | Validation I/O (Pydantic) | `ConfirmRequest`, `ScheduledPostResponse` |
| `model.py` | Définition table SQL (SQLAlchemy) | `ScheduledPost`, `PostStatus` |

---

## 4. Exemple de classe — `ScheduledPostService`

### Pourquoi cette classe ?

`ScheduledPostService` orchestre le flux le plus complexe de l'application :
le cycle de vie d'un post de `DRAFT` jusqu'à `PUBLISHED`.

Elle illustre plusieurs bonnes pratiques :
- **Ownership check** centralisé (`_get_post_owned`)
- **Async/sync** mixte (génération IA async, DB sync)
- **Résilience** (Celery down ne plante pas l'API)
- **Séparation** service / repository / event

---

### Méthode clé — `confirm()` (DRAFT → SCHEDULED)

```python
@staticmethod
def confirm(
    db: Session,
    post_id: UUID,
    payload: ConfirmRequest,
    current_user: User,
) -> ScheduledPost:
    """
    DRAFT → SCHEDULED  (première planification)
    SCHEDULED          → mise à jour de la date (replanification)
    """
    # ── 1. Vérification ownership ──────────────────────────────────────────
    post = ScheduledPostService._get_post_owned(db, post_id, current_user)

    # ── 2. Garde-fous métier ───────────────────────────────────────────────
    if post.status in (PostStatus.PUBLISHED, PostStatus.FAILED):
        raise HTTPException(400, f"Post déjà {post.status}")

    if not post.caption:
        raise HTTPException(400, "Caption manquant")

    if not (payload.publish_at or post.publish_at):
        raise HTTPException(400, "publish_at manquant")

    # ── 3. Mise à jour DB ──────────────────────────────────────────────────
    update_data = {"status": PostStatus.SCHEDULED}
    if payload.publish_at:
        update_data["publish_at"] = payload.publish_at

    post = ScheduledPostRepository.update(db, post, update_data)

    # ── 4. Celery planifié via SQLAlchemy after_update event ───────────────
    # L'event listener détecte le changement de statut → SCHEDULED
    # et déclenche automatiquement la task avec eta=publish_at
    # → voir scheduled_post_events.py

    return post
```

---

### Event listener — déclenchement automatique de Celery


## 5. Tests

### Stratégie

```
Unit tests    
Integration    

```


## 6. Infrastructure & Déploiement

### Environnements

```
Dev   → localhost (FastAPI + Next.js + PostgreSQL local + Redis local)
Prod  → Render + Vercel (frontend)
```

### Stack infra

```
Frontend  → Vercel (Next.js)      → CD auto sur push main
Backend   → Render /         → Docker + Uvicorn workers
DB        → PostgreSQL managé     → Neon / Supabase
Cache     → Redis                 → Upstash (serverless)
Workers   → Celery                → même VPS que backend
Media     → static/uploads/       → à migrer vers Cloudinary (TODO)
Emails    → FastMail + SMTP       → Resend en prod
```

### Variables d'environnement critiques

```bash
DATABASE_URL=postgresql+psycopg2://...
SECRET_KEY=...
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
META_APP_ID / META_APP_SECRET
GEMINI_API_KEY
FRONTEND_URL=https://feosync.vercel.app
SERVER_URL=https://api.feosync.com
REDIS_URL=redis://...
```

### CI/CD (pipeline type)
{todo}

### Dockerfile
{todo}

## Ce que je ferais différemment

1. **Tests dès le début** — TDD sur le service layer avant d'implémenter
2. **URL image dès le départ** — évite le problème URL localhost avec Meta

