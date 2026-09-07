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
  asphalt: THREE.MeshStandardMaterial;
  rust: THREE.MeshStandardMaterial;
  neon: THREE.MeshStandardMaterial;
  warning: THREE.MeshStandardMaterial;
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
    armor: new THREE.MeshStandardMaterial({ color: 0x2c3038, roughness: 0.34, metalness: 0.62 }),
    visor: new THREE.MeshStandardMaterial({
      color: 0x3a1a08,
      emissive: 0xe85d04,
      emissiveIntensity: 2.6,
      roughness: 0.18,
      metalness: 0.12,
    }),
    shade: new THREE.MeshStandardMaterial({
      color: 0x0c0d12,
      roughness: 0.28,
      metalness: 0.62,
    }),
    shadeGlow: new THREE.MeshStandardMaterial({
      color: 0x041014,
      emissive: 0x2dd4bf,
      emissiveIntensity: 3.4,
      roughness: 0.22,
      metalness: 0.08,
    }),
    ember: new THREE.MeshStandardMaterial({
      color: 0x1a0c04,
      emissive: 0xe85d04,
      emissiveIntensity: 1.8,
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
      emissiveIntensity: 4.2,
      roughness: 0.18,
      metalness: 0.0,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      color: 0x3a3732,
      map: tex.ground ?? null,
      roughness: 0.96,
      metalness: 0.08,
    }),
    rust: new THREE.MeshStandardMaterial({
      color: 0x5a3a28,
      map: tex.metal ?? null,
      roughness: 0.7,
      metalness: 0.35,
    }),
    neon: new THREE.MeshStandardMaterial({
      color: 0x041014,
      emissive: 0x2dd4bf,
      emissiveIntensity: 2.4,
      roughness: 0.3,
      metalness: 0.1,
      toneMapped: false,
    }),
    warning: new THREE.MeshStandardMaterial({
      color: 0x2a1808,
      emissive: 0xe85d04,
      emissiveIntensity: 0.9,
      roughness: 0.6,
      metalness: 0.2,
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
  head: THREE.Object3D;
  backpack: THREE.Object3D;
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
  ry = 0,
  segs = 8,
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function cloneGlow(src: THREE.MeshStandardMaterial) {
  const m = src.clone();
  m.emissive = src.emissive.clone();
  return m;
}

export function createExoSuit(mat: Materials): PlayerRig {
  const group = new THREE.Group();
  const armor = mat.armor;
  const dark = mat.dark;
  const metal = mat.metal;

  box(armor, 0.44, 0.2, 0.3, 0, 0.95, 0, group);

  const torso = new THREE.Group();
  torso.position.set(0, 1.18, 0);
  group.add(torso);
  box(armor, 0.54, 0.5, 0.34, 0, 0.12, 0, torso);
  box(metal, 0.38, 0.24, 0.1, 0, 0.16, 0.2, torso);
  box(mat.ember, 0.1, 0.06, 0.05, 0, 0.24, 0.24, torso);
  box(dark, 0.22, 0.08, 0.06, 0, 0.06, 0.22, torso);
  box(dark, 0.74, 0.14, 0.24, 0, 0.32, -0.02, torso);
  box(armor, 0.3, 0.4, 0.2, 0, 0.08, -0.22, torso);
  // cables
  cyl(dark, 0.025, 0.025, 0.36, 0.16, 0.02, -0.18, torso, 0.7);
  cyl(dark, 0.025, 0.025, 0.36, -0.16, 0.02, -0.18, torso, 0.7);

  const backpack = new THREE.Group();
  backpack.position.set(0, 1.32, -0.28);
  group.add(backpack);
  box(dark, 0.32, 0.38, 0.16, 0, 0, 0, backpack);
  cyl(metal, 0.07, 0.07, 0.32, 0.12, 0.02, -0.02, backpack);
  cyl(metal, 0.07, 0.07, 0.32, -0.12, 0.02, -0.02, backpack);
  cyl(mat.ember, 0.03, 0.03, 0.08, 0, -0.16, 0.02, backpack);
  cyl(dark, 0.015, 0.015, 0.42, 0.1, 0.34, -0.02, backpack, 0.4);

  const head = new THREE.Group();
  head.position.set(0, 1.64, 0.04);
  group.add(head);
  box(armor, 0.3, 0.3, 0.32, 0, 0.08, 0, head);
  const visor = box(mat.visor, 0.24, 0.1, 0.05, 0, 0.08, 0.17, head);
  box(dark, 0.34, 0.07, 0.34, 0, 0.22, 0, head);
  box(metal, 0.08, 0.06, 0.1, 0.14, 0.16, 0.08, head);
  cyl(dark, 0.012, 0.012, 0.22, 0.12, 0.3, -0.04, head, 0.25);

  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.4 * side, 1.44, 0);
    root.rotation.z = 0.18 * side;
    group.add(root);
    box(armor, 0.24, 0.16, 0.28, 0.05 * side, 0.04, 0, root);
    cyl(dark, 0.085, 0.075, 0.34, 0.07 * side, -0.22, 0, root);
    cyl(armor, 0.075, 0.065, 0.3, 0.07 * side, -0.5, 0.05, root);
    box(metal, 0.12, 0.12, 0.18, 0.07 * side, -0.68, 0.1, root);
    box(mat.ember, 0.04, 0.04, 0.04, 0.07 * side, -0.62, 0.18, root);
    return root;
  };
  const leftArm = mkArm(-1);
  const rightArm = mkArm(1);

  const mkLeg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(0.15 * side, 0.88, 0);
    group.add(thigh);
    cyl(armor, 0.11, 0.095, 0.38, 0, -0.16, 0, thigh);
    box(metal, 0.16, 0.1, 0.14, 0, -0.22, 0.08, thigh);
    cyl(dark, 0.085, 0.075, 0.36, 0, -0.5, 0, thigh);
    box(armor, 0.14, 0.1, 0.12, 0, -0.42, 0.06, thigh);
    box(mat.rubber, 0.18, 0.1, 0.32, 0, -0.7, 0.05, thigh);
    return thigh;
  };

  const gun = createRifle(mat);
  gun.position.set(0.22, -0.52, 0.28);
  gun.rotation.set(-0.12, 0.12, 0.08);
  rightArm.add(gun);

  return {
    group,
    leftThigh: mkLeg(-1),
    rightThigh: mkLeg(1),
    leftArm,
    rightArm,
    gun,
    visor,
    torso,
    head,
    backpack,
  };
}

