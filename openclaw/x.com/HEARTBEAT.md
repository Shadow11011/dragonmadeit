# HEARTBEAT.md — Health Checks

Run these checks every 5 minutes in the main session. All checks must pass before the bot takes any action.

---

- [ ] **Budget check** — Verify daily budget hasn't been exceeded:
  ```bash
  psql -U xbot -d xbot_db -tc "SELECT daily_used FROM x_bot_config WHERE id=1;"
  ```
  If result >= 50, log warning: "Daily budget exhausted. Switching to likes-only mode." Skip all post/reply/quote actions.

- [ ] **Rate limit safety** — Verify no tweet was posted in the last 2 minutes:
  ```bash
  psql -U xbot -d xbot_db -tc "SELECT COUNT(*) FROM x_tweets WHERE posted_at > NOW() - INTERVAL '2 minutes';"
  ```
  If result > 0, delay any write actions until the 2-minute window has passed.

- [ ] **Bot active check** — Verify the bot hasn't been disabled:
  ```bash
  psql -U xbot -d xbot_db -tc "SELECT is_active FROM x_bot_config WHERE id=1;"
  ```
  If result is `f` (false), skip all actions. Log: "Bot is disabled. Set is_active = true to resume."

- [ ] **Budget reset check** — If it's past midnight and the budget hasn't been reset today:
  ```bash
  psql -U xbot -d xbot_db -tc "SELECT last_reset_at FROM x_bot_config WHERE id=1;"
  ```
  If `last_reset_at` is before today's date, reset the budget:
  ```bash
  psql -U xbot -d xbot_db -c "UPDATE x_bot_config SET daily_used = 0, last_reset_at = NOW() WHERE id=1;"
  ```
  Log: "Daily budget reset to 0."
