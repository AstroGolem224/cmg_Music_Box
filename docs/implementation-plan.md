# Implementation Plan

## 1. Product Thesis

CMG Music Box should reduce the time between "I need music for this game situation" and "I have a reviewed, tagged, exportable asset in my project."

The value is not only generation. The value is workflow.

## 2. Recommended Build Order

## Phase 0: Foundation

Deliverables:

- Repository structure
- Environment config strategy
- Database schema for projects, cues, generation requests, assets, exports
- Storage abstraction
- Provider interface

Acceptance criteria:

- A developer can run the app locally.
- A project and cue can be created.
- A prompt package can be generated from a cue brief.

## Phase 1: Manual Suno MVP

Deliverables:

- Cue editor with game-specific fields
- Prompt preview screen
- Copy/export prompt package for Suno
- Manual import flow for downloaded Suno files
- Asset library with waveform and metadata
- Basic review states: draft, shortlisted, approved, rejected

Acceptance criteria:

- A user can go from cue brief to imported Suno track in under 5 minutes.
- Prompt, asset, and rights metadata remain linked.
- At least one approved cue can be exported for a game project.

## Phase 2: Audio Prep And Export

Deliverables:

- Loudness analysis
- Trim and fade controls
- Loop marker suggestions
- Export pipeline for WAV plus JSON manifest
- Engine presets for Unity, Godot, Unreal

Acceptance criteria:

- Export bundle contains at least one processed audio file and a manifest.
- Loop-capable cues can store validated loop in/out points.
- Export path is deterministic and repeatable.

## Phase 3: Experimental Automation

Deliverables:

- `suno-unofficial` provider adapter
- Background generation jobs
- Polling and asset collection
- Failure dashboards and retry policy

Acceptance criteria:

- Automation can be disabled globally.
- Manual workflow still works if automation fails.
- Provider errors do not corrupt project or asset state.

## Phase 4: Adaptive Game Audio

Deliverables:

- Stem import workflow
- Layer grouping
- Intensity tagging
- Export manifests for layered playback

Acceptance criteria:

- A cue can export as layered assets for adaptive playback.
- Imported stems remain linked to the original cue and variant.

## 3. Proposed Repository Layout

```text
cmg_Music_Box/
  apps/
    web/
    worker/
  packages/
    domain/
    providers/
    audio/
    ui/
  docs/
  prisma/
```

This keeps the provider layer and audio pipeline separate from the web UI.

## 4. MVP Feature Set

### Must-have

- Projects
- Cues
- Prompt templates
- Manual Suno prompt handoff
- Asset import
- Review workflow
- Export bundle

### Should-have

- Duplicate cue as variant baseline
- Tags and search
- Batch export
- Loop marker suggestions
- Notes per asset

### Nice-to-have

- BPM/key estimation
- Stem imports
- Persona/inspiration tracking
- Audio upload reference workflow

## 5. Cue Brief Schema

Recommended fields:

- `name`
- `scene_description`
- `mood`
- `energy_level`
- `tempo_hint`
- `duration_target_sec`
- `loop_required`
- `instrumental_only`
- `primary_instruments`
- `avoid_terms`
- `reference_notes`
- `engine_target`
- `licensing_target`

The prompt layer should convert this structure into Suno-facing text, not the UI itself.

## 6. Prompt System Design

Split prompts into composable blocks:

- game context
- music direction
- technical constraints
- negative constraints

Example output:

```text
Create an instrumental game soundtrack cue for a stealth level in an abandoned orbital research station.
Mood: tense, isolated, intelligent, low-burn suspense.
Energy: low to medium.
Tempo: around 92 BPM.
Instrumentation: analog synth pulses, distant metallic percussion, sub bass drones, sparse piano textures.
Structure: strong intro, stable middle section, clean ending suitable for looping.
Avoid vocals, pop song structure, comedic tone, overly bright leads.
```

This structure is much easier to reason about than freehand prompt writing.

## 7. Automation Strategy

### Manual provider

Behavior:

- Generate prompt package
- Return step-by-step Suno instructions
- Wait for user import

Why this matters:

- stable
- cheap to operate
- compliant with visible product behavior

### Unofficial provider

Behavior:

- Use a self-hosted wrapper or browser worker
- Submit jobs asynchronously
- Poll for result completion
- Download assets automatically

Requirements:

- dedicated Suno account
- secret storage
- CAPTCHA budget if required
- feature flag
- health monitoring

Operational warning:

Do not make this a hard dependency for the whole product.

## 8. Storage Strategy

Store three versions of important assets when possible:

- original download
- processed master
- exported game file

Also store:

- waveform preview data
- manifest file
- source metadata snapshot

Suggested path pattern:

```text
projects/{projectId}/cues/{cueId}/variants/{variantId}/
```

## 9. Export Manifest Design

Example:

```json
{
  "projectId": "proj_123",
  "cueId": "cue_forest_night_low",
  "variantId": "var_03",
  "name": "Forest Night Low Threat",
  "engineTarget": "godot",
  "file": "forest-night-low-threat-v03.wav",
  "durationMs": 124300,
  "loop": {
    "enabled": true,
    "startMs": 2150,
    "endMs": 118900
  },
  "tags": ["forest", "night", "stealth", "ambient", "low-threat"],
  "source": {
    "provider": "suno-manual",
    "commercialUseApproved": true
  }
}
```

The manifest is the contract between your music workflow and the game project.

## 10. Testing Strategy

### Unit tests

- prompt builders
- metadata mappers
- export manifest generation
- provider state transitions

### Integration tests

- import pipeline
- asset analysis pipeline
- export bundle creation

### Manual QA

- listen for click-free loop boundaries
- validate loudness consistency
- confirm asset/provenance linkage

For automation, add contract tests around the adapter so Suno-specific breakage is isolated.

## 11. Risks And Mitigations

### Risk: No official Suno API

Mitigation:

- provider abstraction
- manual provider first
- experimental automation only

### Risk: Commercial rights confusion

Mitigation:

- capture plan tier and generation date
- mark asset commercial status explicitly
- reject ambiguous assets from release export

### Risk: CAPTCHA and account lockouts

Mitigation:

- keep automation internal
- use slow retries
- maintain manual fallback

### Risk: Generated music is not game-ready

Mitigation:

- enforce review state
- add prep tools for trim, fade, loop, loudness

### Risk: Single stereo outputs limit adaptive gameplay

Mitigation:

- design for future stem imports
- keep export manifest extensible

## 12. Strong Recommendation On Scope

If you want this to become a real production tool, the first milestone should not be "make Suno fully automatic."

The first milestone should be:

"make game music requests structured, repeatable, reviewable, and exportable."

That milestone remains valuable even if Suno changes tomorrow.

## 13. Immediate Next Build Steps

1. Initialize the monorepo and app shell.
2. Implement the core Prisma schema.
3. Build the cue editor and prompt preview.
4. Add manual asset import.
5. Add analysis plus export pipeline.
6. Add the experimental provider only after the core workflow feels solid.

## 14. Sources

- https://help.suno.com/en/articles/2416769
- https://help.suno.com/en/articles/2410177
- https://help.suno.com/en/articles/7940161
- https://help.suno.com/en/articles/2409921
- https://github.com/gcui-art/suno-api
