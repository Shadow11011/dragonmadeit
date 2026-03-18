# TOOLS.md — API and Tool Configuration

## postforme.dev API (Read / Analytics)

Used for reading tweets, fetching analytics, and monitoring accounts. This is the **read-only** API.

- **Base URL:** `https://api.postforme.dev/v1`
- **Auth:** Bearer token via `POSTFORME_API_KEY` environment variable
- **Headers:**
  ```
  Authorization: Bearer ${POSTFORME_API_KEY}
  Content-Type: application/json
  ```

### Endpoints

> Note: These endpoints are stubbed based on expected API shape. Confirm exact paths and parameters after signup.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/accounts/{id}/analytics` | Account-level metrics (followers, impressions, engagement rate) |
| `GET` | `/accounts/{id}/analytics?period=7d` | Analytics for a specific time period |
| `GET` | `/posts/{id}/analytics` | Per-tweet metrics (likes, replies, retweets, impressions, engagement) |
| `GET` | `/accounts/{id}/feed` | Recent tweets from an account |
| `GET` | `/accounts/{id}/feed?limit=50` | Paginated feed |
| `GET` | `/search?q={query}` | Search tweets by keyword |
| `GET` | `/search?q={query}&sort=engagement` | Search sorted by engagement |
| `GET` | `/trending` | Currently trending topics |

### Usage

- Fetching our own account analytics for the evaluate-posts and evaluate-replies skills
- Reading competitor feeds via the monitor-competitors skill
- Searching for relevant tweets to reply to
- Pulling trending topics for content ideas

---

## twitterapi.io API (Write / Actions)

Used for all write actions on X. This is the **write** API.

- **Base URL:** `https://api.twitterapi.io/v1`
- **Auth:** Bearer token via `TWITTERAPI_IO_KEY` environment variable
- **Headers:**
  ```
  Authorization: Bearer ${TWITTERAPI_IO_KEY}
  Content-Type: application/json
  ```

### Endpoints

> Note: These endpoints are stubbed based on expected API shape. Confirm exact paths and parameters after signup.

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/tweets` | Post a new tweet | `{ "text": "..." }` |
| `POST` | `/tweets/{id}/reply` | Reply to a tweet | `{ "text": "..." }` |
| `POST` | `/tweets/{id}/like` | Like a tweet | — |
| `POST` | `/tweets/{id}/retweet` | Retweet | — |
| `POST` | `/tweets/{id}/quote` | Quote tweet | `{ "text": "..." }` |
| `DELETE` | `/tweets/{id}` | Delete a tweet | — |
| `GET` | `/users/{username}/timeline` | Get a user's timeline | — |
| `GET` | `/search?q={query}` | Search tweets | — |
| `GET` | `/users/{username}` | Get user profile info | — |

### Usage

- Posting original tweets
- Replying to tweets from targets and trending topics
- Liking relevant tweets (unlimited, no budget cost)
- Quote tweeting with commentary
- Fetching timelines when postforme.dev is unavailable

### Rate Limit Handling

If twitterapi.io returns:
- **429 (Rate Limited):** Back off 15 minutes. Log the error.
- **5xx (Server Error):** Back off 15 minutes. Log the error.
- **401 (Unauthorized):** Stop all actions. API key may be invalid. Log critical error.
- **403 (Forbidden):** Stop the specific action. May be a permissions issue. Log and continue with other actions.

---

## ai-humanizer (Text Gate)

All generated text must pass through the humanizer before posting. Located in the vendor directory.

- **Location:** `vendor/ai-humanizer/`

### Commands

**Score a piece of text** (check if it reads as AI-generated):
```bash
echo "TEXT_HERE" | node vendor/ai-humanizer/src/cli.js score
```

**Analyze text in detail** (get breakdown of AI markers):
```bash
echo "TEXT_HERE" | node vendor/ai-humanizer/src/cli.js analyze --json
```

**Humanize text** (rewrite to pass detection):
```bash
echo "TEXT_HERE" | node vendor/ai-humanizer/src/cli.js humanize --autofix
```

### Flow

1. Draft text
2. Run `score` — if it passes, post it
3. If it fails, run `humanize --autofix`
4. Re-run `score` on the output
5. If it passes, post the humanized version
6. If it still fails after 3 attempts, discard and redraft from scratch

---

## Database (PostgreSQL)

All bot state, tweet history, analytics, and configuration live in PostgreSQL.

- **Connection:** `psql -U xbot -d xbot_db`
- **Env var:** `XBOT_DB_URL` (for programmatic access)
- **Schema file:** `db/schema.sql`
- **Seed file:** `db/seed.sql`

### Key Tables

| Table | Purpose |
|-------|---------|
| `x_bot_config` | Budget tracking, active status, reset timestamps |
| `x_tweets` | All posted tweets — text, type, tone, posted_at, metrics |
| `x_replies` | All posted replies — text, tone, target account, target tweet, metrics |
| `x_competitors` | Tracked competitor accounts with usernames and notes |
| `x_analytics` | Daily snapshots of account metrics |
| `x_errors` | Error log for debugging and monitoring |

### Common Queries

Check daily budget:
```bash
psql -U xbot -d xbot_db -tc "SELECT daily_used FROM x_bot_config WHERE id=1;"
```

Increment budget after posting:
```bash
psql -U xbot -d xbot_db -c "UPDATE x_bot_config SET daily_used = daily_used + 1 WHERE id=1;"
```

Check last post time (rate limit):
```bash
psql -U xbot -d xbot_db -tc "SELECT MAX(posted_at) FROM x_tweets;"
```

Check promotional ratio:
```bash
psql -U xbot -d xbot_db -tc "SELECT COUNT(*) FILTER (WHERE is_promotional) AS promo, COUNT(*) AS total FROM x_tweets WHERE posted_at > NOW() - INTERVAL '24 hours';"
```

---

## OpenRouter (AI Brain)

OpenClaw uses OpenRouter for LLM calls automatically. No direct API calls needed.

- **Config:** Model set via `OPENCLAW_MODEL` env var
- **Usage:** All content generation, decision making, and analysis is handled through the OpenClaw agent framework

---

## Environment Variables Summary

| Variable | Service | Required |
|----------|---------|----------|
| `POSTFORME_API_KEY` | postforme.dev (read API) | Yes |
| `TWITTERAPI_IO_KEY` | twitterapi.io (write API) | Yes |
| `OPENROUTER_API_KEY` | OpenRouter (LLM) | Yes |
| `OPENCLAW_MODEL` | OpenRouter model selection | Yes |
| `XBOT_DB_URL` | PostgreSQL connection string | Optional (fallback to psql defaults) |
