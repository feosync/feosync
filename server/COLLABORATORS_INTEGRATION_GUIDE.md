# Guide d'Intégration - Fonctionnalité Collaborateurs/Invitations

## 📋 Vue d'ensemble

Cette guide couvre l'implémentation complète de la fonctionnalité **Collaborateurs et Invitations** pour FeoSync.

### Fonctionnalités implémentées

✅ **Gestion des collaborateurs** - Ajouter/supprimer des collaborateurs à une organisation  
✅ **Système d'invitations** - Inviter des collaborateurs via email avec tokens sécurisés  
✅ **Expiration automatique** - Les invitations expirent après 10 minutes  
✅ **Rôles et permissions** - Admin, Éditeur, Lecteur (RBAC)  
✅ **Double sécurité** - Validation du token + vérification d'expiration  
✅ **JWT automatique** - Connexion directe après acceptation d'invitation  

---

## 📂 Architecture

### Structure des fichiers

```
server/app/modules/collaborators/
├── __init__.py           # Export du router
├── model.py              # Modèles SQLAlchemy (Collaborator, Invitation)
├── schemas.py            # Schemas Pydantic pour validation/sérialisation
├── repository.py         # Couche d'accès aux données
├── service.py            # Logique métier
└── router.py             # Endpoints FastAPI

server/app/modules/notifications/
└── templates/
    └── invitation.html   # Template email HTML
```

### Modèles de données

#### `Collaborator`
- `id` (UUID) - Clé primaire
- `organisation_id` (UUID FK) - Référence à l'organisation
- `user_id` (UUID FK) - Référence à l'utilisateur
- `role` (Enum) - admin | editor | viewer
- `created_at` (DateTime) - Date de création
- `updated_at` (DateTime) - Date de modification

#### `Invitation`
- `id` (UUID) - Clé primaire
- `organisation_id` (UUID FK) - Organisation cible
- `email` (String) - Email du destinataire
- `token` (String, Unique) - Token d'invitation (64 char hex)
- `role` (Enum) - Rôle proposé
- `status` (Enum) - pending | accepted | expired | used
- `expires_at` (DateTime) - Expiration (10 min)
- `created_at` (DateTime) - Création

---

## 🔌 API Endpoints

### 1. Créer une invitation

**POST** `/api/v1/collaborators/invitations`

