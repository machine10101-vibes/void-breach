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
  boss: { name: string; hp: number; max: number } | null;
  hitFlash: number;
  xp: number;
  level: number;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setKeys: (codes: string[]) => void;
  setSteer?: (v: number) => void;
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
