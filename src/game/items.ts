import type { AffixId, AmmoId, ArmorSlot, InvItem, Rarity, Recipe, SetId, WeaponId } from "./types";

export const INVENTORY_CAP = 32;

export const AMMO_META: Record<AmmoId, { name: string; pickup: number; color: number }> = {
  rifle: { name: "Rifle rounds", pickup: 32, color: 0xd6d3d1 },
  shell: { name: "12G shells", pickup: 8, color: 0xe85d04 },
  compact: { name: "Compact mags", pickup: 36, color: 0x60a5fa },
  heavy: { name: "Heavy belt", pickup: 48, color: 0xfb923c },
  cell: { name: "Void cells", pickup: 4, color: 0x5eead4 },
};

export const WEAPON_AMMO: Record<WeaponId, AmmoId> = {
  ar: "rifle",
  dmr: "rifle",
  shotgun: "shell",
  smg: "compact",
  cannon: "compact",
  lmg: "heavy",
  rail: "cell",
  gl: "cell",
  pulse: "cell",
  pike: "rifle",
};

const WEAPON_BASE: Record<
  WeaponId,
  { name: string; dmg: number; pellets: number; rpm: number; mag: number; reserve: number; spread: number; range: number; reload: number }
> = {
  ar: { name: "Vanguard ARX", dmg: 21, pellets: 1, rpm: 580, mag: 32, reserve: 160, spread: 0.016, range: 82, reload: 1.4 },
  shotgun: { name: "Spartan 12G", dmg: 12, pellets: 8, rpm: 78, mag: 6, reserve: 36, spread: 0.105, range: 17, reload: 1.85 },
  smg: { name: "Cinder SMG", dmg: 13, pellets: 1, rpm: 920, mag: 40, reserve: 200, spread: 0.038, range: 40, reload: 1.2 },
  dmr: { name: "Kestrel DMR", dmg: 48, pellets: 1, rpm: 210, mag: 12, reserve: 48, spread: 0.006, range: 124, reload: 1.85 },
  cannon: { name: "Judge .50", dmg: 64, pellets: 1, rpm: 88, mag: 6, reserve: 30, spread: 0.02, range: 38, reload: 1.55 },
  lmg: { name: "Ashfall SAW", dmg: 16, pellets: 1, rpm: 760, mag: 80, reserve: 240, spread: 0.044, range: 72, reload: 2.55 },
  rail: { name: "Null Lance", dmg: 96, pellets: 1, rpm: 46, mag: 4, reserve: 16, spread: 0.002, range: 146, reload: 2.15 },
  gl: { name: "Helios GL", dmg: 88, pellets: 1, rpm: 52, mag: 4, reserve: 12, spread: 0.028, range: 42, reload: 2.05 },
  pulse: { name: "Pulse Carbine", dmg: 28, pellets: 1, rpm: 640, mag: 24, reserve: 96, spread: 0.012, range: 78, reload: 1.55 },
  pike: { name: "Sever Pike", dmg: 54, pellets: 1, rpm: 130, mag: 8, reserve: 40, spread: 0.007, range: 52, reload: 1.75 },
};

export const AFFIXES: Record<AffixId, { name: string; kind: "weapon" | "armor"; line: string }> = {
  overpressure: { name: "Overpressure", kind: "weapon", line: "+12% damage" },
  tightbore: { name: "Tight bore", kind: "weapon", line: "−22% spread" },
  quickmag: { name: "Quick mag", kind: "weapon", line: "−18% reload" },
  extended: { name: "Extended", kind: "weapon", line: "+25% magazine" },
  longbarrel: { name: "Long barrel", kind: "weapon", line: "+18% range" },
  rapid: { name: "Rapid cycle", kind: "weapon", line: "+12% fire rate" },
  plating: { name: "Plating", kind: "armor", line: "+14 plate" },
  mesh: { name: "Mesh", kind: "armor", line: "+12 shield" },
  servo: { name: "Servos", kind: "armor", line: "+4% damage" },
};

export const KIT_SETS: Record<SetId, { name: string; slots: ArmorSlot[]; line: string }> = {
  ember: { name: "Ember Protocol", slots: ["helm", "arms"], line: "Overdrive lasts longer and hits harder" },
  rail: { name: "Rail Stride", slots: ["chest", "legs"], line: "Move faster on the street" },
  null: { name: "Null Mantle", slots: ["helm", "chest"], line: "Take less damage" },
};

