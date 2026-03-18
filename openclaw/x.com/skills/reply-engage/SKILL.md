---
name: reply-engage
description: Find relevant tweets and post replies to build engagement and followers
---

# reply-engage

Find relevant tweets in our niche and post thoughtful replies to build engagement and followers.

## Pre-flight Checks

1. **Budget gate** — Query the daily usage counter:
   ```
   psql -U xbot -d xbot_db -tc "SELECT daily_used FROM x_bot_config WHERE id=1;"
   ```
   If the result is **>= 50**, abort immediately. Reply: *"Daily budget exhausted (50/50). Skipping."*

2. **Rate-limit gate** — Ensure at least 2 minutes since last post or reply:
   ```
   psql -U xbot -d xbot_db -tc "SELECT COUNT(*) FROM x_tweets WHERE posted_at > NOW() - INTERVAL '2 minutes';"
   ```
   If the result is **> 0**, abort. Reply: *"Rate limit: last tweet was < 2 min ago. Skipping."*

## Procedure

### Step 1 — Load Strategy State

Read `MEMORY.md`. Extract:
- `reply_tones` with their weights (e.g., helpful, witty, contrarian, curious)
- `reply_targets` with their weights (e.g., big_account_10k_plus, small_account_under_10k, trending_topic, niche_relevant)
- `content_pillars` for keyword context

### Step 2 — Select Parameters

- **reply_tone**: Pick one using weighted random from `reply_tones`. Higher weight = higher probability.
- **reply_target_type**: Pick one using weighted random from `reply_targets`.

### Step 3 — Find Tweets to Reply To

Based on the selected `reply_target_type`, search for candidate tweets:

| Target Type | Search Strategy |
|-------------|----------------|
| **big_account_10k_plus** | Search for recent tweets from accounts with 10k+ followers in the TikTok/creator/automation niche. Prioritize tweets with moderate engagement (room to be seen). |
| **small_account_under_10k** | Search for questions or discussions from smaller accounts. These are high-value: smaller creators appreciate replies and are more likely to follow back. |
| **trending_topic** | Search for tweets on currently trending topics that relate to content creation, TikTok, or AI. Ride the trend wave. |
| **niche_relevant** | Search for tweets mentioning keywords: "tiktok automation", "faceless content", "ai video", "content creator tools", "tiktok growth", "automated posting". |

Use the postforme.dev search API:
```bash
curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
  "https://api.postforme.dev/v1/search?q=QUERY&limit=10"
```

### Step 4 — Filter and Select Best Tweet

From the search results:
1. **Exclude already-replied tweets** — Check the database:
   ```sql
   SELECT reply_to_tweet_id FROM x_tweets WHERE reply_to_tweet_id IS NOT NULL;
   ```
   Skip any tweet whose ID is already in this list.
2. **Exclude our own tweets** — Skip tweets from our account.
3. **Prefer recency** — Prioritize tweets from the last 6 hours.
4. **Prefer relevance** — Pick the tweet most aligned with our content pillars.
5. Select the single best candidate.

### Step 5 — Classify the Target

Determine the follower count of the tweet author to confirm `reply_target_type`:
- If the original target was `big_account_10k_plus` but the author has < 10k followers, reclassify to `small_account_under_10k` for accurate logging.
- Record the `reply_to_username`.

### Step 6 — Generate Reply

Generate a reply that:
- Matches the selected `reply_tone`
- Is **max 280 characters**
- Adds genuine value to the conversation (never generic "Great post!")
- Sounds human — conversational, natural phrasing
- Subtly positions DragonMadeIt expertise without being salesy (only mention the product if it fits organically)
- Fits the context of the original tweet

### Step 7 — Humanizer Gate

Run the `humanize-text` skill on the reply. Evaluate the returned score:

| Score Range | Action |
|-------------|--------|
| **< 35** | Pass. Proceed to posting. |
| **35–50** | Auto-fix: run `humanize-text` with the `fix` flag. Re-score. If still > 50, regenerate. |
| **> 50** | Regenerate the reply from scratch. Retry up to **3 times**. If still > 50, **abort**. Reply: *"Failed humanizer gate after 3 attempts. Aborting."* |

Record the final `humanizer_score`.

### Step 8 — Post the Reply

```bash
curl -s -X POST "https://api.twitterapi.io/v1/tweets/TWEET_ID/reply" \
  -H "Authorization: Bearer $TWITTERAPI_IO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "REPLY_TEXT"}'
```

- Parse the response and extract the `twitter_id` of the reply.
- If the API returns an error, go to Error Handling.

### Step 9 — Log to Database

```sql
INSERT INTO x_tweets (twitter_id, type, content, content_style, reply_tone, reply_target_type, reply_to_tweet_id, reply_to_username, posting_window, status, humanizer_score, posted_at)
VALUES ('TWITTER_ID', 'REPLY', 'CONTENT', NULL, 'TONE', 'TARGET_TYPE', 'ORIGINAL_TWEET_ID', 'USERNAME', 'WINDOW', 'POSTED', SCORE, NOW());
```

### Step 10 — Increment Budget

```sql
UPDATE x_bot_config SET daily_used = daily_used + 1 WHERE id=1;
```

### Step 11 — Report

Reply with a summary:
- Original tweet URL and author
- Reply content
- Reply tone used
- Target type (confirmed)
- Humanizer score
- Current budget usage (X/50)

## Error Handling

If any step after pre-flight checks fails:

1. Log the failed attempt:
   ```sql
   INSERT INTO x_tweets (type, content, reply_tone, reply_target_type, reply_to_tweet_id, status, humanizer_score, posted_at)
   VALUES ('REPLY', 'CONTENT', 'TONE', 'TARGET_TYPE', 'TWEET_ID', 'FAILED', SCORE, NOW());
   ```
2. Do **not** increment the budget counter.
3. Reply with error details.
