---
name: thread-composer
description: Compose multi-tweet threads for deeper content (uses 1 budget slot for 3-5 tweets)
---

# thread-composer

Compose and post a multi-tweet thread (3-5 tweets) for topics that deserve depth. A thread costs only **1 budget slot** despite consisting of multiple tweets.

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
- `content_pillars` for topic selection
- `posting_windows` to determine current window

### Step 2 — Select Parameters

- **content_style**: Pick using weighted random from `content_styles`.
- **posting_window**: Determine from current system time.
- **topic**: Pick from `content_pillars`. Threads work best for depth — check that the topic has enough substance for 3-5 tweets.

### Step 3 — Choose Thread Format

Select a thread format that fits the topic:

| Format | Example Hook | Best For |
|--------|-------------|----------|
| **Step-by-step tutorial** | "How I automate TikTok content in 5 steps:" | Process explanations, how-tos |
| **Data breakdown** | "I analyzed 100 faceless TikTok accounts. Here's what I found:" | Research, insights, credibility |
| **Story arc** | "6 months ago I started automating content. Here's what happened:" | Personal journey, before/after |
| **Myth-busting** | "3 things everyone gets wrong about TikTok growth:" | Contrarian takes, education |
| **Listicle** | "5 tools every faceless TikTok creator needs:" | Resource sharing, value |

### Step 4 — Generate the Thread

Compose **3 to 5 tweets** forming a cohesive thread:

- **Tweet 1 (Hook)**: Compelling opening that stops the scroll. Make people want to read more. End with a colon or "Thread:" indicator if natural.
- **Tweets 2-4 (Body)**: The substance. Each tweet should:
  - Stand alone as a complete thought
  - Flow logically from the previous tweet
  - Add a distinct piece of value
  - Use line breaks within tweets for readability where appropriate
- **Last Tweet (Closer)**: Strong ending with one of:
  - Key takeaway or summary
  - Call to action ("Follow for more automation tips")
  - Punchline or memorable closer

**Rules for every tweet in the thread:**
- Max **280 characters** each
- No tweet should feel like filler
- Match the selected `content_style`
- Sound human throughout — consistent voice across all tweets

### Step 5 — Humanizer Gate (Per Tweet)

Run the `humanize-text` skill on **each tweet individually**. For each tweet:

| Score Range | Action |
|-------------|--------|
| **< 35** | Pass. |
| **35–50** | Auto-fix with `humanize-text` fix flag. Re-score. If still > 50, regenerate that tweet. |
| **> 50** | Regenerate that specific tweet. Retry up to **3 times**. If still > 50, **abort the entire thread**. Reply: *"Tweet N failed humanizer gate after 3 attempts. Aborting thread."* |

Record the highest `humanizer_score` across all tweets as the thread's score.

### Step 6 — Post the Thread

Post tweets sequentially, chaining each as a reply to the previous:

**Tweet 1 (head of thread):**
```bash
curl -s -X POST "https://api.twitterapi.io/v1/tweets" \
  -H "Authorization: Bearer $TWITTERAPI_IO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "TWEET_1_TEXT"}'
```
Extract `twitter_id` from response. This is the **thread head ID**.

**Tweet 2 onwards (reply chain):**
```bash
curl -s -X POST "https://api.twitterapi.io/v1/tweets/PREVIOUS_TWEET_ID/reply" \
  -H "Authorization: Bearer $TWITTERAPI_IO_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "TWEET_N_TEXT"}'
```
Each tweet replies to the one before it, forming the thread.

- If any tweet in the chain fails to post, stop the thread. Log what was posted. Do not leave orphaned tweets — report the partial thread.

### Step 7 — Log to Database

Log **only the first tweet** (thread head) to the database. Store the full thread content joined with `---` separators:

```sql
INSERT INTO x_tweets (twitter_id, type, content, content_style, posting_window, status, humanizer_score, posted_at)
VALUES ('THREAD_HEAD_ID', 'THREAD', 'TWEET_1_TEXT---TWEET_2_TEXT---TWEET_3_TEXT---...', 'STYLE', 'WINDOW', 'POSTED', MAX_SCORE, NOW());
```

### Step 8 — Increment Budget

Increment by exactly **1**, regardless of how many tweets the thread contains:
```sql
UPDATE x_bot_config SET daily_used = daily_used + 1 WHERE id=1;
```

### Step 9 — Report

Reply with a summary:
- Full thread content (all tweets numbered)
- Thread format used
- Content style used
- Number of tweets in thread
- Highest humanizer score
- Thread head tweet ID
- Current budget usage (X/50)

## Error Handling

If any step after pre-flight checks fails:

1. If the thread was partially posted (some tweets succeeded), log with status 'PARTIAL':
   ```sql
   INSERT INTO x_tweets (twitter_id, type, content, content_style, posting_window, status, humanizer_score, posted_at)
   VALUES ('THREAD_HEAD_ID', 'THREAD', 'PARTIAL_CONTENT', 'STYLE', 'WINDOW', 'PARTIAL', SCORE, NOW());
   ```
   Still increment budget by 1 (tweets were published).

2. If nothing was posted, log with status 'FAILED':
   ```sql
   INSERT INTO x_tweets (type, content, content_style, posting_window, status, humanizer_score, posted_at)
   VALUES ('THREAD', 'CONTENT', 'STYLE', 'WINDOW', 'FAILED', SCORE, NOW());
   ```
   Do **not** increment the budget counter.

3. Reply with error details and what was or was not posted.
