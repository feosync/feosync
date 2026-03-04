-- =============================================
-- AUTO POST PRO - SCHEMA COMPLET (PostgreSQL 16)
-- Version 1.0 - Conforme CDC + ERD
-- =============================================

-- 1. Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Création des ENUMs (exactement comme indiqué dans le CDC)
CREATE TYPE sector_enum AS ENUM ('restaurant', 'commerce', 'agence_communication', 'service', 'autre');
CREATE TYPE tone_enum AS ENUM ('professionnel', 'amical', 'promotionnel', 'humoristique', 'neutre');
CREATE TYPE post_status_enum AS ENUM ('draft', 'scheduled', 'published', 'failed', 'cancelled');
CREATE TYPE rule_type_enum AS ENUM ('google_sheets', 'reviews', 'sports_api', 'manual', 'api');
CREATE TYPE channel_enum AS ENUM ('facebook', 'whatsapp', 'both');
CREATE TYPE review_source_enum AS ENUM ('facebook', 'google');
CREATE TYPE schedule_status_enum AS ENUM ('success', 'failed', 'running');

-- =============================================
-- 3. TABLES (dans l'ordre des dépendances)
-- =============================================

-- Plans tarifaires
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    price_ariary INTEGER NOT NULL,
    max_pages SMALLINT NOT NULL,
    max_posts_month INTEGER NOT NULL,
    max_ai_gen INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Organisations (1 user = 1 org en V1)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sector sector_enum NOT NULL,
    tone tone_enum NOT NULL,
    logo_url TEXT,
    brand_colors JSONB NOT NULL DEFAULT '{}',
    editorial_profile TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh tokens JWT
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages Facebook connectées
CREATE TABLE facebook_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    fb_page_id VARCHAR(50) UNIQUE NOT NULL,
    page_name VARCHAR(100) NOT NULL,
    access_token_enc TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compte WhatsApp Business (1 par org)
CREATE TABLE whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    waba_id VARCHAR(50),
    access_token_enc TEXT,
    broadcast_lists JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates graphiques
CREATE TABLE post_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sector sector_enum,
    asset_url TEXT NOT NULL,
    zones JSONB NOT NULL DEFAULT '{}',
    is_app_template BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Règles de publication automatique
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    rule_type rule_type_enum NOT NULL,
    cron_expr VARCHAR(50) NOT NULL,
    data_source_config JSONB NOT NULL DEFAULT '{}',
    template_id UUID REFERENCES post_templates(id),
    channels channel_enum[] DEFAULT ARRAY['facebook'],
    page_ids JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts programmés / brouillons
CREATE TABLE scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    caption TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    image_url TEXT,
    publish_at TIMESTAMPTZ NOT NULL,
    status post_status_enum DEFAULT 'scheduled',
    channels channel_enum[] DEFAULT ARRAY['facebook'],
    page_ids JSONB DEFAULT '[]',
    rule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    ai_gen_id UUID REFERENCES ai_generations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts publiés (1:1 avec scheduled_posts)
CREATE TABLE published_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_post_id UUID UNIQUE NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
    fb_post_id VARCHAR(50),
    channel channel_enum NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    initial_reach INTEGER,
    initial_impressions INTEGER
);

-- Analytics par post (mesures dans le temps)
CREATE TABLE post_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    published_post_id UUID NOT NULL REFERENCES published_posts(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL,
    reach INTEGER,
    impressions INTEGER,
    reactions JSONB DEFAULT '{}',
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    UNIQUE (published_post_id, measured_at)
);

-- Insights quotidiens des pages Facebook
CREATE TABLE page_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facebook_page_id UUID NOT NULL REFERENCES facebook_pages(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    fans_total INTEGER,
    impressions_unique INTEGER,
    engaged_users INTEGER,
    new_followers INTEGER,
    UNIQUE (facebook_page_id, date)
);

-- Traces des générations IA Gemini
CREATE TABLE ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    content_input JSONB NOT NULL,
    prompt_used TEXT,
    model VARCHAR(50) DEFAULT 'gemini-2.0-flash',
    caption_variants JSONB,
    image_url TEXT,
    tokens_used INTEGER,
    cost_usd NUMERIC(10,6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avis clients (FB + Google)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source review_source_enum NOT NULL,
    external_id VARCHAR(100) UNIQUE NOT NULL,
    reviewer_name VARCHAR(100),
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    review_date TIMESTAMPTZ,
    handled BOOLEAN DEFAULT false,
    published_as_post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique d’exécution des règles
CREATE TABLE schedules_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ NOT NULL,
    status schedule_status_enum NOT NULL,
    duration_ms INTEGER,
    error_msg TEXT,
    result_post_id UUID REFERENCES scheduled_posts(id) ON DELETE SET NULL
);

-- =============================================
-- 4. INDEXES CRITIQUES (performance + CDC)
-- =============================================

CREATE INDEX idx_scheduled_posts_org_publish_status 
    ON scheduled_posts(org_id, publish_at, status);

CREATE INDEX idx_scheduled_posts_rule_id ON scheduled_posts(rule_id);

CREATE INDEX idx_schedules_org ON schedules(org_id);
CREATE INDEX idx_reviews_org ON reviews(org_id);
CREATE INDEX idx_ai_generations_org ON ai_generations(org_id);

-- GIN sur tous les JSONB importants
CREATE INDEX idx_scheduled_posts_page_ids_gin ON scheduled_posts USING GIN(page_ids);
CREATE INDEX idx_scheduled_posts_channels_gin ON scheduled_posts USING GIN(channels);
CREATE INDEX idx_schedules_page_ids_gin ON schedules USING GIN(page_ids);
CREATE INDEX idx_organizations_brand_colors_gin ON organizations USING GIN(brand_colors);

-- =============================================
-- 5. Commentaires (optionnel mais utile)
-- =============================================

COMMENT ON TABLE scheduled_posts IS 'Posts en attente de publication (manuel ou via règle)';
COMMENT ON TABLE published_posts IS 'Lien 1:1 vers les posts effectivement publiés';
COMMENT ON TABLE ai_generations IS 'Trace complète Gemini (coût, tokens, etc.)';