export function createRifle(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.08, 0.1, 0.76, 0, 0, 0, g);
  box(mat.metal, 0.07, 0.07, 0.3, 0, 0.02, 0.4, g);
  box(mat.dark, 0.05, 0.18, 0.12, 0, -0.12, -0.1, g);
  box(mat.metal, 0.045, 0.045, 0.2, 0, -0.12, 0.16, g);
  box(mat.ember, 0.035, 0.035, 0.1, 0, 0.08, 0.12, g);
  box(mat.dark, 0.04, 0.06, 0.16, 0, 0.08, -0.16, g);
  box(mat.metal, 0.045, 0.14, 0.3, 0, -0.08, 0.54, g);
  for (let i = 0; i < 6; i++) {
    box(mat.dark, 0.02, 0.07, 0.04, 0, -0.17, 0.42 + i * 0.05, g, 0, 0, 0.55);
  }
  box(mat.neon, 0.02, 0.02, 0.28, 0.04, 0.04, 0.1, g);
  return g;
}

export function createShotgun(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.11, 0.13, 0.6, 0, 0, 0, g);
  box(mat.metal, 0.05, 0.05, 0.44, 0.045, 0.025, 0.12, g);
  box(mat.metal, 0.05, 0.05, 0.44, -0.045, 0.025, 0.12, g);
  box(mat.dark, 0.07, 0.18, 0.14, 0, -0.12, -0.18, g);
  box(mat.ember, 0.04, 0.04, 0.08, 0, 0.1, 0.06, g);
  box(mat.rust, 0.12, 0.08, 0.16, 0, -0.04, -0.28, g);
  return g;
}

export function createSmg(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.07, 0.09, 0.44, 0, 0, 0, g);
  box(mat.metal, 0.055, 0.055, 0.18, 0, 0.015, 0.26, g);
  box(mat.dark, 0.045, 0.2, 0.09, 0, -0.12, -0.04, g);
  box(mat.neon, 0.02, 0.02, 0.16, 0, 0.06, 0.04, g);
  box(mat.dark, 0.04, 0.05, 0.12, 0, 0.06, -0.16, g);
  return g;
}

export type EnemyRig = {
  group: THREE.Group;
  kind: EnemyKind;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  glow: THREE.Mesh[];
  core?: THREE.Object3D;
  ring?: THREE.Object3D;
};

