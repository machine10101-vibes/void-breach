import * as THREE from "three";
import type { AABB, EnemyKind } from "./types";

export type Materials = {
  concrete: THREE.MeshStandardMaterial;
  wall: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  armor: THREE.MeshStandardMaterial;
  visor: THREE.MeshStandardMaterial;
  shade: THREE.MeshStandardMaterial;
  shadeGlow: THREE.MeshStandardMaterial;
  ember: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  voidCore: THREE.MeshStandardMaterial;
};

export function makeMaterials(tex: {
  ground?: THREE.Texture;
  wall?: THREE.Texture;
  metal?: THREE.Texture;
}): Materials {
  const concrete = new THREE.MeshStandardMaterial({
    color: 0x8a847c,
    map: tex.ground ?? null,
    roughness: 0.92,
    metalness: 0.04,
  });
  const wall = new THREE.MeshStandardMaterial({
    color: 0x9a9388,
    map: tex.wall ?? null,
    roughness: 0.88,
    metalness: 0.06,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x6a655c,
    map: tex.metal ?? null,
    roughness: 0.45,
    metalness: 0.72,
  });
  return {
    concrete,
    wall,
    metal,
    dark: new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.55, metalness: 0.4 }),
    armor: new THREE.MeshStandardMaterial({ color: 0x2a2d33, roughness: 0.38, metalness: 0.55 }),
    visor: new THREE.MeshStandardMaterial({
      color: 0x3a1a08,
      emissive: 0xe85d04,
      emissiveIntensity: 2.4,
      roughness: 0.2,
      metalness: 0.1,
    }),
    shade: new THREE.MeshStandardMaterial({
      color: 0x0c0d12,
      roughness: 0.32,
      metalness: 0.55,
    }),
    shadeGlow: new THREE.MeshStandardMaterial({
      color: 0x041014,
      emissive: 0x2dd4bf,
      emissiveIntensity: 3.2,
      roughness: 0.25,
      metalness: 0.1,
    }),
    ember: new THREE.MeshStandardMaterial({
      color: 0x1a0c04,
      emissive: 0xe85d04,
      emissiveIntensity: 1.6,
      roughness: 0.4,
      metalness: 0.2,
    }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.95, metalness: 0.02 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x88ccee,
      roughness: 0.08,
      metalness: 0.1,
      transparent: true,
      opacity: 0.22,
    }),
    voidCore: new THREE.MeshStandardMaterial({
      color: 0x02040a,
      emissive: 0x22d3ee,
      emissiveIntensity: 4,
      roughness: 0.2,
      metalness: 0.0,
    }),
  };
}

export type PlayerRig = {
  group: THREE.Group;
  leftThigh: THREE.Object3D;
  rightThigh: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  gun: THREE.Object3D;
  visor: THREE.Mesh;
  torso: THREE.Object3D;
};

