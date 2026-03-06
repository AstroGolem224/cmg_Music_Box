import type { CueArchetype } from "@/lib/types";

export interface CueArchetypeProfile {
  value: CueArchetype;
  label: string;
  descriptionNoun: string;
  styleTags: string[];
  gameplayRole: string;
  promptFocus: string;
}

export const cueArchetypeProfiles: Record<CueArchetype, CueArchetypeProfile> = {
  custom: {
    value: "custom",
    label: "Custom",
    descriptionNoun: "game cue",
    styleTags: [],
    gameplayRole: "Flexible cue without a fixed gameplay archetype.",
    promptFocus: "clear gameplay purpose",
  },
  stealth: {
    value: "stealth",
    label: "Stealth",
    descriptionNoun: "stealth cue",
    styleTags: ["stealth", "suspense"],
    gameplayRole: "Support sneaking, caution, and low-visibility movement.",
    promptFocus: "controlled tension",
  },
  exploration: {
    value: "exploration",
    label: "Exploration",
    descriptionNoun: "exploration cue",
    styleTags: ["exploration", "ambient"],
    gameplayRole: "Support traversal, discovery, and world absorption.",
    promptFocus: "forward motion without pressure",
  },
  combat: {
    value: "combat",
    label: "Combat",
    descriptionNoun: "combat cue",
    styleTags: ["combat", "action"],
    gameplayRole: "Support active combat and sustained gameplay pressure.",
    promptFocus: "driving momentum",
  },
  boss: {
    value: "boss",
    label: "Boss",
    descriptionNoun: "boss battle cue",
    styleTags: ["boss fight", "cinematic", "combat"],
    gameplayRole: "Support boss-phase escalation and encounter pressure.",
    promptFocus: "escalating threat",
  },
  menu: {
    value: "menu",
    label: "Menu",
    descriptionNoun: "main menu cue",
    styleTags: ["main menu", "title theme"],
    gameplayRole: "Establish game identity and atmosphere on repeat playback.",
    promptFocus: "identity and replay value",
  },
  victory: {
    value: "victory",
    label: "Victory",
    descriptionNoun: "victory cue",
    styleTags: ["victory", "resolution"],
    gameplayRole: "Deliver success payoff and emotional release.",
    promptFocus: "reward and uplift",
  },
  defeat: {
    value: "defeat",
    label: "Defeat",
    descriptionNoun: "defeat cue",
    styleTags: ["defeat", "somber"],
    gameplayRole: "Support failure aftermath and reset emotion.",
    promptFocus: "loss and reset",
  },
  dialogue: {
    value: "dialogue",
    label: "Dialogue",
    descriptionNoun: "dialogue bed",
    styleTags: ["dialogue bed", "underscore"],
    gameplayRole: "Support spoken scenes without crowding dialogue.",
    promptFocus: "space for voices",
  },
};

export const cueArchetypeOptions = Object.values(cueArchetypeProfiles);
