"""
Seed script — insère des données de test pour la pagination.
Usage:
    python seed.py insert
    python seed.py delete
"""
import sys
import uuid
import json
from datetime import datetime, timezone
from sqlalchemy import create_engine, text



# === AJOUT POUR JSONB ===
from psycopg2.extras import Json
from psycopg2.extensions import register_adapter

register_adapter(dict, Json)
# ========================

# ── Config ────────────────────────────────────────────────────────────────────

DATABASE_URL = "postgresql://feosync:feosync_pass@localhost:5432/feosync_db"  # ← adapte

# ── IDs de référence ──────────────────────────────────────────────────────────

USER_ID         = "d93d4014-3b9e-4c77-a3f2-ad193a05c7a5"
ORG_ID          = "4bbdc31f-3dcb-48f4-b219-0d60fb27af16"
FB_PAGE_ID_UUID = "ce8e41c3-e9a3-43bc-ada6-81325113041e"
SEED_TAG        = "__seed__"   # marqueur dans le nom pour retrouver les mocks

NOW = datetime.now(timezone.utc)

# ── Helpers ───────────────────────────────────────────────────────────────────

def uid() -> str:
    return str(uuid.uuid4())

def ts(offset_days: int = 0) -> datetime:
    from datetime import timedelta
    return NOW + timedelta(days=offset_days)

# ── Seed data ─────────────────────────────────────────────────────────────────

TONES    = ["formal", "informal", "friendly", "professional", "casual"]
SECTORS  = ["technology", "finance", "healthcare", "education", "retail", "manufacturing"]
COLORS   = ["#e11d48", "#7c3aed", "#0891b2", "#16a34a", "#ea580c", "#0284c7"]

CAPTIONS = [
    "Découvrez notre nouvelle offre 🚀",
    "Rejoignez notre communauté aujourd'hui",
    "L'innovation au service de votre business",
    "Des solutions adaptées à vos besoins",
    "Transformez votre présence en ligne",
    "Votre succès est notre priorité",
    "Engagez votre audience comme jamais",
    "Plus de visibilité, plus de résultats",
    "La technologie au bout des doigts",
    "Créez du contenu qui convertit",
    "Automatisez votre social media",
    "FeoSync — publiez malin",
]

IMAGES = [
    "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400",
    "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400",
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
    "https://images.unsplash.com/photo-1557838923-2985c318be48?w=400",
]

# ── Tâche 1 : 12 organisations ────────────────────────────────────────────────

def make_organisations() -> list[dict]:
    names = [
        "Agence Digitale Pro", "StartUp Madagascar", "TechHub Antananarivo",
        "Media & Co", "Pixel Studio", "Brand Factory",
        "Content Lab", "Social Boost", "Growth Agency",
        "Creative Hub", "Digital Wave", "Insight Media",
    ]
    rows = []
    for i, name in enumerate(names):
        rows.append({
            "id":          uid(),
            "name":        f"{SEED_TAG} {name}",
            "description": f"Organisation de test #{i+1} — seed data",
            "logo_url":    None,
            "tone":        TONES[i % len(TONES)],
            "sector":      SECTORS[i % len(SECTORS)],
            "brand_color": COLORS[i % len(COLORS)],
            "user_id":     USER_ID,
            "created_at":  ts(-i),
            "updated_at":  ts(-i),
        })
    return rows

# ── Tâche 2 : 12 facebook_pages ───────────────────────────────────────────────

def make_facebook_pages() -> list[dict]:
    rows = []
    for i in range(12):
        rows.append({
            "id":              uid(),
            "fb_page_id":      f"10301718{i:08d}",
            "page_name":       f"{SEED_TAG} Page #{i+1}",
            "access_token":    f"EAAWxMg2_SEED_TOKEN_{i:04d}_{'x'*40}",
            "token_expires_at": None,
            "is_active":       i % 3 != 0,
            "last_sync_at":    ts(-i) if i % 2 == 0 else None,
            "organisation_id": ORG_ID,
            "created_at":      ts(-i),
            "updated_at":      ts(-i),
        })
    return rows

# ── Tâche 3 : 48 scheduled_posts ─────────────────────────────────────────────

def make_scheduled_posts() -> list[dict]:
    statuses = ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"]
    # page_ids est un dict → sera converti automatiquement en jsonb
    page_ids = {"facebook": FB_PAGE_ID_UUID}
    rows = []
    for status in statuses:
        for i in range(12):
            idx = statuses.index(status) * 12 + i
            publish_at = ts(i + 1) if status in ("SCHEDULED", "PUBLISHED") else None
            rows.append({
                "id":              uid(),
                "caption":         f"{SEED_TAG} {CAPTIONS[i]} [{status}]",
                "image_url":       IMAGES[i],
                "image_source":    "URL",
                "publish_at":      publish_at,
                "status":          status,
                "page_ids":        page_ids,          # ← dict Python (plus de str())
                "organisation_id": ORG_ID,
                "post_template_id": None,
                "created_at":      ts(-idx),
                "updated_at":      ts(-idx),
            })
    return rows

