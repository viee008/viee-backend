-- ─── VIEE DATABASE SCHEMA ────────────────────────────────────────────────────
-- Paste this entire file into Supabase → SQL Editor → Run

-- ARTICLES
CREATE TABLE IF NOT EXISTS articles (
  id              BIGSERIAL PRIMARY KEY,
  url             TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  summary_fr      TEXT,
  summary_en      TEXT,
  key_points_fr   TEXT[] DEFAULT '{}',
  key_points_en   TEXT[] DEFAULT '{}',
  full_text       TEXT,
  source          TEXT NOT NULL,
  source_domain   TEXT,
  source_url      TEXT,
  category        TEXT NOT NULL,
  country         TEXT NOT NULL DEFAULT 'fr',
  sentiment       TEXT DEFAULT 'neutral',
  accent_color    TEXT DEFAULT '#FF6B00',
  image_url       TEXT,
  pub_date        TIMESTAMPTZ,
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  ai_processed    BOOLEAN DEFAULT FALSE,
  extracted       BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_articles_category    ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_country     ON articles(country);
CREATE INDEX IF NOT EXISTS idx_articles_pub_date    ON articles(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_active   ON articles(is_active);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read articles" ON articles;
CREATE POLICY "Public read articles"
  ON articles FOR SELECT USING (is_active = TRUE);

-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT,
  display_name  TEXT,
  lang_pref     TEXT DEFAULT 'fr',
  topics        TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROGRESS
CREATE TABLE IF NOT EXISTS user_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp              INTEGER DEFAULT 0,
  streak_days     INTEGER DEFAULT 0,
  last_read_date  DATE,
  total_read      INTEGER DEFAULT 0,
  total_saved     INTEGER DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- SAVED ARTICLES
CREATE TABLE IF NOT EXISTS saved_articles (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id  BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- READ HISTORY
CREATE TABLE IF NOT EXISTS read_history (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id  BIGINT REFERENCES articles(id) ON DELETE CASCADE,
  action      TEXT DEFAULT 'read',
  xp_earned   INTEGER DEFAULT 0,
  read_at     TIMESTAMPTZ DEFAULT NOW()
);
