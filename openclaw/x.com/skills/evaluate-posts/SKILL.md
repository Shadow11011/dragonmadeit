---
name: evaluate-posts
description: Autoresearch loop for original posts -- score performance and evolve content strategy weights
---

# Evaluate Posts

You are the post evaluation engine for the DragonMadeIt X bot. Your job is to score how well original posts performed, then adjust the content strategy weights in MEMORY.md so the bot learns to post more of what works and less of what doesn't. This is the core autoresearch loop for posts.

## APIs

- **postforme.dev** for tweet metrics (Bearer token in `$POSTFORME_API_KEY`)
- **PostgreSQL** via `psql -U xbot -d xbot_db`
- **MEMORY.md** at `openclaw/x.com/MEMORY.md` for strategy weights

## Scoring Formula

**Composite score** = `(replies * 3) + (likes * 1) + (impressions * 0.01)`

Replies are weighted highest because they indicate genuine engagement and conversation. Likes are standard signal. Impressions matter but are discounted heavily since they don't indicate active interest.

## Procedure

### 1. Find unevaluated posts (24+ hours old)

Only evaluate tweets that have had at least 24 hours to accumulate engagement:

```sql
SELECT id, twitter_id, content_style, posting_window
FROM x_tweets
WHERE type IN ('ORIGINAL', 'QUOTE', 'THREAD')
  AND status = 'POSTED'
  AND evaluated = false
  AND posted_at < NOW() - INTERVAL '24 hours';
```

If no results, exit. Nothing to evaluate.

### 2. Fetch metrics for each tweet

For each tweet:

```bash
curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
  "https://api.postforme.dev/v1/posts/{twitter_id}/analytics"
```

Extract: impressions, likes, replies, retweets.

### 3. Compute and store composite score

Calculate: `composite_score = (replies * 3) + (likes * 1) + (impressions * 0.01)`

```sql
UPDATE x_tweets SET
  impressions = N,
  likes = N,
  replies = N,
  retweets = N,
  composite_score = SCORE,
  metrics_updated_at = NOW(),
  evaluated = true
WHERE id = TWEET_ID;
```

### 4. Group by content_style and posting_window

After scoring all tweets in this batch, pull the full evaluated dataset:

```sql
SELECT content_style, posting_window, composite_score
FROM x_tweets
WHERE type IN ('ORIGINAL', 'QUOTE', 'THREAD')
  AND evaluated = true
  AND composite_score IS NOT NULL;
```

Group by `content_style` and by `posting_window` separately. Calculate the median composite score for each group.

### 5. Calculate the overall median

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY composite_score)
FROM x_tweets
WHERE type IN ('ORIGINAL', 'QUOTE', 'THREAD')
  AND evaluated = true;
```

### 6. Adjust strategy weights in MEMORY.md

Read the current `content_strategy.weights` from MEMORY.md. For each content_style variant:

- **If median score is ABOVE the overall median**: increase weight by 10%
  `new_weight = old_weight * 1.10`
- **If median score is BELOW the overall median**: decrease weight by 10%
  `new_weight = old_weight * 0.90`
- **If the variant has fewer than 3 evaluated data points**: keep weight unchanged (insufficient data to judge)
- **Minimum weight floor**: 0.05 (never fully eliminate a variant -- it might work in different conditions)

Apply the same logic to `posting_window` weights if tracked.

### 7. Normalize weights

After adjustment, normalize all weights in each group so they sum to 1.0:

```
normalized_weight = adjusted_weight / sum(all_adjusted_weights)
```

### 8. Write updated weights to MEMORY.md

Update the `content_strategy` section:

```yaml
content_strategy:
  weights:
    hot_take: 0.25
    question: 0.20
    data_drop: 0.18
    storytelling: 0.15
    educational: 0.12
    contrarian: 0.10
  posting_windows:
    morning_8_10: 0.30
    afternoon_1_3: 0.25
    evening_6_8: 0.25
    night_9_11: 0.20
  evaluation_count: N  # increment this
  last_evaluated_at: "ISO_TIMESTAMP"
```

### 9. Log the evaluation

```sql
INSERT INTO x_evaluations (eval_type, items_evaluated, avg_composite_score, strategy_changes, notes)
VALUES (
  'POSTS',
  N,
  AVG_SCORE,
  '{"promoted": ["styles that went up"], "demoted": ["styles that went down"], "unchanged": ["styles with insufficient data"]}',
  'Human-readable summary: e.g. hot_takes continue to outperform, questions underperforming this week'
);
```

### 10. Constraints

- Do NOT post anything. This skill only reads metrics and updates strategy.
- Only evaluate tweets that are 24+ hours old. Younger tweets haven't had enough time.
- Never set a weight below 0.05. Every variant gets a chance to prove itself.
- Variants with fewer than 3 data points are left alone. Don't make decisions on small samples.
- Always normalize weights to sum to 1.0 after adjustments.
- If postforme.dev returns errors for a specific tweet, skip it and continue with others. Mark it as evaluated with null metrics so it doesn't block future runs.
- Total runtime target: under 2 minutes.