function box(
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  rx = 0,
  ry = 0,
  rz = 0,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function cyl(
  mat: THREE.Material,
  rTop: number,
  rBot: number,
  h: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  rx = 0,
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 8), mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

export function createExoSuit(mat: Materials): PlayerRig {
  const group = new THREE.Group();
  const armor = mat.armor;
  const dark = mat.dark;
  const metal = mat.metal;

  const hips = box(armor, 0.42, 0.18, 0.28, 0, 0.95, 0, group);
  const torso = new THREE.Group();
  torso.position.set(0, 1.18, 0);
  group.add(torso);
  box(armor, 0.52, 0.48, 0.32, 0, 0.1, 0, torso);
  box(metal, 0.36, 0.22, 0.08, 0, 0.14, 0.18, torso);
  box(mat.ember, 0.08, 0.04, 0.04, 0, 0.22, 0.22, torso);
  box(dark, 0.7, 0.12, 0.22, 0, 0.28, -0.02, torso);
  box(armor, 0.28, 0.38, 0.18, 0, 0.08, -0.2, torso);

  const head = new THREE.Group();
  head.position.set(0, 1.62, 0.02);
  group.add(head);
  box(armor, 0.28, 0.28, 0.3, 0, 0.08, 0, head);
  const visor = box(mat.visor, 0.22, 0.1, 0.04, 0, 0.08, 0.16, head);
  box(dark, 0.32, 0.06, 0.32, 0, 0.2, 0, head);

  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.38 * side, 1.42, 0);
    root.rotation.z = 0.22 * side;
    group.add(root);
    box(armor, 0.22, 0.14, 0.26, 0.04 * side, 0.02, 0, root);
    cyl(dark, 0.08, 0.07, 0.32, 0.06 * side, -0.2, 0, root);
    cyl(armor, 0.07, 0.06, 0.28, 0.06 * side, -0.48, 0.04, root);
    box(metal, 0.1, 0.1, 0.16, 0.06 * side, -0.64, 0.08, root);
    return root;
  };
  const leftArm = mkArm(-1);
  const rightArm = mkArm(1);

  const mkLeg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(0.14 * side, 0.88, 0);
    group.add(thigh);
    cyl(armor, 0.1, 0.09, 0.36, 0, -0.16, 0, thigh);
    const calf = cyl(dark, 0.08, 0.07, 0.34, 0, -0.48, 0, thigh);
    box(mat.rubber, 0.16, 0.1, 0.28, 0, -0.68, 0.04, thigh);
    box(metal, 0.18, 0.08, 0.12, 0, -0.22, 0.08, thigh);
    return { thigh, calf };
  };
  const left = mkLeg(-1);
  const right = mkLeg(1);

  const gun = createRifle(mat);
  gun.position.set(0.22, -0.52, 0.28);
  gun.rotation.set(-0.12, 0.12, 0.08);
  rightArm.add(gun);

  hips.visible = true;
  return {
    group,
    leftThigh: left.thigh,
    rightThigh: right.thigh,
    leftArm,
    rightArm,
    gun,
    visor,
    torso,
  };
}

export function createRifle(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.08, 0.1, 0.72, 0, 0, 0, g);
  box(mat.metal, 0.07, 0.07, 0.28, 0, 0.02, 0.38, g);
  box(mat.dark, 0.05, 0.16, 0.12, 0, -0.1, -0.08, g);
  box(mat.metal, 0.04, 0.04, 0.18, 0, -0.12, 0.16, g);
  box(mat.ember, 0.03, 0.03, 0.08, 0, 0.08, 0.1, g);
  // chainsaw bayonet
  box(mat.metal, 0.04, 0.14, 0.28, 0, -0.08, 0.52, g);
  for (let i = 0; i < 5; i++) {
    box(mat.dark, 0.02, 0.06, 0.04, 0, -0.16, 0.4 + i * 0.05, g, 0, 0, 0.5);
  }
  return g;
}

export function createShotgun(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.1, 0.12, 0.58, 0, 0, 0, g);
  box(mat.metal, 0.05, 0.05, 0.4, 0.04, 0.02, 0.12, g);
  box(mat.metal, 0.05, 0.05, 0.4, -0.04, 0.02, 0.12, g);
  box(mat.dark, 0.06, 0.16, 0.12, 0, -0.1, -0.16, g);
  return g;
}

export function createSmg(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.07, 0.09, 0.42, 0, 0, 0, g);
  box(mat.metal, 0.05, 0.05, 0.16, 0, 0.01, 0.24, g);
  box(mat.dark, 0.04, 0.18, 0.08, 0, -0.1, -0.04, g);
  return g;
}

export type EnemyRig = {
  group: THREE.Group;
  kind: EnemyKind;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  glow: THREE.Mesh[];
};