const SET_PIECE_NAMES: Record<SetId, Partial<Record<ArmorSlot, string>>> = {
  ember: { helm: "Ember visor", arms: "Ember gauntlets" },
  rail: { chest: "Rail cuirass", legs: "Rail greaves" },
  null: { helm: "Null helm", chest: "Null mantle" },
};

const AFFIX_IDS = Object.keys(AFFIXES) as AffixId[];
const SET_IDS = Object.keys(KIT_SETS) as SetId[];

export function isAffixId(id: string): id is AffixId {
  return AFFIX_IDS.includes(id as AffixId);
}

export function isSetId(id: string): id is SetId {
  return SET_IDS.includes(id as SetId);
}

export function sanitizeItem(it: InvItem): InvItem {
  const affixes = Array.isArray(it.affixes) ? it.affixes.filter((id) => isAffixId(id)) : undefined;
  const setId = it.setId && isSetId(it.setId) ? it.setId : undefined;
  return { ...it, affixes: affixes?.length ? affixes : undefined, setId };
}

function rollAffixes(kind: "weapon" | "armor", rarity: Rarity): AffixId[] {
  const n = rarity === "common" ? 0 : rarity === "magic" ? 1 : 2;
  const bag = AFFIX_IDS.filter((id) => AFFIXES[id].kind === kind);
  const out: AffixId[] = [];
  for (let i = 0; i < n && bag.length; i++) {
    const idx = Math.floor(Math.random() * bag.length);
    out.push(bag.splice(idx, 1)[0]);
  }
  return out;
}

function rollSet(slot: ArmorSlot, rarity: Rarity): SetId | undefined {
  const options = SET_IDS.filter((id) => {
    if (!KIT_SETS[id].slots.includes(slot)) return false;
    if (id === "null") return rarity === "legendary";
    return rarity !== "common";
  });
  if (!options.length) return undefined;
  const chance = rarity === "legendary" ? 0.8 : rarity === "rare" ? 0.5 : 0.22;
  if (Math.random() > chance) return undefined;
  return options[Math.floor(Math.random() * options.length)];
}

export function affixNames(it: InvItem) {
  return (it.affixes ?? []).map((id) => AFFIXES[id]?.name).filter(Boolean);
}