```bash
curl -X POST http://localhost:8000/api/v1/collaborators/invitations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "collaborateur@example.com",
    "role": "editor",
    "organisation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Réponse**
```json
{
  "id": "...",
  "email": "collaborateur@example.com",
  "role": "editor",
  "status": "pending",
  "expires_at": "2025-01-23T10:15:00Z",
  "created_at": "2025-01-23T10:05:00Z"
}
```

### 2. Accepter une invitation

**GET** `/api/v1/collaborators/invitations/accept?token=INVITATION_TOKEN&name=John%20Doe`

```bash
curl -X GET "http://localhost:8000/api/v1/collaborators/invitations/accept?token=a1b2c3d4...&name=John%20Doe"
```

**Réponse**
```json
{
  "message": "Invitation acceptée avec succès",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 3. Lister les collaborateurs

**GET** `/api/v1/collaborators/collaborators?skip=0&limit=20`

```bash
curl -X GET http://localhost:8000/api/v1/collaborators/collaborators \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse**
```json
{
  "items": [
    {
      "id": "...",
      "user": {
        "id": "...",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "role": "admin",
      "created_at": "2025-01-20T10:00:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 20
}
```

### 4. Supprimer un collaborateur

**DELETE** `/api/v1/collaborators/collaborators/{collaborator_id}`

```bash
curl -X DELETE http://localhost:8000/api/v1/collaborators/collaborators/uuid-xxx \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 Sécurité

### Validation des tokens
- **Format** : 64 caractères hexadécimaux (generés via `secrets.token_hex(32)`)
- **Vérification** : Token doit exister en base et être `pending`
- **Expiration** : 10 minutes après création
- **Usage** : Peut être utilisé une seule fois (status = `used`)

### Contrôle d'accès
- ✅ Seul admin/owner peut créer des invitations
- ✅ Seul admin/owner peut supprimer des collaborateurs
- ✅ Pas de limite de collaborateurs par défaut (configurable : `COLLABORATORS_QUOTA = 50`)
- ✅ Pas d'invitations dupliquées en attente

### Gestion des erreurs

| Code | Erreur | Cause |
|------|--------|-------|
| 400 | Token invalide | Token n'existe pas ou déjà utilisé |
| 403 | Permission refusée | Utilisateur non admin |
| 404 | Invitation introuvable | Token non trouvé |
| 410 | Invitation expirée | Dépassé les 10 minutes |

---

## 📧 Notifications par email

### Template d'invitation

[voir `invitation.html`]

**Variables Jinja2 incluses**:
- `email` - Email du destinataire
- `invitation_link` - Lien d'acceptation
- `inviter_email` - Email de l'inviteur
- `expiry_minutes` - 10
- `organisation_id` - UUID

### Configuration

Assurez-vous que `fastmail` est configuré dans `app/core/mail.py`:

```python
from fastapi_mail import FastMail, ConnectionConfig

config = ConnectionConfig(
    MAIL_FROM=settings.EMAIL_FROM,
    MAIL_FROM_NAME=settings.EMAIL_FROM_NAME,
    MAIL_PASSWORD=settings.EMAIL_PASSWORD,
    MAIL_PORT=settings.EMAIL_PORT,
    MAIL_SERVER=settings.EMAIL_SERVER,
    MAIL_USERNAME=settings.EMAIL_USERNAME,
    MAIL_TLS=settings.EMAIL_TLS,
    MAIL_SSL=settings.EMAIL_SSL,
)

fastmail = FastMail(config)
```

---

## 🚀 Déploiement

### 1. Appliquer les migrations

```bash
cd /home/nandraina/dream/feosync/server

# Créer les tables
alembic upgrade head

# Vérifier
psql -d feosync -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"
```

### 2. Vérifier les imports

```bash
python3 -c "from app.modules.collaborators.model import Collaborator, Invitation; print('✅ Modèles OK')"
```

### 3. Tester l'API

```bash
# Démarrer le serveur
uvicorn app.main:app --reload

# Vérifier les endpoints
curl http://localhost:8000/docs
```

---

## 📝 Configuration

### Constantes

**`CollaboratorService`** (dans `service.py`)

```python
INVITATION_EXPIRY_MINUTES = 10      # Durée de validité
COLLABORATORS_QUOTA = 50             # Limite par organisation
```

Modifiez ces valeurs selon vos besoins.

---

## 🧪 Test manuel

### Flux complet

1. **Créer une organisation** (déjà existable)
   ```bash
   POST /api/v1/organisations
   ```

2. **Créer un collaborateur** (admin)
   ```bash
   POST /api/v1/collaborators/invitations
   # Email reçu avec lien: /invite?token=XXX
   ```

3. **Accepter l'invitation** (public, pas d'auth requise)
   ```bash
   GET /api/v1/collaborators/invitations/accept?token=XXX
   # JWT obtenu pour connexion directe
   ```

4. **Vérifier** (admin ou collaborateur)
   ```bash
   GET /api/v1/collaborators/collaborators
   ```

---

## 🔧 Dépannage

### "Invitation introuvable"
- Vérifier le token est exactement copié
- Vérifier qu'il n'a pas expiré (10 min)

### "Cette invitation n'est plus valide"
- Invitation déjà acceptée
- Invitation expirée → créez une nouvelle

### "Il y a déjà une invitation en attente"
- Attendez 10 min pour expiration automatique
- Ou l'admin en crée une nouvelle

### Email non reçu
- Vérifier configuration `fastmail` dans `app/core/mail.py`
- Checker les logs : `DEBUG` mode pour plus d'infos
- Vérifier SMTP credentials dans `.env`

---

## 📚 Références

- **SQLAlchemy ORM** : https://docs.sqlalchemy.org/
- **FastAPI** : https://fastapi.tiangolo.com/
- **Pydantic** : https://docs.pydantic.dev/
- **Alembic Migrations** : https://alembic.sqlalchemy.org/

---

## ✅ Checklist de déploiement

- [ ] Migration appliquée (`alembic upgrade head`)
- [ ] Imports vérifiés (pas d'erreur)
- [ ] Configuration email setup
- [ ] API endpoints testées via `/docs`
- [ ] Token expiration fonctionne
- [ ] Email template est envoyé
- [ ] Collaborateurs listés correctement
- [ ] Suppression fonctionne (admin uniquement)

---

**Version** : 1.0.0  
**Date** : 2025-01-23  
**Statut** : 🟢 Prêt pour production
