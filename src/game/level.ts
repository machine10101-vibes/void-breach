import type { AABB, Spawner } from "./types";

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

export function buildLevel() {
  const boxes: AABB[] = [];
  const add = (...b: AABB[]) => boxes.push(...b);

  // Outer canyon walls — plaza
  add(
    box(-22, -8, 8, 44, 8),
    box(22, -8, 8, 44, 8),
    box(0, 16, 52, 6, 8),
  );

  // Plaza cover
  add(
    box(-4.5, 4, 2.4, 0.7, 0.9, 0, true, "cover"),
    box(5.2, 2.5, 2.6, 0.8, 0.9, 0, true, "cover"),
    box(0.2, -2, 3.2, 1.1, 0.85, 0, true, "car"),
    box(-8, -4, 1.4, 1.4, 1.2, 0, true, "crate"),
    box(8.5, -5, 1.4, 1.4, 1.2, 0, true, "crate"),
  );

  // Boulevard walls
  add(
    box(-11, -28, 6, 36, 7),
    box(11, -28, 6, 36, 7),
  );
  // Street cover
  for (const z of [-12, -18, -24, -32, -38]) {
    add(box(z % 20 < -20 ? -3.4 : -3.2, z, 2.2, 0.7, 0.88, 0, true, "cover"));
    add(box(3.4, z - 2, 2.4, 0.8, 0.88, 0, true, "cover"));
  }
  add(
    box(-1.2, -16, 3.4, 1.3, 1.0, 0, true, "car"),
    box(2.0, -27, 3.2, 1.2, 1.0, 0, true, "car"),
    box(-2.6, -35, 1.5, 1.5, 1.3, 0, true, "crate"),
  );

  // Overpass / choke
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

  // Atrium
  add(
    box(-18, -74, 10, 28, 8),
    box(18, -74, 10, 28, 8),
    box(-6, -68, 2.8, 0.8, 0.9, 0, true, "cover"),
    box(6, -70, 2.8, 0.8, 0.9, 0, true, "cover"),
    box(0, -76, 3.4, 1.3, 1.0, 0, true, "car"),
    box(-5, -80, 1.6, 1.6, 1.4, 0, true, "crate"),
    box(5.4, -80, 1.6, 1.6, 1.4, 0, true, "crate"),
  );

  // Arena ring
  add(
    box(-20, -98, 8, 28, 9),
    box(20, -98, 8, 28, 9),
    box(0, -112, 48, 6, 9),
    box(-8, -92, 2.6, 0.9, 0.95, 0, true, "cover"),
    box(8, -92, 2.6, 0.9, 0.95, 0, true, "cover"),
    box(-6, -102, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(6, -102, 2.4, 0.8, 0.9, 0, true, "cover"),
    box(0, -96, 1.8, 1.8, 1.6, 0, true, "crate"),
  );

  const spawners: Spawner[] = [
    {
      id: "plaza",
      zTrigger: 2,
      message: "Shade contact — plaza",
      enemies: [
        { kind: "husk", x: -5, z: -6 },
        { kind: "husk", x: 6, z: -7 },
        { kind: "husk", x: 0, z: -9 },
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
      ],
    },
  ];

  return {
    name: "Ashfall Gate",
    spawn: { x: 0, y: 0, z: 8 },
    boxes,
    spawners,
    lamps: [
      [-9, -2],
      [9, -10],
      [-8, -26],
      [8, -40],
      [-8, -54],
      [8, -72],
      [-10, -92],
      [10, -92],
    ] as [number, number][],
    rubble: [
      [-6, 6],
      [7, 5],
      [-5, -14],
      [4.5, -20],
      [-4, -36],
      [5, -46],
      [-6, -66],
      [6, -84],
      [-7, -100],
    ] as [number, number][],
    cars: [
      [0.2, -2, 0.4],
      [-1.2, -16, -0.3],
      [2.0, -27, 1.2],
      [0, -54, 0.2],
      [0, -76, -0.6],
    ] as [number, number, number][],
    gate: { x: 0, z: -108 },
  };
}
