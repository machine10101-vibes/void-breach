import type { AABB, LevelTheme, MissionId, Spawner } from "./types";

function box(
  x: number,
  z: number,
  w: number,
  d: number,
  h: number,
  y = 0,
  cover = false,
  deco?: AABB["deco"],
): AABB {
  return {
    minx: x - w / 2,
    maxx: x + w / 2,
    minz: z - d / 2,
    maxz: z + d / 2,
    miny: y,
    maxy: y + h,
    cover,
    deco,
  };
}

export type LevelDef = {
  id: MissionId;
  name: string;
  theme: LevelTheme;
  fog: number;
  sky: number;
  bossName: string;
  objective: string;
  spawn: { x: number; y: number; z: number };
  boxes: AABB[];
  spawners: Spawner[];
  lamps: [number, number][];
  rubble: [number, number][];
  cars: [number, number, number][];
  barrels: [number, number][];
  crates: [number, number][];
  wreck: { x: number; z: number };
  gate: { x: number; z: number };
  cache: { x: number; z: number };
};

function buildAshfall(): LevelDef {
  const boxes: AABB[] = [];
  const add = (...b: AABB[]) => boxes.push(...b);

  add(
    box(-22, 10, 8, 14, 7),
    box(-24, -8, 10, 16, 10),
    box(-21, -28, 7, 14, 8),
    box(22, 9, 8, 16, 8),
    box(23.5, -10, 9, 18, 6),
    box(21, -30, 7, 14, 9),
    box(0, 28, 52, 6, 8),
    box(-12, 18, 10, 8, 5),
    box(13, 17, 9, 8, 6),
  );
  add(
    box(-4.5, 4, 2.4, 0.7, 0.9, 0, true, "cover"),
    box(5.2, 2.5, 2.6, 0.8, 0.9, 0, true, "cover"),
    box(-1.8, 6.2, 1.2, 2.2, 0.55, 0, true, "cover"),
    box(1.6, 5.4, 1.1, 2.0, 0.55, 0, true, "cover"),
    box(0.2, -2, 3.2, 1.1, 0.85, 0, true, "car"),
    box(-8, -4, 1.4, 1.4, 1.2, 0, true, "crate"),
    box(8.5, -5, 1.4, 1.4, 1.2, 0, true, "crate"),
    box(-6.2, 8, 1.5, 1.5, 1.1, 0, true, "crate"),
    box(6.8, 7.2, 1.3, 1.3, 1.0, 0, true, "crate"),
  );
  add(box(-12, -22, 7, 18, 8), box(12.5, -24, 8, 20, 6), box(-11, -40, 6, 14, 9), box(11, -42, 6, 16, 7));
  for (const z of [-12, -18, -24, -32, -38]) {
    add(box(-3.2, z, 2.2, 0.7, 0.88, 0, true, "cover"));
    add(box(3.4, z - 2, 2.4, 0.8, 0.88, 0, true, "cover"));
  }
  add(
    box(-1.2, -16, 3.4, 1.3, 1.0, 0, true, "car"),
    box(2.0, -27, 3.2, 1.2, 1.0, 0, true, "car"),
    box(-2.6, -35, 1.5, 1.5, 1.3, 0, true, "crate"),
    box(4.2, -21, 1.4, 1.4, 1.1, 0, true, "crate"),
  );
  add(
    box(-12, -52, 8, 22, 8),
    box(12, -52, 8, 22, 8),
    box(-4.5, -48, 1.2, 1.2, 4.2, 0, false, "pillar"),
    box(4.5, -48, 1.2, 1.2, 4.2, 0, false, "pillar"),
    box(-4.5, -58, 1.2, 1.2, 4.2, 0, false, "pillar"),
    box(4.5, -58, 1.2, 1.2, 4.2, 0, false, "pillar"),
    box(0, -53, 10, 4, 0.5, 3.6, false, "cover"),
    box(-3, -50, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(3.2, -56, 2.6, 0.8, 0.9, 0, true, "cover"),
    box(0, -54, 3.2, 1.2, 0.95, 0, true, "car"),
  );
  add(
    box(-18, -74, 10, 28, 8),
    box(18, -74, 10, 28, 8),
    box(-6, -68, 2.8, 0.8, 0.9, 0, true, "cover"),
    box(6, -70, 2.8, 0.8, 0.9, 0, true, "cover"),
    box(0, -76, 3.4, 1.3, 1.0, 0, true, "car"),
    box(-5, -80, 1.6, 1.6, 1.4, 0, true, "crate"),
    box(5.4, -80, 1.6, 1.6, 1.4, 0, true, "crate"),
    box(-3.5, -72, 1.5, 1.5, 1.2, 0, true, "crate"),
  );
  add(
    box(-20, -98, 8, 28, 9),
    box(20, -98, 8, 28, 9),
    box(0, -112, 48, 6, 9),
    box(-8, -92, 2.6, 0.9, 0.95, 0, true, "cover"),
    box(8, -92, 2.6, 0.9, 0.95, 0, true, "cover"),
    box(-6, -102, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(6, -102, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(0, -96, 1.8, 1.8, 1.6, 0, true, "crate"),
    box(-10, -104, 2.2, 0.8, 0.9, 0, true, "cover"),
    box(10, -104, 2.2, 0.8, 0.9, 0, true, "cover"),
  );

  return {
    id: "ashfall",
    name: "Ashfall Gate",
    theme: "ash",
    fog: 0x2a1c12,
    sky: 0x1a120c,
    bossName: "Void Harbinger",
    objective: "Advance to the Void Gate",
    spawn: { x: 0, y: 0, z: 8 },
    boxes,
    spawners: [
      {
        id: "plaza",
        zTrigger: 7,
        message: "Shade contact — plaza",
        enemies: [
          { kind: "husk", x: -5, z: -6 },
          { kind: "husk", x: 6, z: -7 },
          { kind: "husk", x: 0, z: -9 },
          { kind: "husk", x: -3, z: -11 },
        ],
      },
      {
        id: "street",
        zTrigger: -14,
        message: "Boulevard ambush",
        enemies: [
          { kind: "husk", x: -3, z: -22 },
          { kind: "husk", x: 3.5, z: -24 },
          { kind: "stalker", x: -2, z: -30 },
          { kind: "stalker", x: 3, z: -33 },
          { kind: "husk", x: 0, z: -28 },
          { kind: "husk", x: 2, z: -36 },
        ],
      },
      {
        id: "overpass",
        zTrigger: -42,
        message: "Hold the overpass",
        enemies: [
          { kind: "stalker", x: -3, z: -50 },
          { kind: "stalker", x: 3, z: -52 },
          { kind: "husk", x: 0, z: -48 },
          { kind: "brute", x: 0, z: -58 },
          { kind: "husk", x: -2.5, z: -56 },
          { kind: "husk", x: 2.8, z: -55 },
        ],
      },
      {
        id: "atrium",
        zTrigger: -64,
        message: "Atrium — heavy units",
        enemies: [
          { kind: "brute", x: -4, z: -74 },
          { kind: "brute", x: 5, z: -76 },
          { kind: "husk", x: -2, z: -70 },
          { kind: "husk", x: 2, z: -80 },
          { kind: "stalker", x: 0, z: -78 },
          { kind: "stalker", x: -5, z: -82 },
        ],
      },
      {
        id: "gate",
        zTrigger: -86,
        message: "Void Gate — kill the Harbinger",
        enemies: [
          { kind: "harbinger", x: 0, z: -102 },
          { kind: "husk", x: -6, z: -98 },
          { kind: "husk", x: 6, z: -98 },
          { kind: "stalker", x: -4, z: -104 },
          { kind: "stalker", x: 4, z: -104 },
          { kind: "brute", x: 0, z: -96 },
        ],
      },
    ],
    lamps: [
      [-9, 6],
      [9, 4],
      [-9, -2],
      [9, -10],
      [-8, -26],
      [8, -40],
      [-8, -54],
      [8, -72],
      [-10, -92],
      [10, -92],
    ],
    rubble: [
      [-6, 6],
      [7, 5],
      [-7.2, 9],
      [6.4, 8],
      [-5, -14],
      [4.5, -20],
      [-4, -36],
      [5, -46],
      [-6, -66],
      [6, -84],
      [-7, -100],
      [3, -8],
      [-4.5, -62],
    ],
    cars: [
      [0.2, -2, 0.4],
      [-1.2, -16, -0.3],
      [2.0, -27, 1.2],
      [0, -54, 0.2],
      [0, -76, -0.6],
      [-5.8, 3.2, 1.4],
      [5.6, -38, -1.1],
      [-5.4, -70, 0.6],
    ],
    barrels: [
      [-7.2, 3],
      [7.4, -12],
      [-6.8, -29],
      [6.5, -47],
      [-7, -69],
      [7.2, -90],
    ],
    crates: [
      [-8, -4],
      [8.5, -5],
      [-2.6, -35],
      [4.2, -21],
      [-5, -80],
      [5.4, -80],
    ],
    wreck: { x: -8.2, z: 10 },
    gate: { x: 0, z: -108 },
    cache: { x: 7.4, z: -18 },
  };
}

function buildEmberRail(): LevelDef {
  const boxes: AABB[] = [];
  const add = (...b: AABB[]) => boxes.push(...b);

  add(
    box(-16, 8, 6, 16, 6),
    box(-17.5, -12, 7, 18, 8),
    box(-15, -32, 5, 14, 6),
    box(16, 7, 6, 14, 7),
    box(17, -14, 7, 16, 5),
    box(15.5, -34, 5, 16, 8),
    box(0, 22, 40, 6, 7),
  );
  add(
    box(-3.4, 2, 1.8, 4.6, 1.1, 0, true, "cover"),
    box(3.6, 0.4, 1.8, 4.2, 1.1, 0, true, "cover"),
    box(0, -6, 2.4, 1.1, 0.9, 0, true, "crate"),
    box(-6.2, -8, 1.4, 1.4, 1.2, 0, true, "crate"),
    box(6.4, -10, 1.4, 1.4, 1.2, 0, true, "crate"),
  );
  add(box(-9.5, -32, 5, 28, 6), box(9.5, -32, 5, 28, 6));
  for (const z of [-16, -22, -28, -36]) {
    add(box(-2.6, z, 1.6, 2.8, 0.95, 0, true, "cover"));
    add(box(2.8, z - 1.4, 1.6, 2.4, 0.95, 0, true, "cover"));
  }
  add(box(0, -24, 3.0, 1.2, 1.0, 0, true, "car"), box(-4.2, -30, 1.5, 1.5, 1.2, 0, true, "crate"));
  add(
    box(-13, -56, 8, 20, 7),
    box(13, -56, 8, 20, 7),
    box(-3.8, -52, 1.1, 1.1, 4.4, 0, false, "pillar"),
    box(3.8, -52, 1.1, 1.1, 4.4, 0, false, "pillar"),
    box(-3.8, -62, 1.1, 1.1, 4.4, 0, false, "pillar"),
    box(3.8, -62, 1.1, 1.1, 4.4, 0, false, "pillar"),
    box(0, -58, 8, 3.2, 0.45, 3.4, false, "cover"),
    box(-2.6, -54, 2.2, 0.7, 0.88, 0, true, "cover"),
    box(2.8, -60, 2.2, 0.7, 0.88, 0, true, "cover"),
  );
  add(
    box(-15, -78, 9, 24, 7),
    box(15, -78, 9, 24, 7),
    box(-5, -72, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(5, -76, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(0, -80, 3.2, 1.2, 1.0, 0, true, "car"),
    box(-4.6, -84, 1.5, 1.5, 1.3, 0, true, "crate"),
    box(4.8, -84, 1.5, 1.5, 1.3, 0, true, "crate"),
  );
  add(
    box(-17, -102, 8, 26, 8),
    box(17, -102, 8, 26, 8),
    box(0, -116, 42, 6, 8),
    box(-6, -96, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(6, -96, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(-5, -106, 2.2, 0.8, 0.9, 0, true, "cover"),
    box(5, -106, 2.2, 0.8, 0.9, 0, true, "cover"),
  );

  return {
    id: "ember",
    name: "Ember Rail",
    theme: "rail",
    fog: 0x1c1410,
    sky: 0x120e0c,
    bossName: "Rail Warden",
    objective: "Clear the metro spine",
    spawn: { x: 0, y: 0, z: 6 },
    boxes,
    spawners: [
      {
        id: "platform",
        zTrigger: 5,
        message: "Ember Rail — platform contact",
        enemies: [
          { kind: "husk", x: -4, z: -4 },
          { kind: "husk", x: 4, z: -5 },
          { kind: "spitter", x: 0, z: -8 },
          { kind: "wraith", x: -2, z: -10 },
        ],
      },
      {
        id: "tunnel",
        zTrigger: -14,
        message: "Tunnel spitters",
        enemies: [
          { kind: "spitter", x: -3, z: -20 },
          { kind: "spitter", x: 3, z: -24 },
          { kind: "husk", x: 0, z: -22 },
          { kind: "wraith", x: 2, z: -28 },
          { kind: "husk", x: -2, z: -32 },
        ],
      },
      {
        id: "switch",
        zTrigger: -44,
        message: "Switch yard — hold the gantry",
        enemies: [
          { kind: "brute", x: 0, z: -56 },
          { kind: "spitter", x: -4, z: -50 },
          { kind: "spitter", x: 4, z: -52 },
          { kind: "wraith", x: -2, z: -60 },
          { kind: "husk", x: 2.5, z: -58 },
        ],
      },
      {
        id: "terminus",
        zTrigger: -70,
        message: "Terminus — Rail Warden",
        enemies: [
          { kind: "harbinger", x: 0, z: -104 },
          { kind: "spitter", x: -5, z: -98 },
          { kind: "spitter", x: 5, z: -98 },
          { kind: "wraith", x: -3, z: -108 },
          { kind: "wraith", x: 3, z: -108 },
          { kind: "brute", x: 0, z: -96 },
        ],
      },
    ],
    lamps: [
      [-7, 0],
      [7, -12],
      [-6, -28],
      [6, -48],
      [-7, -72],
      [7, -96],
    ],
    rubble: [
      [-4, 4],
      [5, -8],
      [-3, -26],
      [4, -44],
      [-5, -70],
      [5, -90],
    ],
    cars: [
      [0, -24, 0.2],
      [0, -80, -0.4],
    ],
    barrels: [
      [-5.5, 1],
      [5.6, -18],
      [-5, -50],
      [5.2, -88],
    ],
    crates: [
      [0, -6],
      [-6.2, -8],
      [6.4, -10],
      [-4.6, -84],
      [4.8, -84],
    ],
    wreck: { x: 6.4, z: 5 },
    gate: { x: 0, z: -112 },
    cache: { x: -5.2, z: -30 },
  };
}

function buildNullSpire(): LevelDef {
  const boxes: AABB[] = [];
  const add = (...b: AABB[]) => boxes.push(...b);

  add(
    box(-20, 8, 8, 16, 10),
    box(-21.5, -12, 9, 18, 8),
    box(-19, -28, 7, 14, 11),
    box(20, 7, 8, 14, 9),
    box(21, -14, 9, 16, 7),
    box(19.5, -30, 7, 16, 10),
    box(0, 24, 48, 6, 9),
  );
  add(
    box(-5, 6, 2.6, 0.8, 0.9, 0, true, "cover"),
    box(5.4, 4, 2.6, 0.8, 0.9, 0, true, "cover"),
    box(0, 0, 1.6, 1.6, 3.8, 0, false, "pillar"),
    box(-7, -2, 1.4, 1.4, 1.2, 0, true, "crate"),
    box(7.2, -4, 1.4, 1.4, 1.2, 0, true, "crate"),
  );
  add(box(-12, -26, 7, 28, 8), box(12, -26, 7, 28, 8));
  for (const z of [-10, -18, -26, -34]) {
    add(box(-3.6, z, 2.0, 0.7, 0.9, 0, true, "cover"));
    add(box(3.8, z - 2, 2.0, 0.7, 0.9, 0, true, "cover"));
    add(box(z % 20 === -10 ? -5.5 : 5.5, z - 1, 1.1, 1.1, 4.6, 0, false, "pillar"));
  }
  add(
    box(-14, -54, 8, 22, 8),
    box(14, -54, 8, 22, 8),
    box(-4, -50, 1.2, 1.2, 5.2, 0, false, "pillar"),
    box(4, -50, 1.2, 1.2, 5.2, 0, false, "pillar"),
    box(-4, -62, 1.2, 1.2, 5.2, 0, false, "pillar"),
    box(4, -62, 1.2, 1.2, 5.2, 0, false, "pillar"),
    box(0, -56, 9, 3.4, 0.5, 4.0, false, "cover"),
    box(-3, -52, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(3.2, -60, 2.4, 0.8, 0.9, 0, true, "cover"),
  );
  add(
    box(-18, -80, 10, 26, 9),
    box(18, -80, 10, 26, 9),
    box(-6, -74, 2.6, 0.8, 0.9, 0, true, "cover"),
    box(6, -78, 2.6, 0.8, 0.9, 0, true, "cover"),
    box(0, -82, 3.2, 1.2, 1.0, 0, true, "car"),
    box(-5, -86, 1.6, 1.6, 1.4, 0, true, "crate"),
    box(5.2, -86, 1.6, 1.6, 1.4, 0, true, "crate"),
  );
  add(
    box(-20, -104, 8, 26, 9),
    box(20, -104, 8, 26, 9),
    box(0, -118, 48, 6, 9),
    box(-7, -98, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(7, -98, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(-6, -108, 2.2, 0.8, 0.9, 0, true, "cover"),
    box(6, -108, 2.2, 0.8, 0.9, 0, true, "cover"),
  );

  return {
    id: "spire",
    name: "Null Spire",
    theme: "spire",
    fog: 0x12161c,
    sky: 0x0c1016,
    bossName: "Null Sovereign",
    objective: "Seal the broadcast nest",
    spawn: { x: 0, y: 0, z: 8 },
    boxes,
    spawners: [
      {
        id: "forecourt",
        zTrigger: 7,
        message: "Spire forecourt — wraiths",
        enemies: [
          { kind: "wraith", x: -5, z: -5 },
          { kind: "wraith", x: 5, z: -6 },
          { kind: "husk", x: 0, z: -8 },
          { kind: "spitter", x: 2, z: -12 },
        ],
      },
      {
        id: "hall",
        zTrigger: -12,
        message: "Broadcast hall",
        enemies: [
          { kind: "wraith", x: -3, z: -20 },
          { kind: "wraith", x: 3, z: -24 },
          { kind: "spitter", x: 0, z: -28 },
          { kind: "brute", x: 0, z: -34 },
          { kind: "husk", x: -2, z: -30 },
        ],
      },
      {
        id: "core",
        zTrigger: -46,
        message: "Tower core — heavies",
        enemies: [
          { kind: "brute", x: -4, z: -54 },
          { kind: "brute", x: 4, z: -58 },
          { kind: "wraith", x: 0, z: -52 },
          { kind: "spitter", x: -3, z: -62 },
          { kind: "spitter", x: 3, z: -62 },
        ],
      },
      {
        id: "crown",
        zTrigger: -88,
        message: "Crown — Null Sovereign",
        enemies: [
          { kind: "harbinger", x: 0, z: -106 },
          { kind: "wraith", x: -6, z: -100 },
          { kind: "wraith", x: 6, z: -100 },
          { kind: "spitter", x: -4, z: -110 },
          { kind: "spitter", x: 4, z: -110 },
          { kind: "brute", x: 0, z: -98 },
        ],
      },
    ],
    lamps: [
      [-8, 4],
      [8, -8],
      [-8, -28],
      [8, -50],
      [-8, -76],
      [8, -100],
    ],
    rubble: [
      [-5, 8],
      [6, 2],
      [-4, -16],
      [5, -38],
      [-6, -70],
      [6, -92],
    ],
    cars: [[0, -82, 0.5]],
    barrels: [
      [-6, 3],
      [6.4, -14],
      [-6, -48],
      [6, -90],
    ],
    crates: [
      [-7, -2],
      [7.2, -4],
      [-5, -86],
      [5.2, -86],
    ],
    wreck: { x: 7.2, z: 8 },
    gate: { x: 0, z: -114 },
    cache: { x: 6.2, z: -20 },
  };
}

export function buildMission(id: MissionId = "ashfall"): LevelDef {
  if (id === "ember") return buildEmberRail();
  if (id === "spire") return buildNullSpire();
  return buildAshfall();
}

export function buildLevel() {
  return buildAshfall();
}
