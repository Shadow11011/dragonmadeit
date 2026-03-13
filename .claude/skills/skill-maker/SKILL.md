---
name: skill-maker
description: Create new Claude Code skills on demand. Use when the user asks to create a skill, command, workflow, or reusable automation. Generates properly structured SKILL.md files with frontmatter and instructions.
user_invocable: true
auto_invocable: true
---

# Skill Maker

Create new Claude Code skills that follow the Agent Skills standard.

## When to Use

When the user says any of: "create a skill", "make a command", "I want a shortcut for", "automate this workflow", "build a skill that", or describes a repeatable process they want to invoke later.

## Process

### Step 1: Gather Requirements

Ask the user (if not already clear from context):
- **What should the skill do?** (one sentence)
- **When should it trigger?** (on explicit `/command` only, or should Claude auto-invoke when relevant?)
- **What tools does it need?** (Bash, Read, Write, Grep, Glob, etc.)
- **Should it use a specific model?** (opus for complex reasoning, sonnet for speed, haiku for cost)
- **Project-level or global?** (`.claude/skills/` for this project, `~/.claude/skills/` for all projects)

If the user's request is clear enough, skip straight to generating. Don't over-ask.

### Step 2: Generate the Skill

Create a new directory and SKILL.md file:

```
<location>/skills/<skill-name>/SKILL.md
```

The SKILL.md must follow this structure:

```markdown
---
name: <kebab-case-name>
description: <One clear sentence. This is what Claude reads to decide if the skill is relevant. Write it like you're describing the task to a coworker — use the nouns the user would actually type.>
user_invocable: true
auto_invocable: <true if Claude should auto-trigger, false if explicit only>
---

# <Skill Title>

## Instructions

<Clear, imperative instructions. Be directive, not conversational.>
<Use numbered steps for sequential workflows.>
<Use bullet points for rules/constraints.>

## Output Format

<Define exactly what the output should look like.>

## Rules

- <Hard constraints that must never be violated>
- <Edge cases to handle>

## Examples

- "<User says this>" → <Skill does this>
```

### Step 3: Register in CLAUDE.md

After creating the skill, append it to the "Available Skills" section in the project's CLAUDE.md:

```
- `/skill-name` — Brief description of what it does.
```

### Step 4: Confirm

Tell the user:
- The skill name and invocation command
- Where it was saved
- How to use it (explicit `/command` and/or auto-triggered)
- Suggest a quick test invocation

## Skill Quality Rules

- **Keep SKILL.md under 500 words.** Long skills eat context budget.
- **Description is the trigger phrase.** Write it with the nouns users actually type. "Deploy to staging" not "Handles deployment workflows."
- **Be directive.** "Run the test suite" not "You might want to consider running tests."
- **One skill per concern.** A "do everything" skill is worse than three focused ones.
- **Include output format.** Tell Claude exactly how to structure its response.
- **Add supporting files if needed.** Scripts, templates, or reference docs go in the skill's directory alongside SKILL.md.

## Supporting Files

If the skill needs scripts, templates, or reference data, create them in the same directory:

```
.claude/skills/my-skill/
├── SKILL.md
├── template.md        # A template the skill references
└── validate.sh        # A script the skill runs
```

Reference them in SKILL.md using relative paths or `{baseDir}` for the skill folder path.

## Examples

**User:** "Make me a skill that generates a new API route with proper error handling"

**Result:** Creates `.claude/skills/api-route/SKILL.md` with instructions to scaffold a new Route Handler file with try/catch, proper status codes, input validation, and TypeScript types.

**User:** "I want a deploy command"

**Result:** Creates `.claude/skills/deploy/SKILL.md` with pre-deploy checks (tests, lint, git status), build steps, PM2 restart sequence, and post-deploy verification.

**User:** "Create a skill for reviewing PRs"

**Result:** Creates `.claude/skills/pr-review/SKILL.md` with instructions to check for security issues, performance problems, test coverage, and code style — optionally using Agent Teams for parallel review.
