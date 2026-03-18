# BOOTSTRAP.md — First-Run Onboarding

This file runs once when the bot is first started on the VPS. Follow each step in order, asking the user for input where indicated. Delete this file when onboarding is complete.

---

## Step 1: Check PostgreSQL

Run:
```bash
pg_isready
```

- If it reports "accepting connections" — continue.
- If it fails — tell the user: "PostgreSQL is not running. Please install and start it before continuing. On Ubuntu: `sudo apt install postgresql && sudo systemctl start postgresql`"
- Wait for the user to confirm it's running before proceeding.

## Step 2: Create Database and User

Run these commands:
```bash
sudo -u postgres createuser xbot
sudo -u postgres createdb -O xbot xbot_db
```

If the user or database already exists, that's fine — continue.

Grant permissions:
```bash
sudo -u postgres psql -c "ALTER USER xbot WITH PASSWORD 'xbot';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE xbot_db TO xbot;"
```

## Step 3: Run Schema

Run:
```bash
psql -U xbot -d xbot_db -f db/schema.sql
```

If this fails, check that `db/schema.sql` exists. If it doesn't, tell the user the schema file is missing and halt.

## Step 4: Run Seed Data

Run:
```bash
psql -U xbot -d xbot_db -f db/seed.sql
```

This inserts the default `x_bot_config` row and any initial data.

## Step 5: Ask for X Account Username

**Ask the user:** "What is the X (Twitter) username for the DragonMadeIt account? (without the @ symbol)"

Once they provide it:
1. Store it in the database:
   ```bash
   psql -U xbot -d xbot_db -c "UPDATE x_bot_config SET x_username = 'USERNAME_HERE' WHERE id=1;"
   ```
2. Update TOOLS.md to reference the username where needed.

## Step 6: Check Environment Variables

Check that these env vars are set:
```bash
echo "POSTFORME_API_KEY: ${POSTFORME_API_KEY:-(NOT SET)}"
echo "TWITTERAPI_IO_KEY: ${TWITTERAPI_IO_KEY:-(NOT SET)}"
echo "OPENROUTER_API_KEY: ${OPENROUTER_API_KEY:-(NOT SET)}"
```

If any are missing, tell the user which ones need to be set and wait for confirmation.

## Step 7: Test postforme.dev

Attempt to fetch the bot's own profile:
```bash
curl -s -H "Authorization: Bearer ${POSTFORME_API_KEY}" \
  "https://api.postforme.dev/v1/accounts/me" | head -c 500
```

- If it returns valid data — report success and show the account info.
- If it fails — report the error. Ask the user to verify the API key. This is non-blocking; continue setup.

## Step 8: Test twitterapi.io

Attempt to fetch the bot's own timeline:
```bash
curl -s -H "Authorization: Bearer ${TWITTERAPI_IO_KEY}" \
  "https://api.twitterapi.io/v1/users/USERNAME/timeline" | head -c 500
```

(Replace USERNAME with the value from Step 5.)

- If it returns valid data — report success.
- If it fails — report the error. Ask the user to verify the API key. This is non-blocking; continue setup.

## Step 9: Test Humanizer

Run:
```bash
echo "This is a test sentence about TikTok automation." | node vendor/ai-humanizer/src/cli.js score
```

- Report the score to the user.
- If the command fails, check that `vendor/ai-humanizer/` exists and `node` is installed.

## Step 10: Ask for Competitors

**Ask the user:** "Give me 3-5 X usernames of competitors or accounts you want to monitor (e.g., autoshortsai, opus_clip, etc.)"

For each username provided, insert into the database:
```bash
psql -U xbot -d xbot_db -c "INSERT INTO x_competitors (username, added_at) VALUES ('USERNAME', NOW());"
```

Confirm each insertion.

## Step 11: Ask for Content Focus

**Ask the user:** "What topics and niches should the bot focus on? The defaults are: TikTok growth tips, AI/automation insights, creator economy hot takes, build-in-public, and data-backed content claims. Want to keep these or customize?"

Based on their response, update MEMORY.md's `content_pillars` section with their chosen topics.

## Step 12: First Analytics Snapshot

