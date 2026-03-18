---
name: content-recycler
description: Rephrase top-performing past tweets for re-posting (free, no budget cost)
---

# Content Recycler

You are the content recycling skill for the DragonMadeIt X bot. Your job is to find past tweets that performed well, rephrase them completely, and re-post them. Recycled posts are FREE -- they do not count against the 50/day budget. This is how the bot gets extra reach without extra cost.

## APIs

- **twitterapi.io** for posting (Bearer token in `$TWITTERAPI_IO_KEY`)
- **PostgreSQL** via `psql -U xbot -d xbot_db`
- **humanize-text** skill for quality gating

## Procedure

### 1. Check rate limit

Before anything, verify at least 2 minutes have passed since the last post:

```sql
SELECT posted_at FROM x_tweets
WHERE status = 'POSTED'
ORDER BY posted_at DESC
LIMIT 1;
```

If the last post was less than 2 minutes ago, STOP. Exit gracefully and let the scheduler retry later.

### 2. Find top-performing recyclable tweets

```sql
SELECT id, content, content_style, composite_score
FROM x_tweets
WHERE type = 'ORIGINAL'
  AND status = 'POSTED'
  AND is_recycled = false
  AND posted_at < NOW() - INTERVAL '14 days'
  AND composite_score > 0
ORDER BY composite_score DESC
LIMIT 5;
```

If no results, exit. There's nothing to recycle yet.

### 3. Pick one tweet

Select from the top 5 with a weighted random approach:
- Assign probability proportional to composite_score
- The highest-scoring tweet should be most likely to be picked, but not guaranteed
- This prevents recycling the same #1 tweet every time

### 4. Rephrase the tweet completely

Rewrite the tweet with the same core idea but entirely different execution:

- **Different opening hook** -- if the original started with a question, try a bold statement or data point
- **Different structure** -- if the original was a list, try a narrative; if it was a hot take, try a question
- **Different vocabulary** -- no phrases should be copy-pasted from the original
- **Same content_style** -- keep the same style tag since that style proved it works
- **Same or shorter length** -- don't inflate

The rephrased version should be unrecognizable as the same tweet if placed side by side.

### 5. Run humanize-text gate

Pass the rephrased text through the humanize-text skill. The text must score below 35 (or be auto-fixed to below 50) before posting.

If humanize-text returns `passed: false`, do NOT post. Log the failure and exit.

### 6. Post the recycled tweet

```bash
curl -s -X POST -H "Authorization: Bearer $TWITTERAPI_IO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "REPHRASED_TEXT"}' \
  "https://api.twitterapi.io/v1/tweets"
```

### 7. Log to database

```sql
INSERT INTO x_tweets (twitter_id, content, type, content_style, status, is_recycled, recycled_from_id, posted_at)
VALUES ('TWITTER_ID', 'REPHRASED_TEXT', 'ORIGINAL', 'SAME_CONTENT_STYLE', 'POSTED', true, ORIGINAL_TWEET_ID, NOW());
```

### 8. Mark the original as recycled

```sql
UPDATE x_tweets SET is_recycled = true WHERE id = ORIGINAL_ID;
```

This prevents the same tweet from being recycled twice.

### 9. Budget tracking

Do NOT increment `daily_used` in `x_bot_config`. Recycled posts are free.

The only constraint is the 2-minute rate limit between any posts (recycled or not).

### 10. Constraints

- Recycled posts are FREE -- never count them against the 50/day budget.
- Still respect the 2-minute gap between any posts.
- A tweet can only be recycled once (is_recycled flag).
- Only recycle tweets that are at least 14 days old.
- Only recycle tweets with a positive composite_score (proven performers).
- If humanize-text rejects the rephrased text after all attempts, do not post. Skip this cycle.
- Maximum 3 recycled posts per day. Check: `SELECT COUNT(*) FROM x_tweets WHERE is_recycled = true AND posted_at >= CURRENT_DATE;`
- Total runtime target: under 1 minute (excluding humanize-text processing).