export function createShade(kind: EnemyKind, mat: Materials): EnemyRig {
  if (kind === "harbinger") return createHarbinger(mat);
  if (kind === "brute") return createBrute(mat);
  if (kind === "stalker") return createStalker(mat);
  return createHusk(mat);
}

function createHusk(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  box(mat.shade, 0.34, 0.55, 0.28, 0, 1.15, 0.04, group, 0.35);
  const eye = box(gMat, 0.18, 0.05, 0.04, 0, 1.42, 0.22, group);
  glow.push(eye);
  const crack = box(gMat, 0.03, 0.42, 0.02, 0.08, 1.12, 0.18, group);
  glow.push(crack);
  const mkArm = (side: number, extra = 0) => {
    const root = new THREE.Group();
    root.position.set(0.28 * side, 1.28, 0.06);
    root.rotation.z = 0.45 * side;
    group.add(root);
    cyl(mat.shade, 0.055, 0.04, 0.85 + extra, 0.05 * side, -0.38, 0.08, root);
    const claw = box(gMat, 0.04, 0.04, 0.22, 0.05 * side, -0.82, 0.18, root);
    glow.push(claw);
    return root;
  };
  cyl(mat.shade, 0.07, 0.05, 0.7, -0.1, 0.42, 0, group);
  cyl(mat.shade, 0.07, 0.05, 0.7, 0.1, 0.42, 0, group);
  box(mat.shade, 0.14, 0.07, 0.28, -0.1, 0.06, 0.04, group);
  box(mat.shade, 0.14, 0.07, 0.28, 0.1, 0.06, 0.04, group);
  return { group, kind: "husk", leftArm: mkArm(-1, 0.12), rightArm: mkArm(1), glow };
}

function createStalker(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  box(mat.shade, 0.28, 0.7, 0.24, 0, 1.35, 0, group);
  box(mat.shade, 0.2, 0.36, 0.26, 0, 1.82, 0.04, group);
  const eye = box(gMat, 0.16, 0.04, 0.04, 0, 1.86, 0.18, group);
  glow.push(eye);
  cyl(mat.shade, 0.012, 0.012, 0.4, 0.08, 2.08, -0.04, group, 0.3);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.24, 1.5, 0);
  group.add(leftArm);
  cyl(mat.shade, 0.05, 0.04, 0.7, -0.04, -0.28, 0.04, leftArm);
  const rightArm = new THREE.Group();
  rightArm.position.set(0.26, 1.48, 0.04);
  group.add(rightArm);
  cyl(mat.shade, 0.06, 0.07, 0.55, 0.04, -0.12, 0.22, rightArm, Math.PI / 2);
  const muzzle = box(gMat, 0.08, 0.08, 0.1, 0.04, -0.12, 0.54, rightArm);
  glow.push(muzzle);
  cyl(mat.shade, 0.06, 0.05, 0.85, -0.1, 0.5, 0, group);
  cyl(mat.shade, 0.06, 0.05, 0.85, 0.1, 0.5, 0, group);
  box(mat.shade, 0.14, 0.06, 0.32, -0.1, 0.08, 0.06, group);
  box(mat.shade, 0.14, 0.06, 0.32, 0.1, 0.08, 0.06, group);
  group.scale.setScalar(1.08);
  return { group, kind: "stalker", leftArm, rightArm, glow };
}

function createBrute(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  box(mat.shade, 0.78, 0.7, 0.42, 0, 1.35, 0, group);
  box(mat.metal, 0.7, 0.16, 0.48, 0, 1.62, 0.02, group);
  const furnace = box(gMat, 0.28, 0.22, 0.08, 0, 1.32, 0.24, group);
  glow.push(furnace);
  box(mat.shade, 0.42, 0.38, 0.36, 0, 1.9, 0.04, group);
  const eye = box(gMat, 0.22, 0.06, 0.05, 0, 1.92, 0.24, group);
  glow.push(eye);
  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.5 * side, 1.5, 0);
    root.rotation.z = 0.12 * side;
    group.add(root);
    box(mat.shade, 0.28, 0.28, 0.32, 0.08 * side, 0.02, 0, root);
    cyl(mat.shade, 0.12, 0.14, 0.7, 0.1 * side, -0.42, 0.06, root);
    const fist = box(gMat, 0.2, 0.2, 0.24, 0.1 * side, -0.82, 0.1, root);
    glow.push(fist);
    return root;
  };
  cyl(mat.shade, 0.14, 0.12, 0.7, -0.2, 0.5, 0, group);
  cyl(mat.shade, 0.14, 0.12, 0.7, 0.2, 0.5, 0, group);
  box(mat.shade, 0.24, 0.12, 0.36, -0.2, 0.1, 0.06, group);
  box(mat.shade, 0.24, 0.12, 0.36, 0.2, 0.1, 0.06, group);
  group.scale.setScalar(1.28);
  return { group, kind: "brute", leftArm: mkArm(-1), rightArm: mkArm(1), glow };
}

