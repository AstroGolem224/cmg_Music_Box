import type { CueRecord, ProjectRecord } from "@/lib/types";

import { cueArchetypeProfiles } from "@/lib/cue-archetypes";

export const SUNO_DESCRIPTION_MAX_LENGTH = 200;
export const SUNO_STYLE_MAX_LENGTH = 200;
export const SUNO_WRITE_LYRICS_MAX_LENGTH = 3000;

const energyDirection = {
  low: "low and patient, with tension hiding under the surface",
  medium: "measured forward motion with a clear rhythmic pulse",
  high: "driving, urgent, and gameplay-energizing without becoming chaotic",
} as const;

const engineNotes = {
  godot:
    "Keep the middle section stable so it can be dropped into Godot loop regions without audible drama at the seam.",
  unity:
    "Aim for a crisp transient profile and a clean tail so the cue is easy to blend in Unity mixers and snapshots.",
  unreal:
    "Favor layered texture and contrast so the cue can later be split into adaptive Unreal states or stems.",
} as const;

function splitList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripTerminalPunctuation(value: string) {
  return normalizeText(value).replace(/[\s.,;:!?-]+$/g, "");
}

function smartClip(value: string, maxLength: number) {
  const normalized = normalizeText(value);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const target = Math.max(0, maxLength - 3);
  const boundary = normalized.lastIndexOf(" ", target);
  const cutIndex = boundary > Math.floor(maxLength * 0.6) ? boundary : target;

  return `${stripTerminalPunctuation(normalized.slice(0, cutIndex))}...`;
}

function toUniqueList(values: string[]) {
  return Array.from(new Set(values.map(normalizeText).filter(Boolean)));
}

export interface PromptPackage {
  title: string;
  descriptionPrompt: string;
  stylePrompt: string;
  producerBrief: string;
  styleKeywords: string[];
  engineNote: string;
  handoffSteps: string[];
  releaseChecklist: string[];
}

export function buildPromptPackage(
  project: ProjectRecord,
  cue: CueRecord,
): PromptPackage {
  const archetype = cueArchetypeProfiles[cue.cueArchetype];
  const instruments = splitList(cue.primaryInstruments);
  const avoidTerms = splitList(cue.avoidTerms);
  const moodKeywords = splitList(cue.mood);
  const title = `${project.name} - ${cue.name}`;
  const shortScene = smartClip(cue.sceneDescription || cue.name, 88);

  const descriptionPrompt = smartClip(
    [
      cue.instrumentalOnly
        ? `Instrumental ${archetype.descriptionNoun}`
        : archetype.descriptionNoun,
      `for ${shortScene}`,
      cue.mood || "focused and atmospheric",
      `${cue.energyLevel} energy`,
      cue.tempoHint || "game-friendly pulse",
      cue.loopRequired
        ? `${archetype.promptFocus}, loop-friendly middle section`
        : `${archetype.promptFocus}, strong ending`,
    ].join("; ") + ".",
    SUNO_DESCRIPTION_MAX_LENGTH,
  );

  const styleKeywords = toUniqueList([
    ...archetype.styleTags,
    ...moodKeywords,
    cue.energyLevel,
    cue.tempoHint,
    cue.instrumentalOnly ? "instrumental" : "vocals allowed",
    cue.loopRequired ? "loop-friendly" : "full ending",
    "game soundtrack",
    ...instruments,
  ]);

  const stylePrompt = smartClip(
    styleKeywords.join(", "),
    SUNO_STYLE_MAX_LENGTH,
  );

  const producerBrief = [
    `Cue: ${title}.`,
    `Archetype: ${archetype.label}.`,
    `Gameplay role: ${archetype.gameplayRole}`,
    `Scene: ${cue.sceneDescription || cue.name}.`,
    `Mood: ${cue.mood || "focused and atmospheric"}.`,
    `Energy: ${energyDirection[cue.energyLevel]}.`,
    `Tempo: ${cue.tempoHint || "natural, gameplay-friendly pacing"}.`,
    `Target length: around ${cue.durationTargetSec} seconds.`,
    cue.loopRequired
      ? "Structure: defined intro, stable middle, and an ending that can be edited into a seamless gameplay loop."
      : "Structure: cinematic arc with a confident and fully resolved ending.",
    instruments.length > 0
      ? `Instrumentation: ${instruments.join(", ")}.`
      : "Instrumentation: contemporary game-score palette with strong texture and space.",
    cue.instrumentalOnly
      ? "Vocals: instrumental only."
      : "Vocals: allowed if they strengthen the cue without overwhelming gameplay.",
    cue.referenceNotes ? `Reference notes: ${cue.referenceNotes}.` : undefined,
    avoidTerms.length > 0 ? `Avoid: ${avoidTerms.join(", ")}.` : undefined,
    engineNotes[project.engineTarget],
  ]
    .filter(Boolean)
    .join("\n");

  const handoffSteps = [
    "Open Suno Advanced and stay on Auto unless you already wrote full lyrics.",
    `Paste the Description field below into \"Describe your lyrics\" (${SUNO_DESCRIPTION_MAX_LENGTH} chars max).`,
    `Paste the Style field below into \"Enter style tags\" (${SUNO_STYLE_MAX_LENGTH} chars max).`,
    cue.instrumentalOnly
      ? "Turn on Instrumental so the generation stays lyric-free and game-safe."
      : `If you switch to Write Lyrics, keep the lyric field under ${SUNO_WRITE_LYRICS_MAX_LENGTH} chars.`,
    `Judge each variant as a ${archetype.label.toLowerCase()} cue first, then by polish and mix quality.`,
    `Generate at least two variants and keep the one that best fits the ${cue.energyLevel}-energy target.`,
    cue.loopRequired
      ? "Prefer the version with the steadiest middle section because it will be easier to loop cleanly."
      : "Prefer the version with the clearest ending and strongest narrative arc.",
    "Download the best render in WAV if your plan allows it; otherwise keep the highest-quality export available.",
  ];

  const releaseChecklist = [
    project.licensingTarget === "commercial"
      ? "Generate while logged into a Suno Pro or Premier plan if this cue is meant for commercial release."
      : "Prototype mode is fine for early iteration, but commercial release still needs paid-tier provenance.",
    "Keep the exact Suno fields tied to the cue so later revisions stay reproducible.",
    "Listen for noisy intros, abrupt endings, and any vocal artifacts before approving the cue.",
    cue.loopRequired
      ? "Mark loop candidate points after download and reject versions with clicks or harmonic jumps at the seam."
      : "Reject versions whose endings feel clipped or underdeveloped.",
  ];

  return {
    title,
    descriptionPrompt,
    stylePrompt,
    producerBrief,
    styleKeywords,
    engineNote: engineNotes[project.engineTarget],
    handoffSteps,
    releaseChecklist,
  };
}
