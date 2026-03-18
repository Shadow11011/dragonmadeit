-- OpenClaw X Bot — Seed Data
-- Run after schema.sql: psql -U xbot -d xbot_db -f seed.sql

-- Default bot config (50 actions/day budget)
INSERT INTO x_bot_config (daily_budget, daily_used, daily_likes, is_active)
VALUES (50, 0, 0, true)
ON CONFLICT DO NOTHING;
