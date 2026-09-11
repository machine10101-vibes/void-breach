import { buildMission } from "./level";
import type { MissionId } from "./types";

export type MissionInfo = {
  id: MissionId;
  name: string;
  code: string;
  blurb: string;
  unlocksAfter?: MissionId;
  threat: string;
};

export const MISSIONS: MissionInfo[] = [
  {
    id: "ashfall",
    name: "Ashfall Gate",
    code: "01",
    blurb: "Boulevard drop. Push the plaza, hold the overpass, and burn the Harbinger at the Void Gate.",
    threat: "Husk packs · Harbinger",
  },
  {
    id: "ember",
    name: "Ember Rail",
    code: "02",
    blurb: "Collapsed metro spine. Spitters own the platforms. Extract after the Rail Warden drops.",
    unlocksAfter: "ashfall",
    threat: "Spitters · Wraiths · Rail Warden",
  },
  {
    id: "spire",
    name: "Null Spire",
    code: "03",
    blurb: "Shade nest in the broadcast tower. Wraiths blink the halls. Seal the Sovereign.",
    unlocksAfter: "ember",
    threat: "Wraiths · Brutes · Null Sovereign",
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
