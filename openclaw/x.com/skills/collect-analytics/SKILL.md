---
name: collect-analytics
description: Capture daily analytics snapshot and reset daily budget
---

# Collect Analytics

You are the analytics collection skill for the DragonMadeIt X bot. Your job is to capture a daily snapshot of account performance metrics and reset the daily posting budget. This runs once per day, ideally at midnight or early morning.

## APIs

- **postforme.dev** for account analytics (Bearer token in `$POSTFORME_API_KEY`)
- **PostgreSQL** via `psql -U xbot -d xbot_db`
- **MEMORY.md** at `openclaw/x.com/MEMORY.md` for strategy state

## Procedure

### 1. Fetch account-level analytics

```bash
curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
  "https://api.postforme.dev/v1/accounts/{account_id}/analytics"
```

Extract: follower_count, following_count, total_impressions, total_likes, total_replies, total_retweets, engagement_rate.

### 2. Count today's posting activity

```bash
psql -U xbot -d xbot_db -tc "SELECT COUNT(*) FROM x_tweets WHERE type='ORIGINAL' AND posted_at >= CURRENT_DATE;"
```

```bash
psql -U xbot -d xbot_db -tc "SELECT COUNT(*) FROM x_tweets WHERE type='REPLY' AND posted_at >= CURRENT_DATE;"
```

### 3. Store the daily snapshot

```sql
INSERT INTO x_analytics_snapshots (
  follower_count, following_count, total_impressions, total_likes,
  total_replies, total_retweets, engagement_rate, tweets_posted,
  replies_posted, snapshot_date
) VALUES (
  FOLLOWERS, FOLLOWING, IMPRESSIONS, LIKES,
  REPLIES, RETWEETS, ENGAGEMENT_RATE, TWEETS_COUNT,
  REPLIES_COUNT, CURRENT_DATE
) ON CONFLICT (snapshot_date) DO UPDATE SET
  follower_count = EXCLUDED.follower_count,
  following_count = EXCLUDED.following_count,
  total_impressions = EXCLUDED.total_impressions,
  total_likes = EXCLUDED.total_likes,
  total_replies = EXCLUDED.total_replies,
  total_retweets = EXCLUDED.total_retweets,
  engagement_rate = EXCLUDED.engagement_rate,
  tweets_posted = EXCLUDED.tweets_posted,
  replies_posted = EXCLUDED.replies_posted;
```

### 4. Reset the daily budget

```sql
UPDATE x_bot_config SET daily_used = 0, daily_likes = 0, last_reset_at = NOW() WHERE id = 1;
```

This resets the 50 posts+replies/day counter. Likes are unlimited but tracked for visibility.

### 5. Compare with yesterday

Fetch yesterday's snapshot:

```sql
SELECT follower_count, total_impressions, engagement_rate, tweets_posted, replies_posted
FROM x_analytics_snapshots
WHERE snapshot_date = CURRENT_DATE - INTERVAL '1 day';
```

Calculate deltas:
- Follower change (absolute and percentage)
- Impressions change
- Engagement rate change
- Posts made vs budget capacity (were we posting enough?)

### 6. Update MEMORY.md

Add a daily summary to MEMORY.md under `daily_performance`:

```yaml
daily_performance:
  date: "ISO_DATE"
  followers: N
  follower_delta: +/-N
  impressions: N
  engagement_rate: "X.XX%"
  posts_made: N
  replies_made: N
  budget_utilization: "N/50"
  notable: "Any significant change worth noting, or empty string"
```

If there's a significant change (follower spike/drop > 5%, engagement rate change > 20%), add a note to the `learnings` array explaining what might have caused it -- look at what was posted that day.

### 7. Constraints

- Do NOT post anything. This skill only reads APIs and writes to the database and MEMORY.md.
- If the postforme.dev API is down, still count DB activity and reset the budget. Log the API failure.
- The `ON CONFLICT` clause ensures re-running this skill on the same day is safe (idempotent).
- Keep only the most recent `daily_performance` entry in MEMORY.md (overwrite, don't append). Historical data lives in the database.
- Total runtime target: under 1 minute.
