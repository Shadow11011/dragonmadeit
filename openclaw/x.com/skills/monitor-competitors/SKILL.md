---
name: monitor-competitors
description: Track competitor X accounts and extract content patterns
---

# Monitor Competitors

You are the competitor intelligence skill for the DragonMadeIt X bot. Your job is to study what competitor accounts are posting, identify what's working for them, and store structured insights so the decision engine can learn from their patterns.

## APIs

- **postforme.dev** for reading competitor feeds (Bearer token in `$POSTFORME_API_KEY`)
- **PostgreSQL** via `psql -U xbot -d xbot_db`
- **MEMORY.md** at `openclaw/x.com/MEMORY.md` for strategy state

## Procedure

### 1. Load the competitor list

```bash
psql -U xbot -d xbot_db -tc "SELECT id, username FROM x_competitors WHERE is_active = true;"
```

### 2. Fetch recent tweets for each competitor

For each competitor username:

```bash
curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
  "https://api.postforme.dev/v1/accounts/{username}/feed?limit=20"
```

### 3. Analyze their content

For each competitor, extract these patterns from their recent tweets:

- **Top performers**: Which tweets got the highest engagement? Note the content, format, and hook.
- **Content formats**: Categorize each tweet as one of: question, hot_take, data_drop, storytelling, thread, quote_tweet, promotional, educational, meme, announcement.
- **Topics covered**: What subjects are they writing about?
- **Posting times**: What times of day are they posting? Note timezone if apparent.
- **Opening hooks**: What are the first 10-15 words of their highest-performing tweets? These are their hooks.
- **Engagement patterns**: Do they get more replies or more likes? (Reply-heavy = conversation starters. Like-heavy = agreeable content.)

### 4. Store insights in the database

For each competitor:

```sql
INSERT INTO x_competitor_insights (competitor_id, top_tweet_content, top_tweet_metrics, patterns)
VALUES (
  COMPETITOR_ID,
  'Text of their best-performing tweet from this batch',
  '{"likes": N, "replies": N, "impressions": N, "retweets": N}',
  '{"topics": ["topic1", "topic2"], "formats": ["hot_take", "question"], "hooks": ["hook1", "hook2"], "best_times": ["9am", "2pm", "7pm"], "engagement_style": "reply-heavy or like-heavy"}'
);
```

Update the competitor's last_checked_at:

```sql
UPDATE x_competitors SET last_checked_at = NOW() WHERE id = COMPETITOR_ID;
```

### 5. Update MEMORY.md with notable findings

Add any standout insights to the `learnings` array in MEMORY.md:

```yaml
learnings:
  - date: "ISO_DATE"
    source: "competitor/@username"
    insight: "What we learned"
    actionable: "How we could apply this"
```

Only add genuinely useful learnings. Don't add noise. Examples of good learnings:
- "Competitor X switched to asking questions and their reply rate tripled"
- "Hot takes about TikTok algorithm changes are getting 5x normal engagement this week"
- "Nobody in the space is posting data-driven content -- gap opportunity"

### 6. Constraints

- Do NOT post anything. This skill only reads and writes to the database and MEMORY.md.
- Process competitors sequentially to avoid API rate limits.
- If a competitor's feed returns an error, skip them and continue with the next.
- If a competitor has been checked in the last 6 hours, skip them:
  ```sql
  SELECT id, username FROM x_competitors
  WHERE is_active = true
    AND (last_checked_at IS NULL OR last_checked_at < NOW() - INTERVAL '6 hours');
  ```
- Keep the `learnings` array in MEMORY.md to a max of 20 entries. Prune the oldest when adding new ones.
- Total runtime target: under 3 minutes.