function createHarbinger(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  box(mat.shade, 0.7, 0.9, 0.4, 0, 1.7, 0, group);
  box(mat.shade, 0.48, 0.7, 0.38, 0, 2.5, 0.06, group);
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.32;
    box(mat.shade, 0.08, 0.42, 0.08, Math.sin(a) * 0.22, 2.95, Math.cos(a) * 0.08, group);
  }
  const eye = box(gMat, 0.28, 0.08, 0.06, 0, 2.55, 0.26, group);
  glow.push(eye);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), mat.voidCore.clone());
  core.position.set(0, 1.7, 0.28);
  group.add(core);
  glow.push(core);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.045, 8, 24),
    mat.voidCore.clone(),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 1.7, 0);
  group.add(ring);
  const mkArm = (side: number, y: number, zOff: number) => {
    const root = new THREE.Group();
    root.position.set(0.46 * side, y, zOff);
    group.add(root);
    cyl(mat.shade, 0.07, 0.05, 0.95, 0.08 * side, -0.4, 0.1, root);
    const claw = box(gMat, 0.06, 0.06, 0.22, 0.08 * side, -0.9, 0.22, root);
    glow.push(claw);
    return root;
  };
  for (let i = 0; i < 3; i++) {
    const t = (i / 3) * Math.PI * 2;
    const tend = cyl(mat.shade, 0.04, 0.01, 0.9, Math.cos(t) * 0.25, 0.85, Math.sin(t) * 0.25, group);
    tend.rotation.z = Math.cos(t) * 0.4;
  }
  group.scale.setScalar(1.7);
  return {
    group,
    kind: "harbinger",
    leftArm: mkArm(-1, 2.05, 0),
    rightArm: mkArm(1, 2.05, 0),
    glow,
    core,
    ring,
  };
}

export function createCar(mat: Materials) {
  const g = new THREE.Group();
  box(mat.rust, 2.3, 0.55, 1.08, 0, 0.46, 0, g);
  box(mat.dark, 1.15, 0.44, 0.98, -0.12, 0.9, 0, g);
  box(mat.glass, 0.72, 0.28, 0.92, 0.18, 0.92, 0, g);
  box(mat.warning, 0.08, 0.06, 1.05, 1.12, 0.5, 0, g);
  const wheel = (x: number, z: number, missing = false) => {
    if (missing) return;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 10), mat.rubber);
    m.rotation.z = Math.PI / 2;
    m.position.set(x, 0.28, z);
    g.add(m);
  };
  wheel(-0.72, 0.56);
  wheel(0.72, 0.56);
  wheel(-0.72, -0.56);
  wheel(0.72, -0.56, true);
  g.rotation.z = 0.06;
  g.rotation.y = 0.04;
  return g;
}

export function createLamp(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.metal, 0.06, 0.09, 3.3, 0, 1.65, 0, g);
  box(mat.dark, 0.55, 0.08, 0.2, 0.2, 3.22, 0, g);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), mat.ember);
  bulb.position.set(0.36, 3.05, 0);
  g.add(bulb);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 3.2, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xe85d04,
      transparent: true,
      opacity: 0.045,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  cone.position.set(0.36, 1.45, 0);
  cone.rotation.z = 0.12;
  g.add(cone);
  const light = new THREE.PointLight(0xe85d04, 1.8, 11, 1.8);
  light.position.copy(bulb.position);
  g.add(light);
  g.rotation.z = 0.1;
  return g;
}

export function createRubble(mat: Materials) {
  const g = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const s = 0.18 + Math.random() * 0.5;
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), i % 2 ? mat.concrete : mat.rust);
    m.position.set((Math.random() - 0.5) * 1.35, s * 0.42, (Math.random() - 0.5) * 1.35);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

