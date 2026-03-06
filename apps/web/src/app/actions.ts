"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createCue, createProject, updateCue } from "@/lib/store";
import type {
  CueEnergy,
  CueArchetype,
  EngineTarget,
  LicensingTarget,
  ReviewState,
} from "@/lib/types";

const cueArchetypes = [
  "custom",
  "stealth",
  "exploration",
  "combat",
  "boss",
  "menu",
  "victory",
  "defeat",
  "dialogue",
] as const;
const engineTargets = ["godot", "unity", "unreal"] as const;
const licensingTargets = ["commercial", "prototype"] as const;
const energyLevels = ["low", "medium", "high"] as const;
const reviewStates = ["draft", "shortlisted", "approved", "rejected"] as const;

function readText(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function readBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readNumber(formData: FormData, key: string, fallback: number) {
  const raw = Number(readText(formData, key, String(fallback)));

  if (Number.isNaN(raw)) {
    return fallback;
  }

  return Math.max(30, Math.min(600, Math.round(raw)));
}

function readEnum<T extends string>(
  formData: FormData,
  key: string,
  allowed: readonly T[],
  fallback: T,
) {
  const value = readText(formData, key, fallback);
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export async function createProjectAction(formData: FormData) {
  const project = await createProject({
    name: readText(formData, "name", "Untitled Project"),
    description: readText(formData, "description"),
    engineTarget: readEnum<EngineTarget>(formData, "engineTarget", engineTargets, "godot"),
    licensingTarget: readEnum<LicensingTarget>(
      formData,
      "licensingTarget",
      licensingTargets,
      "commercial",
    ),
  });

  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function createCueAction(formData: FormData) {
  const projectId = readText(formData, "projectId");
  const cue = await createCue({
    projectId,
    name: readText(formData, "name", "Untitled Cue"),
    cueArchetype: readEnum<CueArchetype>(
      formData,
      "cueArchetype",
      cueArchetypes,
      "custom",
    ),
    sceneDescription: readText(formData, "sceneDescription"),
    mood: readText(formData, "mood", "focused and atmospheric"),
    energyLevel: readEnum<CueEnergy>(formData, "energyLevel", energyLevels, "medium"),
    tempoHint: readText(formData, "tempoHint", "around 100 BPM"),
    durationTargetSec: readNumber(formData, "durationTargetSec", 120),
    loopRequired: readBoolean(formData, "loopRequired"),
    instrumentalOnly: readBoolean(formData, "instrumentalOnly"),
    primaryInstruments: readText(formData, "primaryInstruments"),
    avoidTerms: readText(formData, "avoidTerms"),
    referenceNotes: readText(formData, "referenceNotes"),
  });

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/cues/${cue.id}`);
}

export async function updateCueAction(formData: FormData) {
  const projectId = readText(formData, "projectId");
  const cueId = readText(formData, "cueId");
  const cue = await updateCue({
    cueId,
    name: readText(formData, "name", "Untitled Cue"),
    cueArchetype: readEnum<CueArchetype>(
      formData,
      "cueArchetype",
      cueArchetypes,
      "custom",
    ),
    sceneDescription: readText(formData, "sceneDescription"),
    mood: readText(formData, "mood", "focused and atmospheric"),
    energyLevel: readEnum<CueEnergy>(formData, "energyLevel", energyLevels, "medium"),
    tempoHint: readText(formData, "tempoHint", "around 100 BPM"),
    durationTargetSec: readNumber(formData, "durationTargetSec", 120),
    loopRequired: readBoolean(formData, "loopRequired"),
    instrumentalOnly: readBoolean(formData, "instrumentalOnly"),
    primaryInstruments: readText(formData, "primaryInstruments"),
    avoidTerms: readText(formData, "avoidTerms"),
    referenceNotes: readText(formData, "referenceNotes"),
    reviewState: readEnum<ReviewState>(formData, "reviewState", reviewStates, "draft"),
  });

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/cues/${cue.id}`);
  redirect(`/projects/${projectId}/cues/${cue.id}`);
}

