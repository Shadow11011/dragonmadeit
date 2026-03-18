---
name: quote-tweet
description: Quote-tweet interesting content with added value commentary
---

# quote-tweet

Find a noteworthy tweet in our niche and quote-tweet it with valuable commentary that showcases DragonMadeIt expertise.

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
- `content_styles` with their weights
- `content_pillars` for topic relevance

### Step 2 — Find a Tweet Worth Quoting

Search for candidate tweets across these categories:

| Category | What to Look For |
|----------|-----------------|
| **Viral niche tweets** | High-engagement tweets (lots of replies/likes) about TikTok, content creation, or AI video that our audience would care about. |
| **Competitor claims** | Tweets from competing tools or creators making interesting claims about automation, growth, or content strategy. |
| **Industry news/data** | Tweets sharing data, reports, or news about TikTok algorithm changes, creator economy trends, or AI content tools. |
| **Opinion-sparking takes** | Hot takes or controversial opinions about content creation that we can add a thoughtful perspective to. |

Use postforme.dev to search:
```bash
curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
  "https://api.postforme.dev/v1/search?q=QUERY&limit=10&sort=engagement"
```

### Step 3 — Filter Candidates

1. **Exclude already-quoted tweets** — Check the database:
   ```sql
   SELECT reply_to_tweet_id FROM x_tweets WHERE type = 'QUOTE';
   ```
2. **Exclude our own tweets** — Never quote-tweet ourselves.
3. **Prefer high engagement** — The original should have enough traction that our quote tweet will be seen.
4. **Prefer recency** — Tweets from the last 24 hours.
5. Select the single best candidate.

### Step 4 — Select Content Style

Pick a `content_style` using weighted random from MEMORY.md weights. The style shapes how the commentary is framed.

### Step 5 — Generate Commentary

Generate quote tweet commentary that:
- Is **max 280 characters**
- Adds **genuine value** — never just "This!" or "So true"
- Uses one of these value-add approaches:
  - **Add missing context or data** the original tweet left out
  - **Offer a different perspective** that makes readers think
  - **Expand with personal experience** (as a TikTok automation builder)
  - **Challenge the premise respectfully** if we disagree
- Matches the selected `content_style`
- Sounds natural and human
- Does not overtly promote DragonMadeIt (expertise speaks for itself)

### Step 6 — Humanizer Gate

Run the `humanize-text` skill on the commentary. Evaluate the returned score:

| Score Range | Action |
|-------------|--------|
| **< 35** | Pass. Proceed to posting. |
| **35–50** | Auto-fix: run `humanize-text` with the `fix` flag. Re-score. If still > 50, regenerate. |
| **> 50** | Regenerate commentary from scratch. Retry up to **3 times**. If still > 50, **abort**. Reply: *"Failed humanizer gate after 3 attempts. Aborting."* |

Record the final `humanizer_score`.

### Step 7 — Post the Quote Tweet

```bash
curl -s -X POST "https://api.twitterapi.io/v1/tweets/TWEET_ID/quote" \
  -H "Authorization: Bearer $TWITTERAPI_IO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "COMMENTARY"}'
```

- Parse the response and extract the `twitter_id`.
- If the API returns an error, go to Error Handling.

### Step 8 — Log to Database

```sql
INSERT INTO x_tweets (twitter_id, type, content, content_style, reply_to_tweet_id, posting_window, status, humanizer_score, posted_at)
VALUES ('TWITTER_ID', 'QUOTE', 'COMMENTARY', 'STYLE', 'QUOTED_TWEET_ID', 'WINDOW', 'POSTED', SCORE, NOW());
```

### Step 9 — Increment Budget

```sql
UPDATE x_bot_config SET daily_used = daily_used + 1 WHERE id=1;
```

### Step 10 — Report

Reply with a summary:
- Original tweet URL and author
- Quote tweet commentary
- Content style used
- Humanizer score
- Current budget usage (X/50)

## Error Handling

If any step after pre-flight checks fails:

1. Log the failed attempt:
   ```sql
   INSERT INTO x_tweets (type, content, content_style, reply_to_tweet_id, status, humanizer_score, posted_at)
   VALUES ('QUOTE', 'COMMENTARY', 'STYLE', 'QUOTED_TWEET_ID', 'FAILED', SCORE, NOW());
   ```
2. Do **not** increment the budget counter.
3. Reply with error details.
