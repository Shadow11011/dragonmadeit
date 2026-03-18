---
name: post-original
description: Craft and post original tweets for the DragonMadeIt X account
---

# post-original

Craft and publish an original tweet for the DragonMadeIt X account.

## Pre-flight Checks

1. **Budget gate** — Query the daily usage counter:
   ```
   psql -U xbot -d xbot_db -tc "SELECT daily_used FROM x_bot_config WHERE id=1;"
   ```
   If the result is **>= 50**, abort immediately. Log nothing. Reply: *"Daily budget exhausted (50/50). Skipping."*

2. **Rate-limit gate** — Ensure at least 2 minutes have passed since the last post or reply:
   ```
   psql -U xbot -d xbot_db -tc "SELECT COUNT(*) FROM x_tweets WHERE posted_at > NOW() - INTERVAL '2 minutes';"
   ```
   If the result is **> 0**, abort. Reply: *"Rate limit: last tweet was < 2 min ago. Skipping."*

## Procedure

### Step 1 — Load Strategy State

Read `MEMORY.md` in its entirety. Extract:
- `content_styles` with their weights
- `content_pillars` (topic list)
- `posting_windows` with their hour ranges and weights

### Step 2 — Select Parameters

- **content_style**: Pick one using weighted random selection from `content_styles`. Higher weight = higher probability of being chosen.
- **posting_window**: Determine which window the current hour falls into (e.g., morning, afternoon, evening, night). Use the current system time.
- **topic**: Pick one from `content_pillars` in MEMORY.md. Vary from recent posts — check the last 5 entries in `x_tweets` and avoid repeating the same topic back-to-back.

### Step 3 — Draft the Tweet

Generate a tweet that:
- Matches the selected `content_style` exactly (e.g., hot-take, educational, storytelling, promotional)
- Relates to the selected topic
- Is **max 280 characters**
- Sounds like a real human typed it — no hashtags unless the style calls for it, no emoji spam, no corporate tone
- Fits the DragonMadeIt brand voice: confident, slightly edgy, knowledgeable about TikTok automation and faceless content

### Step 4 — Humanizer Gate

Run the `humanize-text` skill on the draft. Evaluate the returned score:

| Score Range | Action |
|-------------|--------|
| **< 35** | Pass. Proceed to posting. |
| **35–50** | Auto-fix: run `humanize-text` with the `fix` flag. Re-score the result. If still > 50, regenerate. |
| **> 50** | Regenerate the tweet from scratch with explicit guidance to sound more natural. Retry up to **3 times**. If the score is still > 50 after 3 attempts, **abort entirely**. Log nothing. Reply: *"Failed humanizer gate after 3 attempts. Aborting."* |

Record the final `humanizer_score` for logging.

### Step 5 — Post the Tweet

```bash
curl -s -X POST "https://api.twitterapi.io/v1/tweets" \
  -H "Authorization: Bearer $TWITTERAPI_IO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "TWEET_TEXT"}'
```

- Parse the JSON response.
- Extract the `twitter_id` (the tweet's unique ID).
- If the API returns an error, go to the Error Handling section.

### Step 6 — Log to Database

```sql
INSERT INTO x_tweets (twitter_id, type, content, content_style, posting_window, status, humanizer_score, posted_at)
VALUES ('TWITTER_ID', 'ORIGINAL', 'CONTENT', 'STYLE', 'WINDOW', 'POSTED', SCORE, NOW());
```

### Step 7 — Increment Budget

```sql
UPDATE x_bot_config SET daily_used = daily_used + 1 WHERE id=1;
```

### Step 8 — Report

Reply with a summary:
- Tweet content
- Content style used
- Humanizer score
- Twitter ID
- Current budget usage (X/50)

## Error Handling

If any step after the pre-flight checks fails (API error, database error, unexpected response):

1. Log the failed attempt:
   ```sql
   INSERT INTO x_tweets (type, content, content_style, posting_window, status, humanizer_score, posted_at)
   VALUES ('ORIGINAL', 'CONTENT', 'STYLE', 'WINDOW', 'FAILED', SCORE, NOW());
   ```
2. Do **not** increment the budget counter for failed posts.
3. Reply with the error details so the issue can be diagnosed.