export function createBarrel(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.rust, 0.28, 0.3, 0.85, 0, 0.42, 0, g, 0, 0, 10);
  cyl(mat.warning, 0.29, 0.29, 0.08, 0, 0.62, 0, g, 0, 0, 10);
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 6), mat.ember);
  fire.position.set(0, 1.02, 0);
  g.add(fire);
  const light = new THREE.PointLight(0xe85d04, 1.1, 6, 2);
  light.position.set(0, 1.05, 0);
  g.add(light);
  return g;
}

export function createCrate(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 0.7, 0.7, 0.7, 0, 0.35, 0, g);
  box(mat.dark, 0.74, 0.08, 0.74, 0, 0.7, 0, g);
  box(mat.warning, 0.72, 0.06, 0.06, 0, 0.35, 0.36, g);
  return g;
}

export function createBarricade(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 1.8, 0.12, 0.16, 0, 0.42, 0, g, 0, 0, 0.18);
  box(mat.metal, 1.8, 0.12, 0.16, 0, 0.72, 0, g, 0, 0, -0.12);
  cyl(mat.dark, 0.04, 0.04, 0.9, -0.7, 0.45, 0, g);
  cyl(mat.dark, 0.04, 0.04, 0.9, 0.7, 0.45, 0, g);
  return g;
}

export function createWreck(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 3.4, 0.7, 1.6, 0, 0.7, 0, g);
  box(mat.dark, 1.6, 0.9, 1.4, -0.4, 1.3, 0, g);
  box(mat.ember, 0.3, 0.2, 0.3, 1.2, 0.9, 0.4, g);
  box(mat.rust, 1.1, 0.2, 2.2, 0.6, 0.2, 0.8, g, 0.4, 0.2, 0.1);
  const light = new THREE.PointLight(0xe85d04, 1.4, 8, 2);
  light.position.set(1.2, 1.1, 0.4);
  g.add(light);
  g.rotation.y = 0.5;
  g.rotation.z = 0.12;
  return g;
}

export function addWorldFromBoxes(scene: THREE.Scene, boxes: AABB[], mat: Materials) {
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
    const use =
      b.deco === "car" || b.deco === "pillar"
        ? mat.metal
        : b.deco === "crate"
          ? mat.metal
          : b.cover
            ? mat.rust
            : mat.wall;
    const m = new THREE.Mesh(geo, use);
    m.position.set((b.minx + b.maxx) / 2, (b.miny + b.maxy) / 2, (b.minz + b.maxz) / 2);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  }
}

export function dressWorld(scene: THREE.Scene, mat: Materials) {
  const road = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 132), mat.asphalt);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, -48);
  road.receiveShadow = true;
  scene.add(road);

  const dashGeo = new THREE.PlaneGeometry(0.12, 1.4);
  dashGeo.rotateX(-Math.PI / 2);
  const dashes = new THREE.InstancedMesh(dashGeo, mat.warning, 42);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 42; i++) {
    dummy.position.set(0, 0.035, 10 - i * 3.1);
    dummy.updateMatrix();
    dashes.setMatrixAt(i, dummy.matrix);
  }
  scene.add(dashes);

  const winGeo = new THREE.PlaneGeometry(0.85, 1.25);
  const winMatA = new THREE.MeshStandardMaterial({
    color: 0x1a0c04,
    emissive: 0xe85d04,
    emissiveIntensity: 1.6,
    roughness: 1,
    toneMapped: false,
  });
  const winMatB = new THREE.MeshStandardMaterial({
    color: 0x041014,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.35,
    roughness: 1,
    toneMapped: false,
  });
  const spots: { x: number; y: number; z: number; ry: number }[] = [];
  const strips: [number, number, number, number][] = [
    [-8.02, 12, -44, Math.PI / 2],
    [8.02, 12, -44, -Math.PI / 2],
    [-8.02, -40, -62, Math.PI / 2],
    [8.02, -40, -62, -Math.PI / 2],
    [-13.05, -62, -86, Math.PI / 2],
    [13.05, -62, -86, -Math.PI / 2],
    [-16.02, -86, -110, Math.PI / 2],
    [16.02, -86, -110, -Math.PI / 2],
  ];
  for (const [x, z0, z1, ry] of strips) {
    for (let z = z0; z > z1; z -= 4.2) {
      spots.push({ x, y: 2.15, z, ry });
      if (Math.abs(z) % 8 > 3) spots.push({ x, y: 3.7, z: z - 1.1, ry });
    }
  }
  const meshA = new THREE.InstancedMesh(winGeo, winMatA, spots.length);
  const meshB = new THREE.InstancedMesh(winGeo, winMatB, spots.length);
  let ia = 0;
  let ib = 0;
  spots.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.ry, 0);
    dummy.updateMatrix();
    if (i % 5 === 0) {
      meshB.setMatrixAt(ib++, dummy.matrix);
    } else {
      meshA.setMatrixAt(ia++, dummy.matrix);
    }
  });
  meshA.count = ia;
  meshB.count = ib;
  scene.add(meshA);
  scene.add(meshB);

  const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, 6.5, 6);
  pipeGeo.rotateZ(Math.PI / 2);
  const pipes = new THREE.InstancedMesh(pipeGeo, mat.metal, 16);
  for (let i = 0; i < 16; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    dummy.position.set(side * 7.6, 4.6, -8 - i * 6.5);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    pipes.setMatrixAt(i, dummy.matrix);
  }
  scene.add(pipes);

  const crackGeo = new THREE.PlaneGeometry(0.18, 3.2);
  const cracks = new THREE.InstancedMesh(crackGeo, mat.neon, 14);
  for (let i = 0; i < 14; i++) {
    dummy.position.set((i % 2 === 0 ? -1 : 1) * (7.9 + (i % 3) * 0.1), 1.8, -6 - i * 7.5);
    dummy.rotation.set(0, i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2, 0.15);
    dummy.updateMatrix();
    cracks.setMatrixAt(i, dummy.matrix);
  }
  scene.add(cracks);
}

