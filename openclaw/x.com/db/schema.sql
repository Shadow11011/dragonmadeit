-- OpenClaw X Bot — PostgreSQL Schema
-- Run: psql -U xbot -d xbot_db -f schema.sql

-- Bot configuration (single row)
CREATE TABLE IF NOT EXISTS x_bot_config (
  id            SERIAL PRIMARY KEY,
  daily_budget  INT DEFAULT 50,
  daily_used    INT DEFAULT 0,
  daily_likes   INT DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  is_active     BOOLEAN DEFAULT true
);

-- Our posted tweets
CREATE TABLE IF NOT EXISTS x_tweets (
  id                  SERIAL PRIMARY KEY,
  twitter_id          TEXT UNIQUE,
  type                TEXT NOT NULL CHECK (type IN ('ORIGINAL','REPLY','QUOTE','THREAD')),
  content             TEXT NOT NULL,
  content_style       TEXT,
  posting_window      TEXT,
  reply_tone          TEXT,
  reply_target_type   TEXT,
  engagement_approach TEXT,
  reply_to_tweet_id   TEXT,
  reply_to_username   TEXT,
  status              TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','HUMANIZING','POSTED','HUMANIZER_REJECTED','FAILED')),
  humanizer_score     INT,
  is_recycled         BOOLEAN DEFAULT false,
  -- Metrics (updated by autoresearch)
  impressions         INT DEFAULT 0,
  likes               INT DEFAULT 0,
  replies             INT DEFAULT 0,
  retweets            INT DEFAULT 0,
  composite_score     REAL DEFAULT 0,
  relative_score      REAL,
  metrics_updated_at  TIMESTAMPTZ,
  evaluated           BOOLEAN DEFAULT false,
  posted_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Tracked competitors
CREATE TABLE IF NOT EXISTS x_competitors (
  id              SERIAL PRIMARY KEY,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  follower_count  INT,
  is_active       BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor insights
CREATE TABLE IF NOT EXISTS x_competitor_insights (
  id                SERIAL PRIMARY KEY,
  competitor_id     INT REFERENCES x_competitors(id) ON DELETE CASCADE,
  top_tweet_content TEXT,
  top_tweet_metrics JSONB,
  patterns          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Daily analytics snapshots
CREATE TABLE IF NOT EXISTS x_analytics_snapshots (
  id                SERIAL PRIMARY KEY,
  follower_count    INT DEFAULT 0,
  following_count   INT DEFAULT 0,
  total_impressions INT DEFAULT 0,
  total_likes       INT DEFAULT 0,
  total_replies     INT DEFAULT 0,
  total_retweets    INT DEFAULT 0,
  engagement_rate   REAL DEFAULT 0,
  tweets_posted     INT DEFAULT 0,
  replies_posted    INT DEFAULT 0,
  snapshot_date     DATE UNIQUE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluation run logs
CREATE TABLE IF NOT EXISTS x_evaluations (
  id                  SERIAL PRIMARY KEY,
  eval_type           TEXT CHECK (eval_type IN ('POSTS','REPLIES')),
  items_evaluated     INT DEFAULT 0,
  avg_composite_score REAL DEFAULT 0,
  strategy_changes    JSONB,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tweets_type_status ON x_tweets(type, status);
CREATE INDEX IF NOT EXISTS idx_tweets_posted_at ON x_tweets(posted_at);
CREATE INDEX IF NOT EXISTS idx_tweets_evaluated ON x_tweets(evaluated) WHERE evaluated = false;
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON x_analytics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_insights_competitor ON x_competitor_insights(competitor_id);