export function createShade(kind: EnemyKind, mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const scale = kind === "harbinger" ? 1.85 : kind === "brute" ? 1.35 : kind === "stalker" ? 1.05 : 1;
  const tall = kind === "harbinger" ? 2.6 : kind === "brute" ? 2.2 : 2.05;
  const glow: THREE.Mesh[] = [];

  const torsoW = kind === "brute" || kind === "harbinger" ? 0.62 : 0.32;
  box(mat.shade, torsoW, tall * 0.32, 0.28, 0, tall * 0.55, 0, group);
  const head = box(
    mat.shade,
    kind === "harbinger" ? 0.5 : 0.22,
    kind === "harbinger" ? 0.7 : 0.42,
    0.28,
    0,
    tall * 0.82,
    0.04,
    group,
  );
  const eye = box(mat.shadeGlow, 0.16, 0.06, 0.04, 0, tall * 0.84, 0.18, group);
  glow.push(eye);

  const crack = box(mat.shadeGlow, 0.03, tall * 0.28, 0.02, torsoW * 0.2, tall * 0.55, 0.15, group);
  glow.push(crack);

  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set((torsoW * 0.7 + 0.08) * side, tall * 0.68, 0);
    group.add(root);
    const len = kind === "husk" ? 0.9 : 0.75;
    cyl(mat.shade, 0.06, 0.05, len, 0.04 * side, -len * 0.35, 0, root);
    box(mat.shade, 0.1, 0.1, 0.18, 0.04 * side, -len * 0.75, 0.06, root);
    const claw = box(mat.shadeGlow, 0.04, 0.04, 0.16, 0.04 * side, -len * 0.75, 0.16, root);
    glow.push(claw);
    return root;
  };
  const leftArm = mkArm(-1);
  const rightArm = mkArm(1);

  if (kind === "harbinger") {
    const extra = mkArm(0);
    extra.position.set(0, tall * 0.5, -0.1);
    extra.rotation.z = 0.4;
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), mat.voidCore);
    core.position.set(0, tall * 0.55, 0.2);
    group.add(core);
    glow.push(core);
  }

  cyl(mat.shade, 0.09, 0.07, 0.7, -0.12, 0.4, 0, group);
  cyl(mat.shade, 0.09, 0.07, 0.7, 0.12, 0.4, 0, group);
  box(mat.shade, 0.16, 0.08, 0.3, -0.12, 0.06, 0.04, group);
  box(mat.shade, 0.16, 0.08, 0.3, 0.12, 0.06, 0.04, group);

  group.scale.setScalar(scale);
  head.castShadow = true;
  return { group, kind, leftArm, rightArm, glow };
}

export function createCar(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 2.2, 0.55, 1.05, 0, 0.45, 0, g);
  box(mat.dark, 1.1, 0.42, 0.95, -0.15, 0.88, 0, g);
  box(mat.glass, 0.7, 0.28, 0.9, 0.15, 0.9, 0, g);
  const wheel = (x: number, z: number) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 10), mat.rubber);
    m.rotation.z = Math.PI / 2;
    m.position.set(x, 0.28, z);
    g.add(m);
  };
  wheel(-0.7, 0.55);
  wheel(0.7, 0.55);
  wheel(-0.7, -0.55);
  wheel(0.7, -0.55);
  return g;
}

export function createLamp(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.metal, 0.06, 0.08, 3.2, 0, 1.6, 0, g);
  box(mat.dark, 0.5, 0.08, 0.18, 0.18, 3.15, 0, g);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat.ember);
  bulb.position.set(0.32, 3.0, 0);
  g.add(bulb);
  const light = new THREE.PointLight(0xe85d04, 1.4, 8, 2);
  light.position.copy(bulb.position);
  g.add(light);
  g.rotation.z = 0.12;
  return g;
}

export function createRubble(mat: Materials) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = 0.2 + Math.random() * 0.45;
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), mat.concrete);
    m.position.set((Math.random() - 0.5) * 1.2, s * 0.45, (Math.random() - 0.5) * 1.2);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

export function addWorldFromBoxes(
  scene: THREE.Scene,
  boxes: AABB[],
  mat: Materials,
) {
  const geoCache = new Map<string, THREE.BoxGeometry>();
  for (const b of boxes) {
    const w = b.maxx - b.minx;
    const h = b.maxy - b.miny;
    const d = b.maxz - b.minz;
    const key = `${w.toFixed(2)}:${h.toFixed(2)}:${d.toFixed(2)}`;
    let geo = geoCache.get(key);
    if (!geo) {
      geo = new THREE.BoxGeometry(w, h, d);
      geoCache.set(key, geo);
    }
    const m = new THREE.Mesh(
      geo,
      b.deco === "car" || b.deco === "pillar" ? mat.metal : b.cover ? mat.metal : mat.wall,
    );
    m.position.set((b.minx + b.maxx) / 2, (b.miny + b.maxy) / 2, (b.minz + b.maxz) / 2);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  }
}

export function createVoidGate(mat: Materials) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.18, 10, 28), mat.voidCore);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  const inner = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 24),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    }),
  );
  inner.rotation.y = Math.PI / 2;
  g.add(inner);
  box(mat.metal, 1.2, 4.2, 0.6, 0, 2.1, -2.6, g);
  box(mat.metal, 1.2, 4.2, 0.6, 0, 2.1, 2.6, g);
  return g;
}
