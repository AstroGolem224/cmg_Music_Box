export type EngineTarget = "godot" | "unity" | "unreal";
export type LicensingTarget = "commercial" | "prototype";
export type CueEnergy = "low" | "medium" | "high";
export type CueArchetype =
  | "custom"
  | "stealth"
  | "exploration"
  | "combat"
  | "boss"
  | "menu"
  | "victory"
  | "defeat"
  | "dialogue";
export type ReviewState = "draft" | "shortlisted" | "approved" | "rejected";

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  engineTarget: EngineTarget;
  licensingTarget: LicensingTarget;
  createdAt: string;
  updatedAt: string;
}

export interface CueRecord {
  id: string;
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
  reviewState: ReviewState;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary extends ProjectRecord {
  cueCount: number;
}

export interface ProjectWithCues extends ProjectRecord {
  cueCount: number;
  cues: CueRecord[];
}

export interface DatabaseShape {
  projects: ProjectRecord[];
  cues: CueRecord[];
}

