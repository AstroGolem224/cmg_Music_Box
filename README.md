# CMG Music Box

Game-focused music generation workflow built around Suno.

This repository contains a Next.js app in `apps/web` plus docs for the product direction.

## Current Status

Implemented:

- a Next.js web app in `apps/web`
- browser-local project and cue persistence with a seeded demo workspace
- a structured cue brief editor
- a cue archetype system for common game-music roles
- an archetype-aware prompt package builder for Suno
- a manual Suno handoff flow with release checks
- copy-to-clipboard controls for Suno prompt fields
- a GitHub Pages deployment workflow

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

## Notes

- The Pages-safe build stores local data in browser `localStorage`.
- That makes GitHub Pages deployment possible, but data stays per-browser.
- The app seeds one demo project and cue on first load.

## Docs

- [Architecture Reference](./docs/architecture-reference.md)
- [GitHub Pages Deploy](./docs/github-pages-deploy.md)
- [Prompting Guide](./docs/PROMPTING.md)
- [Architecture](./docs/architecture.md)
- [Implementation Plan](./docs/implementation-plan.md)
- [ADR 0001: Suno Integration Strategy](./docs/adr/0001-suno-integration-strategy.md)
