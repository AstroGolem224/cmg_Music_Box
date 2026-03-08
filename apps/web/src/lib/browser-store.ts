import type {
  CueEnergy,
  CueArchetype,
  CueRecord,
  DatabaseShape,
  EngineTarget,
  LicensingTarget,
  ProjectRecord,
  ProjectWithCues,
  ReviewState,
} from "@/lib/types";

const STORAGE_KEY = "cmg-music-box-db";

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function seedDatabase(): DatabaseShape {
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

function normalizeCueRecord(
  cue: CueRecord & Partial<Pick<CueRecord, "cueArchetype">>,
): CueRecord {
  return {
    ...cue,
    cueArchetype: cue.cueArchetype ?? "custom",
  };
}

function normalizeDatabase(database: DatabaseShape): DatabaseShape {
  return {
    projects: database.projects ?? [],
    cues: (database.cues ?? []).map(normalizeCueRecord),
  };
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function loadDatabase(): DatabaseShape {
  if (typeof window === "undefined") {
    return seedDatabase();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const database = seedDatabase();
    saveDatabase(database);
    return database;
  }

  try {
    return normalizeDatabase(JSON.parse(raw) as DatabaseShape);
  } catch {
    const database = seedDatabase();
    saveDatabase(database);
    return database;
  }
}

export function saveDatabase(database: DatabaseShape) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function listProjects(database: DatabaseShape) {
  return database.projects
    .map((project) => ({
      ...project,
      cueCount: database.cues.filter((cue) => cue.projectId === project.id).length,
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function getProjectWithCues(
  database: DatabaseShape,
  projectId: string,
): ProjectWithCues | null {
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

export function getCueById(database: DatabaseShape, cueId: string) {
  return database.cues.find((cue) => cue.id === cueId) ?? null;
}

export function createProject(
  database: DatabaseShape,
  input: {
    name: string;
    description: string;
    engineTarget: EngineTarget;
    licensingTarget: LicensingTarget;
  },
) {
  const timestamp = new Date().toISOString();
  const project: ProjectRecord = {
    id: createId(),
    name: normalizeText(input.name) || "Untitled Project",
    description: input.description.trim(),
    engineTarget: input.engineTarget,
    licensingTarget: input.licensingTarget,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return {
    database: {
      ...database,
      projects: [project, ...database.projects],
    },
    project,
  };
}

export function createCue(
  database: DatabaseShape,
  input: {
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
  },
) {
  const timestamp = new Date().toISOString();
  const cue: CueRecord = {
    id: createId(),
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

  return {
    database: {
      projects: database.projects.map((project) =>
        project.id === input.projectId ? { ...project, updatedAt: timestamp } : project,
      ),
      cues: [cue, ...database.cues],
    },
    cue,
  };
}

export function updateCue(
  database: DatabaseShape,
  input: {
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
  },
) {
  const existingCue = database.cues.find((cue) => cue.id === input.cueId);

  if (!existingCue) {
    return null;
  }

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

  return {
    database: {
      projects: database.projects.map((project) =>
        project.id === updatedCue.projectId ? { ...project, updatedAt: timestamp } : project,
      ),
      cues: database.cues.map((cue) => (cue.id === updatedCue.id ? updatedCue : cue)),
    },
    cue: updatedCue,
  };
}
