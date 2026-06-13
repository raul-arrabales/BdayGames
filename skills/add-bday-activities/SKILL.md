---
name: add-bday-activities
description: Add or revise Bday Games challenge and twist content in markdown packs. Use when creating new family-friendly activities, expanding a game pack, adjusting point values or category balance, or validating that authored content fits the repo's parser and live-event UX.
---

# Add Bday Activities

This skill is for authoring or revising game content for Bday Games.

Use it when the task is primarily about:

- adding new challenges to an existing game pack
- creating a new game pack markdown file
- rebalancing categories, points, or rules
- adding or adjusting twist cards
- keeping authored content compatible with the current markdown parser

Do not use it for generic React/UI work unless the UI must change to support a new content capability.

## Goals

- Keep game logic generic and content-driven.
- Prefer editing markdown packs in `src/content/`.
- Maintain Spanish-first, family-friendly, MC-friendly wording.
- Keep entries concise enough to run during a live event.

## Current content contract

Read [references/content-format.md](references/content-format.md) before editing a pack.

Important current rules:

- Frontmatter must include `id`, `title`, and `locale`.
- Sections are keyed by exact headings:
  - `## Reglas`
  - `## Retos:trivia`
  - `## Retos:skill`
  - `## Retos:creative`
  - `## Retos:duel`
  - `## Retos:chaos`
  - `## Sorpresas`
- Challenge and twist lists must be valid YAML list items under their section.

## Authoring workflow

1. Inspect the target pack in `src/content/` and note existing tone, length, and category balance.
2. Choose the correct category for each new challenge:
   - `trivia`: memory, knowledge, guessing
   - `skill`: dexterity, speed, miming, physical micro-challenges
   - `creative`: songs, acting, storytelling, drawing, poses
   - `duel`: direct team-vs-team or representative-vs-representative contests
   - `chaos`: unpredictable, silly, social-pressure, or laughter-heavy moments
3. Keep prompts short and MC-readable.
4. Keep rules to 1-3 bullets unless the task explicitly requires more detail.
5. Use point values that feel proportional to difficulty and show value:
   - easy/quick: around 80-110
   - medium: around 120-150
   - high-energy or performance-heavy: around 160-180
6. Keep surprises structured. Valid twist effect types are:
   - `steal_member`
   - `bonus_points`
   - `swap_scores`
   - `double_round`
   - `skip_turn`
7. Avoid introducing new effect types unless the task explicitly includes engine work.

## Content quality rules

- Favor activities that work in a living room or party space.
- Keep everything family friendly.
- Avoid instructions that require special equipment unless the user asked for it.
- Avoid overly long setup or scoring explanations.
- Prefer content that creates spectator energy, fast turns, and easy MC narration.
- Keep Spanish wording natural and lively.
- Follow the repo's current ASCII-only Spanish convention unless asked to change it.

## When adding a new pack

- Start from the template in [references/content-format.md](references/content-format.md).
- Keep the new pack locale-aware and compatible with the same parser as the existing pack.
- Include at least:
  - 3-5 rules
  - several challenges across multiple categories
  - a small twist set

## Validation

After editing content:

1. Run `npm test`
2. Run `npm run build`
3. If the task changed parser assumptions or added a new pack shape, add or update tests in `src/test/`

## Escalation guidance

If the user asks for new content capabilities that the current parser does not support, do not just invent new markdown shapes. Update the parser and tests intentionally, or explain the limitation and propose the smallest compatible extension.