If the postforme.dev API is working (Step 7 succeeded):
```bash
curl -s -H "Authorization: Bearer ${POSTFORME_API_KEY}" \
  "https://api.postforme.dev/v1/accounts/me/analytics" | head -c 1000
```

Store the baseline metrics:
```bash
psql -U xbot -d xbot_db -c "INSERT INTO x_analytics (snapshot_date, followers, following, tweets_count, raw_data) VALUES (CURRENT_DATE, FOLLOWERS, FOLLOWING, TWEETS, 'RAW_JSON');"
```

If the API isn't working, skip this step.

## Step 13: Test Tweet (Optional)

**Ask the user:** "Would you like to send a test tweet to verify everything works? (yes/no)"

If yes:
1. Draft a simple tweet (e.g., a relevant thought about TikTok or content creation)
2. Run it through the humanizer
3. Show the final text to the user for approval
4. Post it via twitterapi.io
5. Log it in the database
6. Report success or failure

If no, skip.

## Step 14: Register Cron Jobs

Tell the user you're registering the following cron jobs, then run each command:

**Decision Engine** (every 30 minutes):
```bash
openclaw cron add --name "x-decision-engine" --cron "*/30 * * * *" --session isolated --message "Run the decision engine. Read MEMORY.md for current strategy weights. Check budget. If budget available, follow the decision priority in AGENTS.md: (1) reply to high-value targets, (2) post original content, (3) quote-tweet, (4) like relevant tweets. Use the weighted content styles and posting windows from MEMORY.md to decide what to create. All text must pass through the humanizer before posting."
```

**Post Autoresearch** (every 6 hours):
```bash
openclaw cron add --name "x-post-autoresearch" --cron "0 */6 * * *" --session isolated --message "Run the evaluate-posts skill. Pull analytics for all tweets posted in the last 24 hours. Score each tweet by engagement (likes + replies + retweets + quotes). Group by content_style and posting_window. Update the weights in MEMORY.md — increase weight for high-performing styles, decrease for low-performing. Add any new learnings to the learnings array."
```

**Reply Autoresearch** (every 6 hours, offset by 30 min):
```bash
openclaw cron add --name "x-reply-autoresearch" --cron "30 */6 * * *" --session isolated --message "Run the evaluate-replies skill. Pull analytics for all replies posted in the last 24 hours. Score each reply by engagement received. Group by reply_tone and reply_target type. Update the weights in MEMORY.md — increase weight for high-performing tones and target types, decrease for low-performing. Add any new learnings to the learnings array."
```

**Competitor Monitor** (twice daily at 3am and 3pm):
```bash
openclaw cron add --name "x-competitor-monitor" --cron "0 3,15 * * *" --session isolated --message "Run the monitor-competitors skill. For each competitor in x_competitors table, fetch their recent tweets via postforme.dev. Identify their top-performing content. Note any new strategies, topics, or formats they're using. Store observations in x_competitors.last_analysis. Add actionable insights to MEMORY.md learnings."
```

**Analytics Snapshot and Budget Reset** (daily at midnight):
```bash
openclaw cron add --name "x-analytics-snapshot" --cron "0 0 * * *" --session isolated --message "Run the collect-analytics skill. Fetch account-level metrics from postforme.dev and store a daily snapshot in x_analytics. Then reset the daily budget: UPDATE x_bot_config SET daily_used = 0, last_reset_at = NOW() WHERE id=1. Compare today's metrics to yesterday's and log any significant changes to MEMORY.md learnings."
```

Confirm each cron job was registered successfully.

## Step 15: Complete

Tell the user:

> Onboarding is complete. The DragonMadeIt X bot is configured and ready to run.
>
> **Summary:**
> - Database: xbot_db (PostgreSQL)
> - X Account: @{username}
> - Competitors tracked: {count}
> - Cron jobs: 5 registered
> - Daily budget: 50 posts+replies
> - Humanizer: Active
>
> The decision engine will start running on its next cron cycle (every 30 minutes). You can trigger it manually with: `openclaw run --message "Run the decision engine"`

**Then delete this file** — BOOTSTRAP.md should not exist after onboarding is done.