export function createPortalShader() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv - 0.5;
        float r = length(uv);
        float a = atan(uv.y, uv.x);
        float swirl = sin(r * 20.0 - uTime * 3.4 + a * 5.0);
        float ring = smoothstep(0.48, 0.32, r) * smoothstep(0.05, 0.18, r);
        float core = smoothstep(0.22, 0.0, r);
        vec3 col = mix(vec3(0.07, 0.92, 0.86), vec3(0.95, 0.38, 0.06), swirl * 0.5 + 0.5);
        float alpha = ring * (0.55 + 0.4 * swirl) + core * 0.7;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

export function createVoidGate(mat: Materials) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.16, 12, 36), mat.voidCore);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.07, 8, 28), mat.voidCore);
  ring2.rotation.y = Math.PI / 2;
  g.add(ring2);
  const portalMat = createPortalShader();
  const inner = new THREE.Mesh(new THREE.CircleGeometry(2.28, 32), portalMat);
  inner.rotation.y = Math.PI / 2;
  g.add(inner);
  box(mat.metal, 1.3, 4.4, 0.7, 0, 2.2, -2.7, g);
  box(mat.metal, 1.3, 4.4, 0.7, 0, 2.2, 2.7, g);
  box(mat.neon, 0.12, 3.6, 0.12, 0.4, 2.0, -2.7, g);
  box(mat.neon, 0.12, 3.6, 0.12, 0.4, 2.0, 2.7, g);
  g.userData.portalMat = portalMat;
  g.userData.ring2 = ring2;
  return g;
}

export function createSpawnRift(mat: Materials) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 8, 20), mat.voidCore);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.62, 16),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  g.add(disc);
  return g;
}

export function createGrenade(mat: Materials) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat.metal);
  g.add(body);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat.ember);
  g.add(core);
  return g;
}

export function createBolt() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, toneMapped: false }),
  );
  g.add(core);
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.4, 6),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.7,
      toneMapped: false,
    }),
  );
  tail.rotation.x = Math.PI / 2;
  tail.position.z = 0.18;
  g.add(tail);
  return g;
}

export function createMuzzleFlash() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffc58a,
    transparent: true,
    opacity: 0.95,
    toneMapped: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const a = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), mat);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), mat);
  b.rotation.y = Math.PI / 2;
  g.add(a);
  g.add(b);
  g.visible = false;
  return g;
}

export function createBeam() {
  const geo = new THREE.CylinderGeometry(0.07, 0.12, 1, 8);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x5eead4,
    transparent: true,
    opacity: 0.85,
    toneMapped: false,
    depthWrite: false,
  });
  const m = new THREE.Mesh(geo, mat);
  m.visible = false;
  return m;
}

export function createSlash() {
  const geo = new THREE.TorusGeometry(1.6, 0.05, 6, 18, Math.PI * 0.7);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xe85d04,
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const m = new THREE.Mesh(geo, mat);
  m.visible = false;
  return m;
}
