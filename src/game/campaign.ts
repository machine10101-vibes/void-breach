import { buildMission } from "./level";
import type { MissionId, Rarity } from "./types";

export type MissionInfo = {
  id: MissionId;
  name: string;
  code: string;
  blurb: string;
  unlocksAfter?: MissionId;
  threat: string;
  length: string;
  loot: string;
};

export type MissionScale = {
  tier: 1 | 2 | 3;
  hp: number;
  dmg: number;
  speed: number;
  extractWaves: number;
  extractKills: number;
  dropChance: number;
  scrapMult: number;
};

export function missionTier(id: MissionId): 1 | 2 | 3 {
  if (id === "spire") return 3;
  if (id === "ember") return 2;
  return 1;
}

export function missionScale(id: MissionId): MissionScale {
  const tier = missionTier(id);
  if (tier === 3) {
    return { tier, hp: 1.58, dmg: 1.34, speed: 1.12, extractWaves: 4, extractKills: 22, dropChance: 0.78, scrapMult: 1.55 };
  }
  if (tier === 2) {
    return { tier, hp: 1.28, dmg: 1.18, speed: 1.06, extractWaves: 3, extractKills: 14, dropChance: 0.7, scrapMult: 1.28 };
  }
  return { tier, hp: 1, dmg: 1, speed: 1, extractWaves: 2, extractKills: 8, dropChance: 0.62, scrapMult: 1 };
}

export function rollMissionRarity(id: MissionId, kind: "husk" | "stalker" | "brute" | "harbinger" | "spitter" | "wraith"): Rarity {
  if (kind === "harbinger") return "legendary";
  const tier = missionTier(id);
  const r = Math.random();
  if (tier === 1) {
    if (kind === "brute" && r > 0.7) return "rare";
    if (r > 0.94) return "rare";
    if (r > 0.52) return "magic";
    return "common";
  }
  if (tier === 2) {
    if (kind === "brute" && r > 0.48) return r > 0.86 ? "legendary" : "rare";
    if (r > 0.9) return "legendary";
    if (r > 0.48) return "rare";
    if (r > 0.14) return "magic";
    return "common";
  }
  if (kind === "brute" && r > 0.28) return r > 0.62 ? "legendary" : "rare";
  if (r > 0.68) return "legendary";
  if (r > 0.18) return "rare";
  return "magic";
}

export const MISSIONS: MissionInfo[] = [
  {
    id: "ashfall",
    name: "Ashfall Gate",
    code: "01",
    blurb: "Short boulevard drop. Push the plaza, hold the overpass, and burn the Harbinger. Common and magic kits fall here.",
    threat: "Husk packs · Harbinger",
    length: "5 packs · short drop",
    loot: "Common · magic",
  },
  {
    id: "ember",
    name: "Ember Rail",
    code: "02",
    blurb: "Longer metro spine. More packs, tougher Shade, and rarer kits. Extract after the Rail Warden drops.",
    unlocksAfter: "ashfall",
    threat: "Spitters · Wraiths · Rail Warden",
    length: "6 packs · long spine",
    loot: "Magic · rare",
  },
  {
    id: "spire",
    name: "Null Spire",
    code: "03",
    blurb: "Longest nest. Heaviest Shade and the best street loot — rare and legendary plates. Seal the Sovereign.",
    unlocksAfter: "ember",
    threat: "Wraiths · Brutes · Null Sovereign",
    length: "7 packs · longest nest",
    loot: "Rare · legendary",
  },
];

export function missionInfo(id: MissionId) {
  return MISSIONS.find((m) => m.id === id) ?? MISSIONS[0];
}

export function isMissionUnlocked(id: MissionId, cleared: MissionId[]) {
  const info = missionInfo(id);
  if (!info.unlocksAfter) return true;
  return cleared.includes(info.unlocksAfter);
}

export function buildSelectedMission(id: MissionId) {
  return buildMission(id);
}
