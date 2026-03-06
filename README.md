# CMG Music Box

Game-focused music generation workflow built around Suno.

This repository now contains both the planning baseline and the first working MVP vertical. The product goal is not "an AI music toy", but a usable internal tool for producing, organizing, reviewing, and exporting game-ready music cues with Suno in the loop.

## Current Status

Implemented today:

- a Next.js web app in `apps/web`
- local project and cue persistence with a seeded demo workspace
- a structured cue brief editor
- a cue archetype system for common game-music roles
- an archetype-aware prompt package builder for Suno
- a manual Suno handoff flow with release checks
- copy-to-clipboard controls for Suno prompt fields

Planned next:

- audio import for generated files
- waveform and loudness analysis
- loop marker workflow
- export bundles for game engines
- optional experimental `suno-unofficial` adapter

## Reality Check

As of 2026-03-06, Suno exposes product and rights documentation, but I could not find a documented public developer API from official Suno sources. The main automation options in the ecosystem are unofficial wrappers that rely on Suno session cookies, browser automation, and in some cases paid CAPTCHA solving.

That has direct product impact:

- A stable internal tool is realistic.
- A public multi-tenant SaaS on top of Suno is high-risk.
- Commercial use requires tracks to be created while subscribed to a Pro or Premier plan.
- Songs created on the free tier are not retroactively relicensed if you subscribe later.

## Recommended Product Direction

Build this in two layers:

1. A reliable core product that manages cue briefs, prompt generation, asset imports, review, metadata, loop prep, and game-engine exports.
2. A pluggable generation layer where Suno starts as a manual or semi-manual provider, with an experimental unofficial automation adapter behind a feature flag.

That gives you value even if Suno changes its web app or blocks automation.

## Run Locally

From the repo root:

```bash
npm run dev
```

Other scripts:

```bash
npm run lint
npm run build
```

Notes:

- The current MVP stores local data in `apps/web/data/db.json`.
- That file is ignored by Git so local cue experiments do not pollute the repo.
- The web app seeds one demo project and cue the first time it starts.

## Docs

- [Architecture Reference](./docs/architecture-reference.md) - current-state system architecture
- [Prompting Guide](./docs/PROMPTING.md) - prompt ownership, heuristics, archetypes, Suno limits
- [Architecture](./docs/architecture.md) - earlier planning snapshot
- [Implementation Plan](./docs/implementation-plan.md) - phased execution plan
- [ADR 0001: Suno Integration Strategy](./docs/adr/0001-suno-integration-strategy.md) - provider decision record

## Current MVP Flow

The current vertical slice works like this:

1. Create a game project.
2. Add a cue and choose a cue archetype such as `stealth`, `exploration`, or `boss`.
3. Let `CMG Music Box` build Suno-safe `Description` and `Style` fields locally.
4. Copy those fields from the cue page into Suno.
5. Generate variants in Suno, review them, and use the release checklist before approval.

## Recommended MVP

The first production-worthy version should do the following:

- Create game projects and music cues.
- Generate structured Suno prompts from game context.
- Track variants and revisions for each cue.
- Import Suno downloads manually.
- Store cue metadata, notes, tags, and licensing context.
- Prepare tracks for engine use with fades, trims, and loop markers.
- Export audio plus a JSON manifest for Unity, Godot, or Unreal integration.

## What Not To Build First

Avoid making these assumptions in v1:

- "Suno has a stable public API."
- "Full automation is the only way this product is useful."
- "One final stereo file is enough for game audio."
- "Commercial rights can be cleaned up after generation."

## Sources

Official Suno sources:

- https://help.suno.com/en/articles/5782721
- https://help.suno.com/en/articles/2416769
- https://help.suno.com/en/articles/2410177
- https://help.suno.com/en/articles/7940161
- https://help.suno.com/en/articles/2409921
- https://suno.com/terms

Ecosystem reference for unofficial automation:

- https://github.com/gcui-art/suno-api
