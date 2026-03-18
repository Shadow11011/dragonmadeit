# MEMORY.md — Strategy State

This file is the bot's evolving strategy. Read it before every decision. The evaluate-posts and evaluate-replies skills update the weights based on real performance data.

---

```yaml
strategy:
  last_evaluated_posts: null
  last_evaluated_replies: null
  evaluation_count: 0

  # POST STRATEGY (updated by evaluate-posts skill)
  content_styles:
    informative-mentor: { weight: 0.20, posts: 0, avg_score: 0 }
    hot-take-provocateur: { weight: 0.20, posts: 0, avg_score: 0 }
    data-sharer: { weight: 0.20, posts: 0, avg_score: 0 }
    meme-adjacent-casual: { weight: 0.20, posts: 0, avg_score: 0 }
    story-teller: { weight: 0.20, posts: 0, avg_score: 0 }

  posting_windows:
    morning_6_9: { weight: 0.25, posts: 0, avg_score: 0 }
    midday_11_14: { weight: 0.25, posts: 0, avg_score: 0 }
    evening_17_20: { weight: 0.25, posts: 0, avg_score: 0 }
    night_21_24: { weight: 0.25, posts: 0, avg_score: 0 }

  # REPLY STRATEGY (updated by evaluate-replies skill)
  reply_tones:
    helpful-expert: { weight: 0.25, replies: 0, avg_score: 0 }
    witty-casual: { weight: 0.25, replies: 0, avg_score: 0 }
    contrarian-thoughtful: { weight: 0.25, replies: 0, avg_score: 0 }
    amplifier-supporter: { weight: 0.25, replies: 0, avg_score: 0 }

  reply_targets:
    big_account_10k_plus: { weight: 0.25, replies: 0, avg_score: 0 }
    small_account_under_10k: { weight: 0.25, replies: 0, avg_score: 0 }
    trending_topic: { weight: 0.25, replies: 0, avg_score: 0 }
    niche_relevant: { weight: 0.25, replies: 0, avg_score: 0 }

  content_pillars:
    - TikTok growth tips
    - AI and automation insights
    - Creator economy hot takes
    - Behind the scenes of building DragonMadeIt
    - Data-backed content performance claims

learnings: []
```
