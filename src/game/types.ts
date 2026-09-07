export type WeaponId = "ar" | "shotgun" | "smg";
export type EnemyKind = "husk" | "stalker" | "brute" | "harbinger";
export type Rarity = "common" | "magic" | "rare" | "legendary";
export type Phase = "boot" | "title" | "playing" | "paused" | "dead" | "victory";

export type SkillId = "frag" | "overdrive" | "cleave";

export type HudSkill = {
  id: SkillId;
  key: string;
  name: string;
  cd: number;
  max: number;
  ready: boolean;
};

export type LootToast = {
  id: number;
  name: string;
  rarity: Rarity;
};

export type FloatNum = {
  id: number;
  text: string;
  x: number;
  y: number;
  color: "health" | "void" | "legendary" | "fg";
  life: number;
};

export type WeaponSlot = {
  id: WeaponId;
  name: string;
  rarity: Rarity;
  active: boolean;
};

export type RunStats = {
  time: number;
  kills: number;
  gold: number;
  xp: number;
  shots: number;
  hits: number;
  damageDealt: number;
};

export type BestRun = {
  kills: number;
  time: number;
  gold: number;
  runs: number;
};

export type HudSnapshot = {
  phase: Phase;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  ammo: number;
  magSize: number;
  reserve: number;
  weapon: WeaponId;
  weaponName: string;
  rarity: Rarity;
  gold: number;
  kills: number;
  objective: string;
  hint: string;
  skills: HudSkill[];
  loot: LootToast[];
  reloading: boolean;
  overdrive: boolean;
  sprinting: boolean;
  ads: boolean;
  boss: { name: string; hp: number; max: number } | null;
  hitFlash: number;
  xp: number;
  xpNeed: number;
  level: number;
  combo: number;
  missionTime: number;
  hitMarker: number;
  floating: FloatNum[];
  slots: WeaponSlot[];
  lockLost: boolean;
  compass: number;
  muted: boolean;
  lowAmmo: boolean;
  wave: string;
  stats: RunStats;
  best: BestRun | null;
  sensitivity: number;
  invertLookX: boolean;
  invertLookY: boolean;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setKeys: (codes: string[]) => void;
  setSteer?: (v: number) => void;
  getPos?: () => { x: number; y: number; z: number };
  getCam?: () => { x: number; y: number; z: number; fov: number; dist: number };
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

export type AABB = {
  minx: number;
  miny: number;
  minz: number;
  maxx: number;
  maxy: number;
  maxz: number;
  cover: boolean;
  deco?: "wall" | "cover" | "car" | "pillar" | "crate";
};

export type Spawner = {
  id: string;
  zTrigger: number;
  message: string;
  enemies: { kind: EnemyKind; x: number; z: number }[];
};
