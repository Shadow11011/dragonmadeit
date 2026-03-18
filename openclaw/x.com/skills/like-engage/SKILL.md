---
name: like-engage
description: Like tweets freely to increase visibility and build goodwill (unlimited, no budget cost)
---

# like-engage

Like tweets strategically to increase account visibility and build goodwill. Likes are unlimited and do not count against the daily 50 post+reply budget.

## Pre-flight Checks

**No budget check required.** Likes are free and unlimited.

## Procedure

### Step 1 — Determine Like Targets

Find tweets worth liking across these categories (in priority order):

1. **Tweets we just replied to** — Always like any tweet we reply to. Check for recent replies that lack a corresponding like:
   ```sql
   SELECT reply_to_tweet_id FROM x_tweets
   WHERE type = 'REPLY' AND posted_at > NOW() - INTERVAL '1 hour'
   ORDER BY posted_at DESC;
   ```

2. **Tweets from new followers** — People who recently followed us. Use postforme.dev:
   ```bash
   curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
     "https://api.postforme.dev/v1/followers/recent?limit=10"
   ```
   Find their latest tweets and like 1-2 from each.

3. **Tweets from competitor followers** — People who follow accounts in our niche (TikTok automation, faceless content, AI video). Search for their activity:
   ```bash
   curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
     "https://api.postforme.dev/v1/search?q=NICHE_KEYWORD&limit=10"
   ```

4. **Tweets mentioning our content pillars** — Tweets about TikTok automation, content creation tools, faceless videos, etc. These are potential future followers.

### Step 2 — Select 3-5 Tweets

From the candidates gathered above:
- Pick **3 to 5 tweets** to like in this invocation.
- Avoid liking tweets we have already liked (check twitterapi.io or track locally if available).
- Prefer tweets from the last 12 hours.
- Mix across categories — do not like 5 tweets from the same source.

### Step 3 — Like Each Tweet

For each selected tweet, with a **minimum 30-second pause** between likes:

```bash
curl -s -X POST "https://api.twitterapi.io/v1/tweets/TWEET_ID/like" \
  -H "Authorization: Bearer $TWITTERAPI_IO_KEY"
```

- If the API returns a rate-limit error, stop liking and report how many succeeded.
- If a specific like fails (already liked, tweet deleted), skip it and continue.

### Step 4 — Update Tracking Counter

After all likes are complete, increment the daily tracking counter:
```sql
UPDATE x_bot_config SET daily_likes = daily_likes + LIKES_COUNT WHERE id=1;
```

This is for tracking and analytics only — it does not gate future likes.

### Step 5 — Report

Reply with a summary:
- Number of tweets liked
- List of tweet IDs and authors liked
- Category breakdown (e.g., 2 reply-backs, 1 new follower, 2 niche)
- Daily likes total so far

## Error Handling

- If the twitterapi.io API is unreachable, report the error and retry later.
- If individual likes fail, continue with remaining tweets. Report partial results.
- No database logging of individual likes is required (they are free actions), but the daily counter must be updated for any successful likes.
