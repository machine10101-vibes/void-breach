import type { SkillId } from "./types";

export type SkillRanks = Record<SkillId, number>;

export const SKILL_MAX = 3;

export const SKILL_ORDER: SkillId[] = ["frag", "overdrive", "cleave", "scan"];

export const SKILL_TRACK: Record<SkillId, { name: string; blurb: string; costs: number[]; lines: string[] }> = {
  frag: {
    name: "Frag",
    blurb: "Wider blast and a heavier payload",
    costs: [70, 120, 190],
    lines: ["+0.45m blast · +22 damage", "+0.45m · +22 damage · −0.6s cooldown", "+0.45m · +22 damage · −0.6s"],
  },
  overdrive: {
    name: "Overdrive",
    blurb: "The suit stays hot longer",
    costs: [80, 140, 210],
    lines: ["+0.45s drive · −1.1s cooldown", "+0.45s · −1.1s cooldown", "+0.45s · −1.1s cooldown"],
  },
  cleave: {
    name: "Cleave",
    blurb: "Longer saw arc and a harder hit",
    costs: [75, 130, 200],
    lines: ["+0.35m arc · +16 damage", "+0.35m · +16 damage · −0.4s cooldown", "+0.35m · +16 damage · −0.4s"],
  },
  scan: {
    name: "Scan",
    blurb: "The ping stays up longer",
    costs: [60, 110, 170],
    lines: ["+1.1s ping · −0.8s cooldown", "+1.1s · −0.8s cooldown", "+1.1s · −0.8s cooldown"],
  },
};

export function emptySkillRanks(): SkillRanks {
  return { frag: 0, overdrive: 0, cleave: 0, scan: 0 };
}

export function clampRank(n: unknown) {
  const v = Math.floor(Number(n) || 0);
  return Math.max(0, Math.min(SKILL_MAX, v));
}

export function sanitizeRanks(raw: Partial<SkillRanks> | undefined): SkillRanks {
  const base = emptySkillRanks();
  if (!raw) return base;
  for (const id of SKILL_ORDER) base[id] = clampRank(raw[id]);
  return base;
}

export function nextSkillCost(id: SkillId, rank: number) {
  if (rank >= SKILL_MAX) return null;
  return SKILL_TRACK[id].costs[rank] ?? null;
}

export function skillSpec(id: SkillId, rank: number) {
  const r = clampRank(rank);
  const row = { cd: 8, dmg: 0, radius: 0, extraSeconds: 0, range: 0, iframes: 0, duration: 0 };
  if (id === "frag") {
    row.cd = +(8 - r * 0.6).toFixed(2);
    row.dmg = 140 + r * 22;
    row.radius = +(5.4 + r * 0.45).toFixed(2);
  } else if (id === "overdrive") {
    row.cd = +(16 - r * 1.1).toFixed(2);
    row.extraSeconds = +(r * 0.45).toFixed(2);
  } else if (id === "cleave") {
    row.cd = +(7 - r * 0.4).toFixed(2);
    row.dmg = 90 + r * 16;
    row.range = +(3.4 + r * 0.35).toFixed(2);
    row.iframes = +(0.28 + r * 0.04).toFixed(2);
  } else {
    row.cd = +(12 - r * 0.8).toFixed(2);
    row.duration = +(7 + r * 1.1).toFixed(2);
  }
  return row;
}
