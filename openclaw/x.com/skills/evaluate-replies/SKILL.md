---
name: evaluate-replies
description: Autoresearch loop for replies -- relative scoring to remove audience-size bias, evolve reply strategy
---

# Evaluate Replies

You are the reply evaluation engine for the DragonMadeIt X bot. Your job is to score how well replies performed RELATIVE to other replies on the same parent post. This removes audience-size bias -- a reply getting 5 likes on a small account's post might be excellent, while 5 likes on a viral thread is mediocre. You then adjust reply strategy weights in MEMORY.md.

## APIs

- **postforme.dev** for tweet metrics (Bearer token in `$POSTFORME_API_KEY`)
- **PostgreSQL** via `psql -U xbot -d xbot_db`
- **MEMORY.md** at `openclaw/x.com/MEMORY.md` for strategy weights

## Scoring Formula

**Relative score** = `our_reply_likes / avg_reply_likes_on_same_parent`

- Score > 1.0 = we outperformed the average reply
- Score = 1.0 = exactly average
- Score < 1.0 = we underperformed
- If avg_reply_likes is 0, fall back to absolute likes as the score

## Procedure

### 1. Find unevaluated replies (24+ hours old)

```sql
SELECT id, twitter_id, reply_tone, reply_target_type, reply_to_tweet_id
FROM x_tweets
WHERE type = 'REPLY'
  AND status = 'POSTED'
  AND evaluated = false
  AND posted_at < NOW() - INTERVAL '24 hours';
```

If no results, exit.

### 2. For each reply, compute relative score

**a. Fetch our reply's metrics:**

```bash
curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
  "https://api.postforme.dev/v1/posts/{twitter_id}/analytics"
```

Extract our likes, impressions.

**b. Fetch the parent tweet's reply landscape:**

```bash
curl -s -H "Authorization: Bearer $POSTFORME_API_KEY" \
  "https://api.postforme.dev/v1/posts/{reply_to_tweet_id}/replies?limit=50"
```

From the replies, calculate the average likes across all replies on that parent post.

**c. Calculate relative score:**

```
if avg_reply_likes > 0:
    relative_score = our_likes / avg_reply_likes
else:
    relative_score = our_likes  # fallback to absolute
```

### 3. Store the score

```sql
UPDATE x_tweets SET
  impressions = N,
  likes = N,
  replies = N,
  relative_score = RELATIVE_SCORE,
  metrics_updated_at = NOW(),
  evaluated = true
WHERE id = TWEET_ID;
```

### 4. Group evaluated replies

Pull all evaluated replies and group by two dimensions independently:

**By reply_tone:**
```sql
SELECT reply_tone,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY relative_score) as median_score,
  COUNT(*) as sample_size
FROM x_tweets
WHERE type = 'REPLY' AND evaluated = true AND relative_score IS NOT NULL
GROUP BY reply_tone;
```

Tones: `helpful-expert`, `witty-casual`, `contrarian-thoughtful`, `amplifier-supporter`

**By reply_target_type:**
```sql
SELECT reply_target_type,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY relative_score) as median_score,
  COUNT(*) as sample_size
FROM x_tweets
WHERE type = 'REPLY' AND evaluated = true AND relative_score IS NOT NULL
GROUP BY reply_target_type;
```

Targets: `big_account_10k_plus`, `small_account_under_10k`, `trending_topic`, `niche_relevant`

### 5. Calculate overall median relative score

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY relative_score)
FROM x_tweets
WHERE type = 'REPLY' AND evaluated = true AND relative_score IS NOT NULL;
```

### 6. Adjust reply strategy weights

Apply the same keep/discard logic as evaluate-posts, independently for each group:

**For reply_tones:**
- Tone median ABOVE overall median: increase weight by 10%
- Tone median BELOW overall median: decrease weight by 10%
- Fewer than 3 data points: keep unchanged
- Minimum floor: 0.05
- Normalize to sum to 1.0

**For reply_targets:**
- Same logic applied independently
- Normalize to sum to 1.0

### 7. Cross-inform the post strategy

This is where replies feed back into the content strategy. If you notice:
- A specific topic consistently gets high relative scores in replies, note it in MEMORY.md `learnings` so the post strategy considers covering that topic in original posts
- A tone that works well in replies might also work in posts (e.g., if witty-casual replies outperform, suggest trying more casual original posts)

Add cross-learnings to MEMORY.md:

```yaml
learnings:
  - date: "ISO_DATE"
    source: "evaluate-replies/cross-inform"
    insight: "What we learned from reply performance"
    actionable: "Suggestion for the post strategy"
```

### 8. Write updated weights to MEMORY.md

Update the `reply_strategy` section:

```yaml
reply_strategy:
  tone_weights:
    helpful-expert: 0.30
    witty-casual: 0.30
    contrarian-thoughtful: 0.20
    amplifier-supporter: 0.20
  target_weights:
    big_account_10k_plus: 0.25
    small_account_under_10k: 0.25
    trending_topic: 0.25
    niche_relevant: 0.25
  evaluation_count: N
  last_evaluated_at: "ISO_TIMESTAMP"
```

### 9. Log the evaluation

```sql
INSERT INTO x_evaluations (eval_type, items_evaluated, avg_composite_score, strategy_changes, notes)
VALUES (
  'REPLIES',
  N,
  AVG_RELATIVE_SCORE,
  '{"promoted_tones": ["tones that went up"], "demoted_tones": ["tones that went down"], "promoted_targets": ["targets that went up"], "demoted_targets": ["targets that went down"]}',
  'Summary: e.g. witty-casual replies on big accounts are our best combo, helpful-expert on trending topics underperforming'
);
```

### 10. Constraints

- Do NOT post anything. This skill only reads metrics and updates strategy.
- Only evaluate replies that are 24+ hours old.
- Relative scoring is essential -- never use absolute metrics to compare replies across different parent posts.
- Never set a weight below 0.05.
- Variants with fewer than 3 data points are left unchanged.
- Always normalize each weight group independently to sum to 1.0.
- If postforme.dev can't fetch the parent tweet's replies (deleted, private, etc.), skip that reply and mark it evaluated with null relative_score.
- Limit cross-inform learnings to genuinely actionable insights. Don't add noise.
- Total runtime target: under 3 minutes.
