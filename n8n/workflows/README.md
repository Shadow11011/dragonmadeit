# n8n workflows (version-controlled snapshot)

Exported from the live n8n instance at `n8n.shadow11011.theworkpc.com` on the
date of the latest commit. These are the workflows that power the
DragonMadeIt content pipeline.

## Workflows in this directory

| File | Workflow name | Purpose |
|------|--------------|---------|
| `mt5BR1Jn3F4oFpON.json` | DragonMadeIt — Orchestrator | Polls the database every 30 minutes, finds `TikTokAccount` rows where `nextPostAt <= NOW()` and `videoGenStatus = 'IDLE'`, and kicks off the appropriate generation pipeline based on the account's `videoType`. |
| `mpG2ZhLjRCi7ppyw.json` | DragonMadeIt — Gameplay Pipeline | Called by the orchestrator when `videoType = GAMEPLAY`. Fetches gameplay footage, generates a script, narrates via Edge TTS / Kokoro, assembles with FFmpeg, uploads to MinIO (soon: Contabo Object Storage), and posts via the posting API. |
| `nsVYG0dCGX1gEJlH.json` | DragonMadeIt — AI Images Pipeline | Called by the orchestrator when `videoType = AI_IMAGES`. Generates images via Flux, narrates via Edge TTS / Kokoro, assembles with FFmpeg, uploads to storage, and posts via the posting API. |

Other workflows in the live n8n instance (lead-gen pipeline, Telegram bot,
grading/demo routines, Overpass scraping) are intentionally NOT tracked
here — they belong to a separate product surface and are version-
controlled elsewhere.

## Why this exists

Before 2026-04-24 the n8n workflow logic was NOT in version control. Every
edit to the pipeline was a live change to the running n8n instance with no
review trail. This directory is the minimum viable fix: a snapshot of the
current workflows, committed to the repo, so future changes can be diffed
and reviewed alongside the Next.js code they coordinate with.

## Re-importing (disaster recovery or environment bootstrap)

To restore any of these workflows into an n8n instance:

### Via n8n UI

1. Open the target n8n instance.
2. Click Workflows → (top-right) Import from File.
3. Select the `.json` file.
4. Activate the workflow.
5. Re-link credentials (the imported JSON references credentials by ID; if
   the target instance does not have those credentials yet, recreate them
   or re-select existing ones).

### Via CLI

From inside the n8n docker container:

```
docker cp ./n8n/workflows/<file>.json <n8n-container>:/tmp/wf.json
docker exec <n8n-container> n8n import:workflow --input=/tmp/wf.json
```

## Updating this snapshot

Every time the n8n workflows change in production, re-export and commit the
diff. One command from the project root (adjust container name if
different):

```
docker exec n8n rm -rf /tmp/n8n-export \
  && docker exec n8n mkdir -p /tmp/n8n-export \
  && docker exec n8n n8n export:workflow --all --separate --output=/tmp/n8n-export
docker cp n8n:/tmp/n8n-export/. /tmp/all-workflows/
cp /tmp/all-workflows/mt5BR1Jn3F4oFpON.json n8n/workflows/
cp /tmp/all-workflows/mpG2ZhLjRCi7ppyw.json n8n/workflows/
cp /tmp/all-workflows/nsVYG0dCGX1gEJlH.json n8n/workflows/
git diff --stat n8n/workflows/
```

Commit the resulting diff as `chore(n8n): sync workflow snapshot` (or
similar) with a note about what changed in the workflow.

## Credential handling

n8n workflows reference credentials by ID (the `credentials` field on each
node) rather than embedding raw values. Environment-variable-based
settings appear as `{{ $env.NAME }}` expressions that resolve at runtime.
**No raw API keys, tokens, or passwords are checked in with these JSON
files.** Verified via grep sweep at commit time.

If you see a PR modifying these files and it contains strings matching
`sk_live_*`, `ghp_*`, `eyJ*` (JWT), or any other long opaque token
pattern, STOP and reject it — that means someone hard-coded a credential
into a node config, which should always go through the n8n credentials
store or an env-var template instead.
