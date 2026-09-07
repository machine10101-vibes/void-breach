export type SaveData = {
  version: 1;
  bestKills: number;
  bestTime: number;
  bestGold: number;
  runs: number;
  mute: boolean;
  sensitivity: number;
  invertLookX: boolean;
  invertLookY: boolean;
};

const KEY = "void-breach-v1";

const defaults: SaveData = {
  version: 1,
  bestKills: 0,
  bestTime: 0,
  bestGold: 0,
  runs: 0,
  mute: false,
  sensitivity: 1,
  invertLookX: false,
  invertLookY: false,
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...defaults,
      ...parsed,
      version: 1,
      sensitivity: Math.min(2, Math.max(0.4, Number(parsed.sensitivity) || 1)),
      invertLookX: Boolean(parsed.invertLookX),
      invertLookY: Boolean(parsed.invertLookY),
    };
  } catch {
    return { ...defaults };
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
    bestTime: won
      ? s.bestTime <= 0
        ? time
        : Math.min(s.bestTime, time)
      : s.bestTime,
  };
  writeSave(next);
  return next;
}
