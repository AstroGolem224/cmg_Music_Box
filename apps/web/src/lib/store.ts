import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  CueEnergy,
  CueArchetype,
  CueRecord,
  DatabaseShape,
  EngineTarget,
  LicensingTarget,
  ProjectRecord,
  ProjectSummary,
  ProjectWithCues,
  ReviewState,
} from "@/lib/types";

const dataDirectory = path.join(process.cwd(), "data");
const dataFile = path.join(dataDirectory, "db.json");

function normalizeCueRecord(
  cue: CueRecord & Partial<Pick<CueRecord, "cueArchetype">>,
): CueRecord {
  return {
    ...cue,
    cueArchetype: cue.cueArchetype ?? "custom",
  };
}

function seedDatabase(): DatabaseShape {
  const createdAt = new Date().toISOString();

  return {
    projects: [
      {
        id: "demo-project",
        name: "Nebula Drifter",
        description:
          "A moody sci-fi action game with stealth sections, derelict stations, and low-gravity firefights.",
        engineTarget: "godot",
        licensingTarget: "commercial",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    cues: [
      {
        id: "demo-cue",
        projectId: "demo-project",
        name: "Docking Bay Lurk",
        cueArchetype: "stealth",
        sceneDescription:
          "The player creeps through a cold industrial docking bay while distant machines keep humming.",
        mood: "tense, watchful, mysterious",
        energyLevel: "low",
        tempoHint: "around 94 BPM",
        durationTargetSec: 110,
        loopRequired: true,
        instrumentalOnly: true,
        primaryInstruments:
          "analog synth pulse, muted percussion, sub bass drone, glassy piano fragments",
        avoidTerms: "big EDM drops, heroic brass, comedy cues",
        referenceNotes:
          "Needs a clean middle section for stealth gameplay and a restrained ending that can be looped.",
        reviewState: "shortlisted",
        createdAt,
        updatedAt: createdAt,
      },
    ],
  };
}

async function writeDatabase(database: DatabaseShape) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(dataFile, JSON.stringify(database, null, 2), "utf8");
}

async function ensureDatabase(): Promise<DatabaseShape> {
  await mkdir(dataDirectory, { recursive: true });

  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as DatabaseShape;
    let changed = false;
    const normalized: DatabaseShape = {
      ...parsed,
      cues: parsed.cues.map((cue) => {
        const nextCue = normalizeCueRecord(cue);

        if (nextCue.cueArchetype !== cue.cueArchetype) {
          changed = true;
        }

        return nextCue;
      }),
    };

    if (changed) {
      await writeDatabase(normalized);
    }

    return normalized;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    const database = seedDatabase();
    await writeDatabase(database);
    return database;
  }
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const database = await ensureDatabase();

  return database.projects
    .map((project) => ({
      ...project,
      cueCount: database.cues.filter((cue) => cue.projectId === project.id).length,
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getProjectWithCues(
  projectId: string,
): Promise<ProjectWithCues | null> {
  const database = await ensureDatabase();
  const project = database.projects.find((entry) => entry.id === projectId);

  if (!project) {
    return null;
  }

  const cues = database.cues
    .filter((cue) => cue.projectId === projectId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return {
    ...project,
    cueCount: cues.length,
    cues,
  };
}

export async function getCueById(cueId: string): Promise<CueRecord | null> {
  const database = await ensureDatabase();
  return database.cues.find((cue) => cue.id === cueId) ?? null;
}

export async function createProject(input: {
  name: string;
  description: string;
  engineTarget: EngineTarget;
  licensingTarget: LicensingTarget;
}): Promise<ProjectRecord> {
  const database = await ensureDatabase();
  const timestamp = new Date().toISOString();

  const project: ProjectRecord = {
    id: randomUUID(),
    name: normalizeText(input.name) || "Untitled Project",
    description: input.description.trim(),
    engineTarget: input.engineTarget,
    licensingTarget: input.licensingTarget,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  database.projects.unshift(project);
  await writeDatabase(database);

  return project;
}

export async function createCue(input: {
  projectId: string;
  name: string;
  cueArchetype: CueArchetype;
  sceneDescription: string;
  mood: string;
  energyLevel: CueEnergy;
  tempoHint: string;
  durationTargetSec: number;
  loopRequired: boolean;
  instrumentalOnly: boolean;
  primaryInstruments: string;
  avoidTerms: string;
  referenceNotes: string;
}): Promise<CueRecord> {
  const database = await ensureDatabase();
  const projectIndex = database.projects.findIndex(
    (project) => project.id === input.projectId,
  );

  if (projectIndex === -1) {
    throw new Error("Project not found.");
  }

  const timestamp = new Date().toISOString();
  const cue: CueRecord = {
    id: randomUUID(),
    projectId: input.projectId,
    name: normalizeText(input.name) || "Untitled Cue",
    cueArchetype: input.cueArchetype,
    sceneDescription: input.sceneDescription.trim(),
    mood: normalizeText(input.mood),
    energyLevel: input.energyLevel,
    tempoHint: normalizeText(input.tempoHint),
    durationTargetSec: input.durationTargetSec,
    loopRequired: input.loopRequired,
    instrumentalOnly: input.instrumentalOnly,
    primaryInstruments: input.primaryInstruments.trim(),
    avoidTerms: input.avoidTerms.trim(),
    referenceNotes: input.referenceNotes.trim(),
    reviewState: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  database.cues.unshift(cue);
  database.projects[projectIndex] = {
    ...database.projects[projectIndex],
    updatedAt: timestamp,
  };
  await writeDatabase(database);

  return cue;
}

export async function updateCue(input: {
  cueId: string;
  name: string;
  cueArchetype: CueArchetype;
  sceneDescription: string;
  mood: string;
  energyLevel: CueEnergy;
  tempoHint: string;
  durationTargetSec: number;
  loopRequired: boolean;
  instrumentalOnly: boolean;
  primaryInstruments: string;
  avoidTerms: string;
  referenceNotes: string;
  reviewState: ReviewState;
}): Promise<CueRecord> {
  const database = await ensureDatabase();
  const cueIndex = database.cues.findIndex((cue) => cue.id === input.cueId);

  if (cueIndex === -1) {
    throw new Error("Cue not found.");
  }

  const existingCue = database.cues[cueIndex];
  const timestamp = new Date().toISOString();
  const updatedCue: CueRecord = {
    ...existingCue,
    name: normalizeText(input.name) || existingCue.name,
    cueArchetype: input.cueArchetype,
    sceneDescription: input.sceneDescription.trim(),
    mood: normalizeText(input.mood),
    energyLevel: input.energyLevel,
    tempoHint: normalizeText(input.tempoHint),
    durationTargetSec: input.durationTargetSec,
    loopRequired: input.loopRequired,
    instrumentalOnly: input.instrumentalOnly,
    primaryInstruments: input.primaryInstruments.trim(),
    avoidTerms: input.avoidTerms.trim(),
    referenceNotes: input.referenceNotes.trim(),
    reviewState: input.reviewState,
    updatedAt: timestamp,
  };

  database.cues[cueIndex] = updatedCue;

  const projectIndex = database.projects.findIndex(
    (project) => project.id === updatedCue.projectId,
  );

  if (projectIndex !== -1) {
    database.projects[projectIndex] = {
      ...database.projects[projectIndex],
      updatedAt: timestamp,
    };
  }

  await writeDatabase(database);
  return updatedCue;
}