# ── Tâche 4 : 12 published_posts ─────────────────────────────────────────────

def make_published_posts(scheduled_post_ids: list[str]) -> list[dict]:
    rows = []
    for i, sp_id in enumerate(scheduled_post_ids[:12]):
        rows.append({
            "id":                  uid(),
            "scheduled_post_id":   sp_id,
            "facebook_page_id":    FB_PAGE_ID_UUID,
            "post_id":             f"seed_fb_post_{i+1:04d}",
            "channel":             "facebook",
            "published_at":        ts(-i),
            "initial_reach":       (i + 1) * 150,
            "initial_impressions": (i + 1) * 320,
            "created_at":          ts(-i),
            "updated_at":          ts(-i),
        })
    return rows

# ── Insert ────────────────────────────────────────────────────────────────────

def insert(engine):
    orgs      = make_organisations()
    fb_pages  = make_facebook_pages()
    s_posts   = make_scheduled_posts()

    published_posts_source = [p for p in s_posts if p["status"] == "PUBLISHED"]
    pub_posts = make_published_posts([p["id"] for p in published_posts_source])

    with engine.begin() as conn:
        # Organisations
        conn.execute(text("""
            INSERT INTO organisations 
            (id, name, description, logo_url, tone, sector, brand_color, user_id, created_at, updated_at)
            VALUES (:id, :name, :description, :logo_url, :tone, :sector, :brand_color, :user_id, :created_at, :updated_at)
        """), orgs)
        print(f"✅  {len(orgs)} organisations insérées")

        # Facebook pages
        conn.execute(text("""
            INSERT INTO facebook_pages 
            (id, fb_page_id, page_name, access_token, token_expires_at, is_active, last_sync_at, organisation_id, created_at, updated_at)
            VALUES (:id, :fb_page_id, :page_name, :access_token, :token_expires_at, :is_active, :last_sync_at, :organisation_id, :created_at, :updated_at)
        """), fb_pages)
        print(f"✅  {len(fb_pages)} facebook_pages insérées")

        # Scheduled posts ← CORRECTION ICI
        conn.execute(text("""
            INSERT INTO scheduled_post 
            (id, caption, image_url, image_source, publish_at, status, page_ids, organisation_id, post_template_id, created_at, updated_at)
            VALUES (:id, :caption, :image_url, :image_source, :publish_at, :status, :page_ids, :organisation_id, :post_template_id, :created_at, :updated_at)
        """), s_posts)   # ← on passe directement la liste de dicts (page_ids reste un dict)
        print(f"✅  {len(s_posts)} scheduled_post insérés (12 × 4 statuts)")

        # Published posts
        conn.execute(text("""
            INSERT INTO published_posts 
            (id, scheduled_post_id, facebook_page_id, post_id, channel, published_at, initial_reach, initial_impressions, created_at, updated_at)
            VALUES (:id, :scheduled_post_id, :facebook_page_id, :post_id, :channel, :published_at, :initial_reach, :initial_impressions, :created_at, :updated_at)
        """), pub_posts)
        print(f"✅  {len(pub_posts)} published_posts insérés")

    print("\n🎉  Seed terminé avec succès !")

# ── Delete (inchangé) ─────────────────────────────────────────────────────────

def delete(engine):
    with engine.begin() as conn:
        r1 = conn.execute(text("""
            DELETE FROM published_posts
            WHERE scheduled_post_id IN (
                SELECT id FROM scheduled_post WHERE caption LIKE :tag
            )
        """), {"tag": f"%{SEED_TAG}%"})
        print(f"🗑️   {r1.rowcount} published_posts supprimés")

        r2 = conn.execute(text(
            "DELETE FROM scheduled_post WHERE caption LIKE :tag"
        ), {"tag": f"%{SEED_TAG}%"})
        print(f"🗑️   {r2.rowcount} scheduled_post supprimés")

        r3 = conn.execute(text(
            "DELETE FROM facebook_pages WHERE page_name LIKE :tag"
        ), {"tag": f"%{SEED_TAG}%"})
        print(f"🗑️   {r3.rowcount} facebook_pages supprimées")

        r4 = conn.execute(text(
            "DELETE FROM organisations WHERE name LIKE :tag"
        ), {"tag": f"%{SEED_TAG}%"})
        print(f"🗑️   {r4.rowcount} organisations supprimées")

    print("\n✅  Nettoyage terminé !")

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ("insert", "delete"):
        print("Usage: python seed.py [insert|delete]")
        sys.exit(1)

    engine = create_engine(DATABASE_URL, echo=False)   # echo=True si tu veux voir les SQL

    if sys.argv[1] == "insert":
        insert(engine)
    else:
        delete(engine)