export function newUid() {
  return `it-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function makeAmmo(ammoId: AmmoId, qty: number): InvItem {
  return {
    uid: newUid(),
    kind: "ammo",
    name: AMMO_META[ammoId].name,
    rarity: "common",
    ammoId,
    qty: Math.max(0, Math.floor(qty)),
  };
}

export function ammoCount(items: InvItem[], ammoId: AmmoId) {
  return items.filter((i) => i.kind === "ammo" && i.ammoId === ammoId).reduce((sum, i) => sum + (i.qty ?? 0), 0);
}

export function addAmmoToItems(items: InvItem[], ammoId: AmmoId, qty: number) {
  const add = Math.max(0, Math.floor(qty));
  if (!add) return items;
  const stack = items.find((i) => i.kind === "ammo" && i.ammoId === ammoId);
  if (stack) {
    stack.qty = (stack.qty ?? 0) + add;
    return items;
  }
  items.push(makeAmmo(ammoId, add));
  return items;
}

export function takeAmmoFromItems(items: InvItem[], ammoId: AmmoId, qty: number) {
  let need = Math.max(0, Math.floor(qty));
  let taken = 0;
  for (const stack of items) {
    if (need <= 0) break;
    if (stack.kind !== "ammo" || stack.ammoId !== ammoId) continue;
    const have = stack.qty ?? 0;
    const n = Math.min(have, need);
    stack.qty = have - n;
    taken += n;
    need -= n;
  }
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (it.kind === "ammo" && (it.qty ?? 0) <= 0) items.splice(i, 1);
  }
  return taken;
}

export function ensureAmmoPools(items: InvItem[]) {
  const seen = new Set<AmmoId>();
  for (const it of items) {
    if (it.kind !== "weapon" || !it.weaponId) continue;
    const ammoId = WEAPON_AMMO[it.weaponId];
    if (seen.has(ammoId)) continue;
    seen.add(ammoId);
    if (ammoCount(items, ammoId) > 0) continue;
    const seed = it.reserve && it.reserve > 0 ? it.reserve : WEAPON_BASE[it.weaponId].reserve;
    addAmmoToItems(items, ammoId, seed);
  }
  if (ammoCount(items, "rifle") <= 0) addAmmoToItems(items, "rifle", 160);
  return items;
}

const ISSUE_KIT: Record<ArmorSlot, { name: string; hpBonus: number; shieldBonus: number; dmgBonus?: number }> = {
  helm: { name: "Issue helm", hpBonus: 6, shieldBonus: 4 },
  chest: { name: "Issue plate", hpBonus: 12, shieldBonus: 8 },
  arms: { name: "Issue gauntlets", hpBonus: 4, shieldBonus: 2, dmgBonus: 2 },
  legs: { name: "Issue greaves", hpBonus: 6, shieldBonus: 6 },
};

export function starterLoadout(): { inventory: InvItem[]; equippedWeapon: string; equippedArmor: Record<ArmorSlot, string | null> } {
  const rifle = makeWeapon("ar", "Vanguard ARX", "common", WEAPON_BASE.ar);
  const helm = makeArmor("helm", ISSUE_KIT.helm.name, "common", ISSUE_KIT.helm);
  const chest = makeArmor("chest", ISSUE_KIT.chest.name, "common", ISSUE_KIT.chest);
  const arms = makeArmor("arms", ISSUE_KIT.arms.name, "common", ISSUE_KIT.arms);
  const legs = makeArmor("legs", ISSUE_KIT.legs.name, "common", ISSUE_KIT.legs);
  return {
    inventory: [rifle, helm, chest, arms, legs, makeAmmo("rifle", 160), makeAmmo("compact", 48), makeAmmo("shell", 12)],
    equippedWeapon: rifle.uid,
    equippedArmor: { helm: helm.uid, chest: chest.uid, arms: arms.uid, legs: legs.uid },
  };
}

export function ensureIssueKit(items: InvItem[], equipped: Record<ArmorSlot, string | null>) {
  const nextItems = items.slice();
  const nextEq = { ...equipped };
  for (const slot of Object.keys(ISSUE_KIT) as ArmorSlot[]) {
    const uid = nextEq[slot];
    if (uid && nextItems.some((i) => i.uid === uid && i.kind === "armor" && i.slot === slot)) continue;
    if (nextItems.some((i) => i.kind === "armor" && i.slot === slot)) continue;
    if (nextItems.length >= INVENTORY_CAP) continue;
    const spec = ISSUE_KIT[slot];
    const piece = makeArmor(slot, spec.name, "common", spec);
    nextItems.push(piece);
    nextEq[slot] = piece.uid;
  }
  return { inventory: nextItems, equippedArmor: nextEq };
}

export function makeWeapon(
  weaponId: WeaponId,
  name: string,
  rarity: Rarity,
  stats: Pick<InvItem, "dmg" | "pellets" | "rpm" | "mag" | "reserve" | "spread" | "range" | "reload">,
): InvItem {
  return {
    uid: newUid(),
    kind: "weapon",
    name,
    rarity,
    weaponId,
    ...stats,
    loaded: stats.mag,
  };
}

export function scrapValue(it: InvItem) {
  if (it.kind === "ammo") return Math.max(2, Math.floor((it.qty ?? 0) * 0.35));
  const base = it.kind === "weapon" ? 28 : 18;
  const rarity = it.rarity === "legendary" ? 3.2 : it.rarity === "rare" ? 2.1 : it.rarity === "magic" ? 1.45 : 1;
  const extras = (it.affixes?.length ?? 0) * 6 + (it.setId ? 14 : 0);
  return Math.round(base * rarity) + extras;
}

export function makeArmor(
  slot: ArmorSlot,
  name: string,
  rarity: Rarity,
  bonuses: Pick<InvItem, "hpBonus" | "shieldBonus" | "dmgBonus">,
): InvItem {
  return {
    uid: newUid(),
    kind: "armor",
    name,
    rarity,
    slot,
    hpBonus: bonuses.hpBonus ?? 0,
    shieldBonus: bonuses.shieldBonus ?? 0,
    dmgBonus: bonuses.dmgBonus ?? 0,
  };
}

export function rollLootWeapon(rarity: Rarity, tier = 1): InvItem {
  const pool: WeaponId[] = ["ar", "shotgun", "smg", "dmr", "cannon", "lmg", "rail", "gl", "pulse", "pike"];
  const id = pool[Math.floor(Math.random() * pool.length)];
  const prefix = rarity === "legendary" ? "Mythic " : rarity === "rare" ? "Rare " : rarity === "magic" ? "Tuned " : "";
  const mult = rarity === "legendary" ? 1.7 : rarity === "rare" ? 1.35 : rarity === "magic" ? 1.15 : 1;
  const tierBonus = 1 + Math.max(0, tier - 1) * 0.14;
  const base = WEAPON_BASE[id];
  const made = makeWeapon(id, prefix + base.name, rarity, {
    ...base,
    dmg: Math.round(base.dmg * mult * tierBonus),
  });
  const affixes = rollAffixes("weapon", rarity);
  if (affixes.length) made.affixes = affixes;
  return made;
}

export function rollLootAmmo(kindHint?: WeaponId): InvItem {
  const ammoId = kindHint ? WEAPON_AMMO[kindHint] : (Object.keys(AMMO_META) as AmmoId[])[Math.floor(Math.random() * 5)];
  const extra = Math.floor(AMMO_META[ammoId].pickup * (0.7 + Math.random() * 0.8));
  return makeAmmo(ammoId, extra);
}

export function rollLootArmor(rarity: Rarity, tier = 1): InvItem {
  const slots: ArmorSlot[] = ["helm", "chest", "arms", "legs"];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const names: Record<ArmorSlot, Record<Rarity, string>> = {
    helm: { common: "Salvaged helm", magic: "Sealed helm", rare: "Ember visor", legendary: "Void helm" },
    chest: { common: "Salvaged cuirass", magic: "Lined plate", rare: "Assault cuirass", legendary: "Null mantle" },
    arms: { common: "Salvaged gauntlets", magic: "Servo gauntlets", rare: "Hardened gauntlets", legendary: "Void gauntlets" },
    legs: { common: "Salvaged greaves", magic: "Strider greaves", rare: "Rail greaves", legendary: "Void greaves" },
  };
  const scale = rarity === "legendary" ? 3 : rarity === "rare" ? 2 : rarity === "magic" ? 1.4 : 1;
  const tierBonus = 1 + Math.max(0, tier - 1) * 0.16;
  const setId = rollSet(slot, rarity);
  const made = makeArmor(slot, setId ? (SET_PIECE_NAMES[setId][slot] ?? names[slot][rarity]) : names[slot][rarity], rarity, {
    hpBonus: Math.round((slot === "chest" ? 22 : 12) * scale * tierBonus),
    shieldBonus: Math.round((slot === "chest" ? 16 : 8) * scale * tierBonus),
    dmgBonus: slot === "arms" ? Math.round(6 * scale * tierBonus) : 0,
  });
  const affixes = rollAffixes("armor", rarity);
  if (affixes.length) made.affixes = affixes;
  if (setId) made.setId = setId;
  return made;
}

export const RECIPES: Recipe[] = [
  {
    id: "ar-tuned",
    name: "Tuned ARX",
    cost: 90,
    output: { kind: "weapon", rarity: "magic", weaponId: "ar", ...WEAPON_BASE.ar, name: "Tuned ARX", dmg: 26, rpm: 620, mag: 34, reserve: 170, spread: 0.014, range: 86, reload: 1.3, affixes: ["rapid"] },
  },
  {
    id: "dmr",
    name: "Kestrel DMR",
    cost: 150,
    output: { kind: "weapon", rarity: "rare", weaponId: "dmr", ...WEAPON_BASE.dmr, name: "Kestrel DMR", affixes: ["longbarrel", "tightbore"] },
  },
  {
    id: "cannon",
    name: "Judge .50",
    cost: 140,
    output: { kind: "weapon", rarity: "rare", weaponId: "cannon", ...WEAPON_BASE.cannon, name: "Judge .50", affixes: ["overpressure"] },
  },
  {
    id: "lmg",
    name: "Ashfall SAW",
    cost: 170,
    output: { kind: "weapon", rarity: "rare", weaponId: "lmg", ...WEAPON_BASE.lmg, name: "Ashfall SAW", affixes: ["extended", "rapid"] },
  },
  {
    id: "rail",
    name: "Null Lance",
    cost: 240,
    output: { kind: "weapon", rarity: "legendary", weaponId: "rail", ...WEAPON_BASE.rail, name: "Null Lance", affixes: ["overpressure", "longbarrel"] },
  },
  {
    id: "gl",
    name: "Helios GL",
    cost: 190,
    output: { kind: "weapon", rarity: "magic", weaponId: "gl", ...WEAPON_BASE.gl, name: "Helios GL", affixes: ["overpressure"] },
  },
  {
    id: "shotgun",
    name: "Spartan 12G",
    cost: 120,
    output: { kind: "weapon", rarity: "magic", weaponId: "shotgun", ...WEAPON_BASE.shotgun, name: "Spartan 12G", dmg: 14, rpm: 82, reserve: 40, spread: 0.1, range: 18, reload: 1.7, affixes: ["tightbore"] },
  },
  {
    id: "smg",
    name: "Cinder SMG",
    cost: 100,
    output: { kind: "weapon", rarity: "common", weaponId: "smg", ...WEAPON_BASE.smg, name: "Cinder SMG" },
  },
  {
    id: "pulse",
    name: "Pulse Carbine",
    cost: 180,
    output: { kind: "weapon", rarity: "rare", weaponId: "pulse", ...WEAPON_BASE.pulse, name: "Pulse Carbine", affixes: ["rapid", "tightbore"] },
  },
  {
    id: "pike",
    name: "Sever Pike",
    cost: 165,
    output: { kind: "weapon", rarity: "rare", weaponId: "pike", ...WEAPON_BASE.pike, name: "Sever Pike", affixes: ["tightbore"] },
  },
  {
    id: "helm-ember",
    name: "Ember visor",
    cost: 95,
    output: { kind: "armor", name: "Ember visor", rarity: "rare", slot: "helm", hpBonus: 22, shieldBonus: 16, dmgBonus: 4, setId: "ember", affixes: ["mesh"] },
  },
  {
    id: "legs-rail",
    name: "Rail greaves",
    cost: 100,
    output: { kind: "armor", name: "Rail greaves", rarity: "rare", slot: "legs", hpBonus: 20, shieldBonus: 22, dmgBonus: 0, setId: "rail", affixes: ["plating"] },
  },
  {
    id: "ammo-rifle",
    name: "Rifle crate",
    cost: 35,
    output: { kind: "ammo", name: "Rifle rounds", rarity: "common", ammoId: "rifle", qty: 64 },
  },
  {
    id: "ammo-cell",
    name: "Void cell pack",
    cost: 55,
    output: { kind: "ammo", name: "Void cells", rarity: "common", ammoId: "cell", qty: 8 },
  },
  {
    id: "ammo-shell",
    name: "12G crate",
    cost: 30,
    output: { kind: "ammo", name: "12G shells", rarity: "common", ammoId: "shell", qty: 16 },
  },
  {
    id: "ammo-compact",
    name: "Compact crate",
    cost: 32,
    output: { kind: "ammo", name: "Compact mags", rarity: "common", ammoId: "compact", qty: 72 },
  },
  {
    id: "ammo-heavy",
    name: "Belt crate",
    cost: 40,
    output: { kind: "ammo", name: "Heavy belt", rarity: "common", ammoId: "heavy", qty: 96 },
  },
  {
    id: "helm",
    name: "Sealed helm",
    cost: 70,
    output: { kind: "armor", name: "Sealed helm", rarity: "magic", slot: "helm", hpBonus: 18, shieldBonus: 10, dmgBonus: 0, affixes: ["mesh"] },
  },
  {
    id: "chest",
    name: "Assault cuirass",
    cost: 110,
    output: { kind: "armor", name: "Assault cuirass", rarity: "rare", slot: "chest", hpBonus: 36, shieldBonus: 24, dmgBonus: 0, affixes: ["plating", "mesh"] },
  },
  {
    id: "arms",
    name: "Servo gauntlets",
    cost: 85,
    output: { kind: "armor", name: "Servo gauntlets", rarity: "magic", slot: "arms", hpBonus: 8, shieldBonus: 6, dmgBonus: 10, affixes: ["servo"] },
  },
  {
    id: "legs",
    name: "Strider greaves",
    cost: 80,
    output: { kind: "armor", name: "Strider greaves", rarity: "magic", slot: "legs", hpBonus: 14, shieldBonus: 16, dmgBonus: 0, affixes: ["plating"] },
  },
  {
    id: "chest-null",
    name: "Null mantle",
    cost: 160,
    output: { kind: "armor", name: "Null mantle", rarity: "legendary", slot: "chest", hpBonus: 28, shieldBonus: 32, dmgBonus: 6, setId: "null", affixes: ["plating", "mesh"] },
  },
  {
    id: "arms-ember",
    name: "Ember gauntlets",
    cost: 90,
    output: { kind: "armor", name: "Ember gauntlets", rarity: "rare", slot: "arms", hpBonus: 16, shieldBonus: 10, dmgBonus: 8, setId: "ember", affixes: ["servo"] },
  },
  {
    id: "chest-rail",
    name: "Rail cuirass",
    cost: 120,
    output: { kind: "armor", name: "Rail cuirass", rarity: "rare", slot: "chest", hpBonus: 30, shieldBonus: 20, dmgBonus: 0, setId: "rail", affixes: ["mesh"] },
  },
  {
    id: "helm-null",
    name: "Null helm",
    cost: 170,
    output: { kind: "armor", name: "Null helm", rarity: "legendary", slot: "helm", hpBonus: 24, shieldBonus: 22, dmgBonus: 4, setId: "null", affixes: ["mesh", "plating"] },
  },
];

export function instantiateRecipe(recipe: Recipe): InvItem {
  const made = { uid: newUid(), ...recipe.output };
  if (made.kind === "ammo") made.qty = made.qty ?? AMMO_META[made.ammoId ?? "rifle"].pickup;
  return made;
}

function wornPiece(items: InvItem[], equipped: Record<ArmorSlot, string | null>, slot: ArmorSlot) {
  const uid = equipped[slot];
  return items.find((i) => i.uid === uid && i.kind === "armor") ?? null;
}

export function armorBonuses(items: InvItem[], equipped: Record<ArmorSlot, string | null>) {
  let hp = 0;
  let shield = 0;
  let dmg = 0;
  for (const slot of Object.keys(equipped) as ArmorSlot[]) {
    const it = wornPiece(items, equipped, slot);
    if (!it) continue;
    hp += it.hpBonus ?? 0;
    shield += it.shieldBonus ?? 0;
    dmg += it.dmgBonus ?? 0;
    for (const id of it.affixes ?? []) {
      if (id === "plating") hp += 14;
      if (id === "mesh") shield += 12;
      if (id === "servo") dmg += 4;
    }
  }
  return { hp, shield, dmg };
}

export type KitMods = {
  active: SetId[];
  progress: { id: SetId; name: string; have: number; need: number; line: string; on: boolean }[];
  overdriveSeconds: number;
  overdriveMult: number;
  speed: number;
  taken: number;
};

export function kitMods(items: InvItem[], equipped: Record<ArmorSlot, string | null>): KitMods {
  const progress = SET_IDS.map((id) => {
    const set = KIT_SETS[id];
    const have = set.slots.filter((slot) => wornPiece(items, equipped, slot)?.setId === id).length;
    return { id, name: set.name, have, need: set.slots.length, line: set.line, on: have >= set.slots.length };
  });
  const active = progress.filter((row) => row.on).map((row) => row.id);
  return {
    active,
    progress: progress.filter((row) => row.have > 0),
    overdriveSeconds: active.includes("ember") ? 8 : 6,
    overdriveMult: active.includes("ember") ? 1.46 : 1.28,
    speed: active.includes("rail") ? 1.1 : 1,
    taken: active.includes("null") ? 0.88 : 1,
  };
}

export function itemToWeapon(it: InvItem) {
  const id = it.weaponId ?? "ar";
  const base = WEAPON_BASE[id];
  let dmg = it.dmg ?? base.dmg;
  let rpm = it.rpm ?? base.rpm;
  let mag = it.mag ?? base.mag;
  let spread = it.spread ?? base.spread;
  let range = it.range ?? base.range;
  let reload = it.reload ?? base.reload;
  for (const affix of it.affixes ?? []) {
    if (affix === "overpressure") dmg *= 1.12;
    if (affix === "rapid") rpm *= 1.12;
    if (affix === "extended") mag *= 1.25;
    if (affix === "tightbore") spread *= 0.78;
    if (affix === "longbarrel") range *= 1.18;
    if (affix === "quickmag") reload *= 0.82;
  }
  return {
    id,
    name: it.name,
    rarity: it.rarity,
    dmg: Math.round(dmg),
    pellets: it.pellets ?? base.pellets,
    rpm: Math.round(rpm),
    mag: Math.max(1, Math.round(mag)),
    reserve: it.reserve ?? base.reserve,
    spread: Math.round(spread * 1000) / 1000,
    range: Math.round(range),
    reload: Math.round(reload * 100) / 100,
  };
}
