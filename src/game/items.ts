import type { ArmorSlot, InvItem, Rarity, Recipe, WeaponId } from "./types";

export const INVENTORY_CAP = 24;

export function newUid() {
  return `it-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export function starterLoadout(): { inventory: InvItem[]; equippedWeapon: string; equippedArmor: Record<ArmorSlot, string | null> } {
  const rifle = makeWeapon("ar", "Vanguard ARX", "common", {
    dmg: 21,
    pellets: 1,
    rpm: 580,
    mag: 32,
    reserve: 160,
    spread: 0.016,
    range: 82,
    reload: 1.4,
  });
  const chest = makeArmor("chest", "Issue plate", "common", { hpBonus: 12, shieldBonus: 8 });
  return {
    inventory: [rifle, chest],
    equippedWeapon: rifle.uid,
    equippedArmor: { helm: null, chest: chest.uid, arms: null, legs: null },
  };
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
  };
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

export function rollLootWeapon(rarity: Rarity): InvItem {
  const pool: { id: WeaponId; name: string }[] = [
    { id: "ar", name: "ARX-Void" },
    { id: "shotgun", name: "Spartan Edge" },
    { id: "smg", name: "Cinder Coil" },
  ];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const prefix = rarity === "legendary" ? "Mythic " : rarity === "rare" ? "Rare " : rarity === "magic" ? "Tuned " : "";
  const mult = rarity === "legendary" ? 1.7 : rarity === "rare" ? 1.35 : rarity === "magic" ? 1.15 : 1;
  const base =
    pick.id === "shotgun"
      ? { dmg: 12, pellets: 8, rpm: 78, mag: 6, reserve: 36, spread: 0.105, range: 17, reload: 1.85 }
      : pick.id === "smg"
        ? { dmg: 13, pellets: 1, rpm: 920, mag: 40, reserve: 200, spread: 0.038, range: 40, reload: 1.2 }
        : { dmg: 21, pellets: 1, rpm: 580, mag: 32, reserve: 160, spread: 0.016, range: 82, reload: 1.4 };
  return makeWeapon(pick.id, prefix + pick.name, rarity, {
    ...base,
    dmg: Math.round(base.dmg * mult),
  });
}

export function rollLootArmor(rarity: Rarity): InvItem {
  const slots: ArmorSlot[] = ["helm", "chest", "arms", "legs"];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const names: Record<ArmorSlot, string> = {
    helm: "Helm",
    chest: "Cuirass",
    arms: "Gauntlets",
    legs: "Greaves",
  };
  const prefix = rarity === "legendary" ? "Void " : rarity === "rare" ? "Hardened " : rarity === "magic" ? "Lined " : "Salvaged ";
  const scale = rarity === "legendary" ? 3 : rarity === "rare" ? 2 : rarity === "magic" ? 1.4 : 1;
  return makeArmor(slot, prefix + names[slot], rarity, {
    hpBonus: Math.round((slot === "chest" ? 22 : 12) * scale),
    shieldBonus: Math.round((slot === "chest" ? 16 : 8) * scale),
    dmgBonus: slot === "arms" ? Math.round(6 * scale) : 0,
  });
}

export const RECIPES: Recipe[] = [
  {
    id: "ar-tuned",
    name: "Tuned ARX",
    cost: 90,
    output: {
      kind: "weapon",
      name: "Tuned ARX",
      rarity: "magic",
      weaponId: "ar",
      dmg: 26,
      pellets: 1,
      rpm: 620,
      mag: 34,
      reserve: 170,
      spread: 0.014,
      range: 86,
      reload: 1.3,
    },
  },
  {
    id: "shotgun",
    name: "Spartan 12G",
    cost: 120,
    output: {
      kind: "weapon",
      name: "Spartan 12G",
      rarity: "magic",
      weaponId: "shotgun",
      dmg: 14,
      pellets: 8,
      rpm: 82,
      mag: 6,
      reserve: 40,
      spread: 0.1,
      range: 18,
      reload: 1.7,
    },
  },
  {
    id: "smg",
    name: "Cinder SMG",
    cost: 100,
    output: {
      kind: "weapon",
      name: "Cinder SMG",
      rarity: "common",
      weaponId: "smg",
      dmg: 13,
      pellets: 1,
      rpm: 920,
      mag: 40,
      reserve: 200,
      spread: 0.038,
      range: 40,
      reload: 1.2,
    },
  },
  {
    id: "mythic-ar",
    name: "Mythic ARX-Void",
    cost: 280,
    output: {
      kind: "weapon",
      name: "Mythic ARX-Void",
      rarity: "legendary",
      weaponId: "ar",
      dmg: 38,
      pellets: 1,
      rpm: 660,
      mag: 36,
      reserve: 200,
      spread: 0.01,
      range: 94,
      reload: 1.15,
    },
  },
  {
    id: "helm",
    name: "Sealed helm",
    cost: 70,
    output: { kind: "armor", name: "Sealed helm", rarity: "magic", slot: "helm", hpBonus: 18, shieldBonus: 10, dmgBonus: 0 },
  },
  {
    id: "chest",
    name: "Assault cuirass",
    cost: 110,
    output: { kind: "armor", name: "Assault cuirass", rarity: "rare", slot: "chest", hpBonus: 36, shieldBonus: 24, dmgBonus: 0 },
  },
  {
    id: "arms",
    name: "Servo gauntlets",
    cost: 85,
    output: { kind: "armor", name: "Servo gauntlets", rarity: "magic", slot: "arms", hpBonus: 8, shieldBonus: 6, dmgBonus: 10 },
  },
  {
    id: "legs",
    name: "Strider greaves",
    cost: 80,
    output: { kind: "armor", name: "Strider greaves", rarity: "magic", slot: "legs", hpBonus: 14, shieldBonus: 16, dmgBonus: 0 },
  },
];

export function instantiateRecipe(recipe: Recipe): InvItem {
  return { uid: newUid(), ...recipe.output };
}

export function armorBonuses(items: InvItem[], equipped: Record<ArmorSlot, string | null>) {
  let hp = 0;
  let shield = 0;
  let dmg = 0;
  for (const slot of Object.keys(equipped) as ArmorSlot[]) {
    const uid = equipped[slot];
    const it = items.find((i) => i.uid === uid);
    if (!it) continue;
    hp += it.hpBonus ?? 0;
    shield += it.shieldBonus ?? 0;
    dmg += it.dmgBonus ?? 0;
  }
  return { hp, shield, dmg };
}

export function itemToWeapon(it: InvItem) {
  return {
    id: it.weaponId ?? "ar",
    name: it.name,
    rarity: it.rarity,
    dmg: it.dmg ?? 21,
    pellets: it.pellets ?? 1,
    rpm: it.rpm ?? 580,
    mag: it.mag ?? 32,
    reserve: it.reserve ?? 160,
    spread: it.spread ?? 0.016,
    range: it.range ?? 82,
    reload: it.reload ?? 1.4,
  };
}
