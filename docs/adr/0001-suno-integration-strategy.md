# ADR 0001: Suno Integration Strategy

## Status

Accepted

## Context

CMG Music Box is intended to generate and manage music assets for games using Suno.

As of 2026-03-06:

- Suno clearly documents rights, plan tiers, downloads, Studio, and product workflows.
- Suno does not appear to publish a stable public developer API in its official documentation.
- Community integrations are explicit about being unofficial and commonly depend on cookies, CAPTCHA solving, or browser automation.

This creates architectural risk if the whole product assumes stable programmatic generation.

## Decision

CMG Music Box will use a provider abstraction and ship with:

1. `suno-manual` as the default provider for the MVP
2. `suno-unofficial` as an optional experimental provider
3. a placeholder path for a future official provider if Suno releases one

The core product must remain useful without automation.

## Consequences

### Positive

- Lower launch risk
- Faster path to a usable internal tool
- Better legal/provenance tracking
- Easier migration if Suno changes or later ships an official API

### Negative

- The first version is not "one click fully automatic"
- Users may need to generate in Suno manually at first
- Some advanced workflows stay manual until automation is hardened

## Non-goals

- Building a public multi-tenant Suno SaaS in v1
- Coupling core data models to Suno response formats
- Treating unofficial wrappers as production-grade contracts

## Review Trigger

Revisit this decision if:

- Suno publishes official developer documentation
- Suno offers a partner API
- automation reliability is proven over time in internal use

## References

- https://help.suno.com/en/articles/2416769
- https://help.suno.com/en/articles/2410177
- https://help.suno.com/en/articles/7940161
- https://github.com/gcui-art/suno-api
