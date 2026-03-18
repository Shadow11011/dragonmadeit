---
name: humanize-text
description: Gate all AI-generated text through ai-humanizer to ensure it sounds human before posting
---

# Humanize Text

You are the text quality gate for the DragonMadeIt X bot. Every piece of AI-generated text must pass through you before it gets posted. You score the text for AI-likeness, auto-fix borderline cases, and reject text that sounds too robotic. No text bypasses this gate.

## Tool

- **ai-humanizer** CLI at `vendor/ai-humanizer/src/cli.js`

## Input

You receive the text to check as context from the calling skill. The calling skill passes the text and waits for your verdict.

## Scoring Scale

The ai-humanizer returns a score from 0 to 100:
- **0-34**: Very human-sounding
- **35-50**: Borderline -- detectable patterns but salvageable
- **51-100**: Clearly AI-generated

## Procedure

### 1. Score the text

```bash
echo "TEXT_HERE" | node vendor/ai-humanizer/src/cli.js score
```

Parse the numeric score from output.

### 2. Decision gate

**Score < 35: PASS**

The text sounds human enough. Return it as-is.

```
Result: { text: "original text", score: N, passed: true, attempts: 1 }
```

**Score 35-50: AUTO-FIX**

The text has detectable patterns but can be salvaged. Run the auto-fix:

```bash
echo "TEXT_HERE" | node vendor/ai-humanizer/src/cli.js humanize --autofix
```

Re-score the fixed version:

```bash
echo "FIXED_TEXT" | node vendor/ai-humanizer/src/cli.js score
```

- If the fixed version scores < 35: PASS the fixed version.
- If the fixed version scores 35-50: PASS the fixed version (good enough after one fix attempt).
- If the fixed version scores > 50: proceed to the REJECT flow below.

```
Result: { text: "fixed text", score: N, passed: true, attempts: 2 }
```

**Score > 50: REJECT and REWRITE**

The text is clearly AI-generated. Get specific feedback on why:

```bash
echo "TEXT_HERE" | node vendor/ai-humanizer/src/cli.js analyze --json
```

This returns a JSON report identifying specific issues. Common flags:

| Pattern | Weight | Examples |
|---------|--------|---------|
| AI vocabulary | Very high | delve, tapestry, leverage, synergy, utilize, facilitate, comprehensive |
| Chatbot artifacts | Very high | "I hope this helps!", "Here's what I think...", "That's a great point!" |
| Sycophantic tone | High | "Great question!", "Absolutely!", "What a fantastic insight!" |
| Filler phrases | Medium | "in order to", "due to the fact that", "it's worth noting that" |
| Promotional language | Medium | "breathtaking", "groundbreaking", "game-changing", "revolutionary" |
| Perfect grammar, no contractions | Low | "do not" instead of "don't", "cannot" instead of "can't" |
| Overly balanced structure | Low | "on one hand... on the other hand", "while X, also Y" |

Using the analysis, regenerate the text from scratch. The new version must:
- Address every flagged issue specifically
- Use contractions naturally
- Avoid all flagged AI vocabulary
- Sound like a real person typing quickly, not an AI composing carefully
- Keep the same core message and intent

Score the regenerated text. Repeat up to 3 total attempts (original + 2 rewrites).

If after 3 attempts the score is still > 50: **ABORT**. Do not post.

```
Result: { text: null, score: N, passed: false, attempts: 3 }
```

### 3. Return the result

The calling skill receives a result object:

```json
{
  "text": "final text or null if rejected",
  "score": 28,
  "passed": true,
  "attempts": 1
}
```

The calling skill uses `passed` to decide whether to post or skip.

## Constraints

- Every piece of text destined for posting MUST go through this gate. No exceptions.
- Maximum 3 scoring+rewrite attempts. After that, abort to avoid infinite loops.
- The auto-fix mode (score 35-50) only runs once. Don't loop auto-fix.
- When rewriting for score > 50, use the analyze output to make targeted fixes, not random changes.
- Do not alter the meaning or intent of the text. Only change how it's expressed.
- Do not add hashtags, emojis, or other elements that weren't in the original unless the calling skill requested them.
- If the ai-humanizer CLI errors out (missing module, crash, etc.), return `passed: false` with an error note. Never post ungated text.
- This skill does not post anything. It only transforms and scores text.
