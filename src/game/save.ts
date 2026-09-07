import { starterLoadout } from "./items";
import type { EquippedArmor, InvItem } from "./types";

export type SaveData = {
  version: 2;
  bestKills: number;
  bestTime: number;
  bestGold: number;
  runs: number;
  mute: boolean;
  sensitivity: number;
  invertLookX: boolean;
  invertLookY: boolean;
  scrapBank: number;
  inventory: InvItem[];
  equippedWeapon: string | null;
  equippedArmor: EquippedArmor;
};

const KEY = "void-breach-v1";

function emptyArmor(): EquippedArmor {
  return { helm: null, chest: null, arms: null, legs: null };
}

export function defaultSave(): SaveData {
  const loadout = starterLoadout();
  return {
    version: 2,
    bestKills: 0,
    bestTime: 0,
    bestGold: 0,
    runs: 0,
    mute: false,
    sensitivity: 1,
    invertLookX: false,
    invertLookY: false,
    scrapBank: 40,
    inventory: loadout.inventory,
    equippedWeapon: loadout.equippedWeapon,
    equippedArmor: loadout.equippedArmor,
  };
}

export function loadSave(): SaveData {
  const defaults = defaultSave();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<SaveData> & { version?: number };
    const loadout = parsed.inventory?.length ? null : starterLoadout();
    return {
      ...defaults,
      ...parsed,
      version: 2,
      sensitivity: Math.min(2, Math.max(0.4, Number(parsed.sensitivity) || 1)),
      invertLookX: Boolean(parsed.invertLookX),
      invertLookY: Boolean(parsed.invertLookY),
      scrapBank: Math.max(0, Number(parsed.scrapBank) || (loadout ? 40 : 0)),
      inventory: parsed.inventory?.length ? parsed.inventory : loadout?.inventory ?? defaults.inventory,
      equippedWeapon: parsed.equippedWeapon ?? loadout?.equippedWeapon ?? defaults.equippedWeapon,
      equippedArmor: { ...emptyArmor(), ...(parsed.equippedArmor ?? loadout?.equippedArmor ?? defaults.equippedArmor) },
    };
  } catch {
    return defaults;
  }
}

export function writeSave(next: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}

export function recordRun(s: SaveData, kills: number, time: number, gold: number, won: boolean) {
  const next: SaveData = {
    ...s,
    runs: s.runs + 1,
    bestKills: Math.max(s.bestKills, kills),
    bestGold: Math.max(s.bestGold, gold),
    bestTime: won ? (s.bestTime <= 0 ? time : Math.min(s.bestTime, time)) : s.bestTime,
  };
  writeSave(next);
  return next;
}
