import * as THREE from "three";
import { bindPbr } from "./textures";
import type { AABB, ArmorSlot, EnemyKind, InvItem, Rarity } from "./types";

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
  bone: THREE.MeshStandardMaterial;
};

export function makeMaterials(tex: {
  ground?: THREE.Texture;
  wall?: THREE.Texture;
  metal?: THREE.Texture;
  armor?: THREE.Texture;
  shade?: THREE.Texture;
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
    roughness: 0.42,
    metalness: 0.78,
  });
  const armor = new THREE.MeshStandardMaterial({
    color: 0xf0ebe4,
    map: tex.armor ?? null,
    roughness: 0.36,
    metalness: 0.62,
  });
  const shade = new THREE.MeshStandardMaterial({
    color: 0x1a1c22,
    map: tex.shade ?? null,
    roughness: 0.32,
    metalness: 0.55,
    emissive: 0x06332f,
    emissiveIntensity: 0.35,
  });
  bindPbr(concrete, tex.ground, { repeat: 1 });
  bindPbr(wall, tex.wall, { repeat: 1 });
  bindPbr(metal, tex.metal, { metal: true, repeat: 1 });
  bindPbr(armor, tex.armor, { metal: true, repeat: 1.4 });
  bindPbr(shade, tex.shade, { glow: true, repeat: 1.2 });
  return {
    concrete,
    wall,
    metal,
    armor,
    shade,
    dark: new THREE.MeshStandardMaterial({
      color: 0x1a1d24,
      roughness: 0.42,
      metalness: 0.58,
      envMapIntensity: 0.95,
    }),
    visor: new THREE.MeshStandardMaterial({
      color: 0x2a1006,
      emissive: 0xff7a1a,
      emissiveIntensity: 4.2,
      roughness: 0.08,
      metalness: 0.18,
      envMapIntensity: 1.4,
      toneMapped: false,
    }),
    shadeGlow: new THREE.MeshStandardMaterial({
      color: 0x041014,
      emissive: 0x2dd4bf,
      emissiveIntensity: 4.2,
      roughness: 0.16,
      metalness: 0.05,
      toneMapped: false,
    }),
    ember: new THREE.MeshStandardMaterial({
      color: 0x1a0c04,
      emissive: 0xe85d04,
      emissiveIntensity: 2.2,
      roughness: 0.35,
      metalness: 0.18,
      toneMapped: false,
    }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.96, metalness: 0.02 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0x6aa8c4,
      roughness: 0.04,
      metalness: 0.12,
      transparent: true,
      opacity: 0.34,
      envMapIntensity: 1.6,
    }),
    voidCore: new THREE.MeshStandardMaterial({
      color: 0x02040a,
      emissive: 0x22d3ee,
      emissiveIntensity: 5.2,
      roughness: 0.14,
      metalness: 0.0,
      toneMapped: false,
    }),
    asphalt: new THREE.MeshStandardMaterial({
      color: 0x3a3732,
      map: tex.ground ?? null,
      roughness: 0.96,
      metalness: 0.08,
    }),
    rust: new THREE.MeshStandardMaterial({
      color: 0x6a4030,
      map: tex.metal ?? null,
      roughness: 0.68,
      metalness: 0.4,
    }),
    neon: new THREE.MeshStandardMaterial({
      color: 0x041014,
      emissive: 0x2dd4bf,
      emissiveIntensity: 2.8,
      roughness: 0.28,
      metalness: 0.1,
      toneMapped: false,
    }),
    warning: new THREE.MeshStandardMaterial({
      color: 0x2a1808,
      emissive: 0xe85d04,
      emissiveIntensity: 1.1,
      roughness: 0.55,
      metalness: 0.22,
    }),
    bone: new THREE.MeshStandardMaterial({ color: 0xb7aea2, roughness: 0.62, metalness: 0.08 }),
  };
}

export type PlayerRig = {
  group: THREE.Group;
  leftThigh: THREE.Object3D;
  rightThigh: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  gunGrip: THREE.Object3D;
  gun: THREE.Object3D;
  visor: THREE.Mesh;
  torso: THREE.Object3D;
  head: THREE.Object3D;
  backpack: THREE.Object3D;
  kits: THREE.Group;
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
  segs = 10,
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

function cap(
  mat: THREE.Material,
  r: number,
  len: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  rx = 0,
  ry = 0,
) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function barrel(
  mat: THREE.Material,
  r: number,
  len: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
) {
  return cyl(mat, r, r * 0.92, len, x, y, z, parent, Math.PI / 2, 0, 12);
}

function sph(
  mat: THREE.Material,
  r: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  segs = 10,
) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, segs, segs), mat);
  m.position.set(x, y, z);
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

  const loc = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.54, 32),
    new THREE.MeshBasicMaterial({
      color: 0xe85d04,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  loc.rotation.x = -Math.PI / 2;
  loc.position.y = 0.03;
  group.add(loc);
  const locInner = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  locInner.rotation.x = -Math.PI / 2;
  locInner.position.y = 0.035;
  group.add(locInner);

  box(armor, 0.54, 0.2, 0.34, 0, 0.96, 0.02, group);
  box(dark, 0.24, 0.1, 0.18, 0, 0.96, 0.18, group);
  box(metal, 0.16, 0.08, 0.2, 0.2, 0.9, 0.12, group);
  box(metal, 0.16, 0.08, 0.2, -0.2, 0.9, 0.12, group);

  const torso = new THREE.Group();
  torso.position.set(0, 1.2, 0);
  group.add(torso);
  cap(dark, 0.15, 0.26, 0, 0.06, -0.02, torso);
  box(armor, 0.62, 0.46, 0.4, 0, 0.16, 0.03, torso);
  box(armor, 0.68, 0.18, 0.44, 0, 0.38, 0.01, torso);
  box(metal, 0.48, 0.22, 0.14, 0, 0.18, 0.22, torso);
  box(mat.ember, 0.14, 0.06, 0.05, 0, 0.28, 0.28, torso);
  box(dark, 0.22, 0.08, 0.06, 0, 0.08, 0.24, torso);
  box(armor, 0.22, 0.2, 0.12, 0.22, 0.22, 0.22, torso);
  box(armor, 0.22, 0.2, 0.12, -0.22, 0.22, 0.22, torso);
  box(armor, 0.4, 0.5, 0.24, 0, 0.12, -0.2, torso);
  cyl(dark, 0.02, 0.02, 0.36, 0.18, 0.02, -0.18, torso, 0.75);
  cyl(dark, 0.02, 0.02, 0.36, -0.18, 0.02, -0.18, torso, 0.75);
  box(mat.warning, 0.09, 0.03, 0.2, 0.2, 0.4, 0.1, torso);
  box(mat.warning, 0.09, 0.03, 0.2, -0.2, 0.4, 0.1, torso);
  box(metal, 0.08, 0.28, 0.08, 0.3, 0.14, -0.08, torso);
  box(metal, 0.08, 0.28, 0.08, -0.3, 0.14, -0.08, torso);

  const backpack = new THREE.Group();
  backpack.position.set(0, 1.36, -0.32);
  group.add(backpack);
  box(dark, 0.4, 0.46, 0.2, 0, 0, 0, backpack);
  cyl(metal, 0.08, 0.08, 0.4, 0.13, 0.02, -0.02, backpack);
  cyl(metal, 0.08, 0.08, 0.4, -0.13, 0.02, -0.02, backpack);
  cyl(mat.ember, 0.038, 0.03, 0.12, 0, -0.2, 0.02, backpack);
  cyl(dark, 0.014, 0.014, 0.5, 0.1, 0.38, -0.02, backpack, 0.42);
  box(armor, 0.16, 0.12, 0.12, 0, 0.2, 0.1, backpack);
  box(mat.neon, 0.04, 0.18, 0.03, 0.18, 0.08, 0.1, backpack);

  const head = new THREE.Group();
  head.position.set(0, 1.66, 0.04);
  group.add(head);
  sph(armor, 0.19, 0, 0.12, 0, head, 14);
  box(armor, 0.32, 0.18, 0.3, 0, 0.08, 0.04, head);
  box(dark, 0.34, 0.07, 0.32, 0, 0.22, 0.01, head);
  box(armor, 0.3, 0.08, 0.18, 0, 0.2, -0.1, head);
  const visor = box(mat.visor, 0.24, 0.048, 0.055, 0, 0.11, 0.18, head);
  box(metal, 0.28, 0.025, 0.04, 0, 0.15, 0.19, head);
  box(metal, 0.28, 0.025, 0.04, 0, 0.07, 0.19, head);
  box(metal, 0.08, 0.06, 0.12, 0.15, 0.17, 0.06, head);
  cyl(dark, 0.012, 0.012, 0.22, 0.12, 0.3, -0.04, head, 0.28);
  sph(mat.ember, 0.018, 0.16, 0.17, 0.1, head, 8);
  box(dark, 0.08, 0.1, 0.08, 0, 0.08, -0.16, head);

  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.44 * side, 1.48, 0);
    root.rotation.z = 0.14 * side;
    group.add(root);
    box(armor, 0.28, 0.2, 0.32, 0.05 * side, 0.05, 0, root);
    sph(armor, 0.11, 0.05 * side, 0.02, 0, root, 10);
    cap(dark, 0.075, 0.24, 0.07 * side, -0.24, 0.02, root);
    cap(armor, 0.07, 0.22, 0.07 * side, -0.52, 0.05, root);
    box(metal, 0.15, 0.12, 0.22, 0.07 * side, -0.7, 0.1, root);
    box(mat.ember, 0.04, 0.035, 0.04, 0.07 * side, -0.64, 0.22, root);
    return root;
  };
  const leftArm = mkArm(-1);
  const rightArm = mkArm(1);
  rightArm.rotation.x = -0.88;
  rightArm.rotation.y = -0.06;
  leftArm.rotation.x = -0.7;
  leftArm.rotation.z = 0.32;

  const gunGrip = new THREE.Group();
  gunGrip.position.set(0.05, -0.68, 0.14);
  gunGrip.rotation.set(0.86, 0.04, -0.02);
  rightArm.add(gunGrip);

  const mkLeg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(0.17 * side, 0.9, 0);
    group.add(thigh);
    cap(armor, 0.11, 0.28, 0, -0.16, 0.02, thigh);
    box(metal, 0.2, 0.11, 0.18, 0, -0.2, 0.1, thigh);
    cap(dark, 0.08, 0.26, 0, -0.52, 0.02, thigh);
    box(armor, 0.18, 0.12, 0.16, 0, -0.44, 0.09, thigh);
    box(mat.rubber, 0.22, 0.1, 0.36, 0, -0.74, 0.07, thigh);
    box(armor, 0.16, 0.06, 0.12, 0, -0.66, 0.16, thigh);
    return thigh;
  };

  const gun = createRifle(mat);
  mountGunInRightHand(gun);
  gunGrip.add(gun);

  const kits = new THREE.Group();
  group.add(kits);

  return {
    group,
    leftThigh: mkLeg(-1),
    rightThigh: mkLeg(1),
    leftArm,
    rightArm,
    gunGrip,
    gun,
    visor,
    torso,
    head,
    backpack,
    kits,
  };
}

export function mountGunInRightHand(gun: THREE.Object3D) {
  gun.position.set(0.01, 0.01, 0.26);
  gun.rotation.set(0.04, 0.02, 0.01);
}

export function createRifle(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.07, 0.09, 0.42, 0, 0.01, -0.02, g);
  barrel(mat.metal, 0.022, 0.46, 0, 0.025, 0.38, g);
  barrel(mat.dark, 0.028, 0.1, 0, 0.025, 0.62, g);
  box(mat.dark, 0.05, 0.18, 0.11, 0, -0.12, -0.1, g);
  box(mat.metal, 0.04, 0.04, 0.2, 0, -0.12, 0.12, g);
  box(mat.ember, 0.03, 0.03, 0.1, 0, 0.075, 0.08, g);
  box(mat.dark, 0.045, 0.07, 0.2, 0, 0.08, -0.18, g);
  box(mat.metal, 0.05, 0.14, 0.18, 0, -0.06, 0.22, g);
  box(mat.armor, 0.16, 0.045, 0.36, 0, -0.08, 0.16, g);
  box(mat.neon, 0.014, 0.014, 0.26, 0.032, 0.05, 0.06, g);
  sph(mat.ember, 0.016, 0, 0.08, 0.24, g, 8);
  box(mat.dark, 0.08, 0.04, 0.12, 0, 0.07, -0.02, g);
  return g;
}

export function createShotgun(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.1, 0.11, 0.36, 0, 0.01, -0.04, g);
  barrel(mat.metal, 0.02, 0.42, 0.03, 0.03, 0.28, g);
  barrel(mat.metal, 0.02, 0.42, -0.03, 0.03, 0.28, g);
  box(mat.dark, 0.07, 0.18, 0.12, 0, -0.12, -0.14, g);
  box(mat.ember, 0.035, 0.035, 0.08, 0, 0.09, 0.04, g);
  box(mat.rust, 0.12, 0.08, 0.16, 0, -0.02, -0.26, g);
  box(mat.armor, 0.13, 0.045, 0.18, 0, 0.07, -0.06, g);
  return g;
}

export function createSmg(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.065, 0.08, 0.28, 0, 0.01, 0, g);
  barrel(mat.metal, 0.018, 0.22, 0, 0.02, 0.24, g);
  box(mat.dark, 0.045, 0.18, 0.08, 0, -0.11, -0.02, g);
  box(mat.neon, 0.016, 0.016, 0.16, 0, 0.055, 0.04, g);
  box(mat.dark, 0.038, 0.045, 0.12, 0, 0.055, -0.14, g);
  box(mat.ember, 0.022, 0.022, 0.05, 0, 0.065, 0.14, g);
  box(mat.metal, 0.05, 0.12, 0.08, 0, -0.08, 0.08, g);
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
  cap(mat.shade, 0.15, 0.44, 0, 1.16, 0.03, group);
  box(mat.shade, 0.32, 0.52, 0.26, 0, 1.2, 0.05, group, 0.32);
  sph(mat.shade, 0.17, 0, 1.6, 0.08, group, 12);
  box(mat.shade, 0.2, 0.14, 0.16, 0, 1.62, 0.1, group, 0.2);
  const eye = box(gMat, 0.18, 0.035, 0.05, 0, 1.6, 0.22, group);
  glow.push(eye);
  const crack = box(gMat, 0.022, 0.5, 0.02, 0.08, 1.18, 0.17, group);
  glow.push(crack);
  const rib = box(gMat, 0.2, 0.018, 0.02, 0, 1.06, 0.16, group);
  glow.push(rib);
  const mkArm = (side: number, extra = 0) => {
    const root = new THREE.Group();
    root.position.set(0.27 * side, 1.36, 0.04);
    root.rotation.z = 0.5 * side;
    group.add(root);
    cap(mat.shade, 0.048, 0.64 + extra, 0.04 * side, -0.36, 0.06, root);
    const claw = box(gMat, 0.032, 0.032, 0.26, 0.04 * side, -0.8, 0.17, root);
    glow.push(claw);
    box(mat.shade, 0.028, 0.028, 0.16, 0.02 * side, -0.84, 0.24, root, 0.4);
    box(gMat, 0.02, 0.02, 0.12, 0.06 * side, -0.86, 0.2, root, -0.3);
    return root;
  };
  cap(mat.shade, 0.058, 0.5, -0.1, 0.48, 0.02, group);
  cap(mat.shade, 0.058, 0.5, 0.1, 0.48, 0.02, group);
  box(mat.shade, 0.13, 0.06, 0.28, -0.1, 0.08, 0.05, group);
  box(mat.shade, 0.13, 0.06, 0.28, 0.1, 0.08, 0.05, group);
  return { group, kind: "husk", leftArm: mkArm(-1, 0.1), rightArm: mkArm(1), glow };
}

function createStalker(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  cap(mat.shade, 0.11, 0.52, 0, 1.32, 0, group);
  box(mat.shade, 0.26, 0.62, 0.22, 0, 1.38, 0, group);
  sph(mat.shade, 0.14, 0, 1.86, 0.04, group, 10);
  const eye = box(gMat, 0.14, 0.035, 0.04, 0, 1.88, 0.16, group);
  glow.push(eye);
  cyl(mat.shade, 0.012, 0.01, 0.38, 0.08, 2.08, -0.04, group, 0.3);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.22, 1.52, 0);
  group.add(leftArm);
  cap(mat.shade, 0.04, 0.5, -0.04, -0.26, 0.04, leftArm);
  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 1.5, 0.04);
  group.add(rightArm);
  cap(mat.shade, 0.05, 0.36, 0.04, -0.08, 0.2, rightArm, Math.PI / 2);
  const muzzle = box(gMat, 0.07, 0.07, 0.12, 0.04, -0.1, 0.52, rightArm);
  glow.push(muzzle);
  cap(mat.shade, 0.05, 0.58, -0.09, 0.52, 0, group);
  cap(mat.shade, 0.05, 0.58, 0.09, 0.52, 0, group);
  box(mat.shade, 0.12, 0.05, 0.3, -0.09, 0.08, 0.05, group);
  box(mat.shade, 0.12, 0.05, 0.3, 0.09, 0.08, 0.05, group);
  group.scale.setScalar(1.1);
  return { group, kind: "stalker", leftArm, rightArm, glow };
}

function createBrute(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  box(mat.shade, 0.82, 0.72, 0.46, 0, 1.38, 0, group);
  box(mat.metal, 0.74, 0.16, 0.5, 0, 1.66, 0.02, group);
  const furnace = box(gMat, 0.3, 0.24, 0.08, 0, 1.34, 0.26, group);
  glow.push(furnace);
  sph(mat.shade, 0.22, 0, 1.96, 0.04, group, 10);
  box(mat.shade, 0.4, 0.32, 0.34, 0, 1.92, 0.04, group);
  const eye = box(gMat, 0.2, 0.055, 0.05, 0, 1.94, 0.24, group);
  glow.push(eye);
  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.52 * side, 1.52, 0);
    root.rotation.z = 0.1 * side;
    group.add(root);
    box(mat.shade, 0.3, 0.28, 0.32, 0.08 * side, 0.02, 0, root);
    cap(mat.shade, 0.12, 0.48, 0.1 * side, -0.4, 0.05, root);
    const fist = box(gMat, 0.2, 0.2, 0.24, 0.1 * side, -0.78, 0.1, root);
    glow.push(fist);
    return root;
  };
  cap(mat.shade, 0.12, 0.46, -0.2, 0.52, 0, group);
  cap(mat.shade, 0.12, 0.46, 0.2, 0.52, 0, group);
  box(mat.shade, 0.24, 0.12, 0.36, -0.2, 0.1, 0.06, group);
  box(mat.shade, 0.24, 0.12, 0.36, 0.2, 0.1, 0.06, group);
  group.scale.setScalar(1.28);
  return { group, kind: "brute", leftArm: mkArm(-1), rightArm: mkArm(1), glow };
}

function createHarbinger(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  cap(mat.shade, 0.22, 0.7, 0, 1.7, 0, group);
  box(mat.shade, 0.68, 0.88, 0.4, 0, 1.72, 0, group);
  sph(mat.shade, 0.26, 0, 2.52, 0.06, group, 12);
  box(mat.shade, 0.44, 0.62, 0.36, 0, 2.48, 0.06, group);
  for (let i = 0; i < 6; i++) {
    const a = (i - 2.5) * 0.28;
    box(mat.shade, 0.07, 0.46, 0.07, Math.sin(a) * 0.24, 3.0, Math.cos(a) * 0.08, group);
  }
  const eye = box(gMat, 0.26, 0.07, 0.06, 0, 2.54, 0.26, group);
  glow.push(eye);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), mat.voidCore.clone());
  core.position.set(0, 1.72, 0.28);
  core.castShadow = true;
  group.add(core);
  glow.push(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 8, 28), mat.voidCore.clone());
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 1.72, 0);
  group.add(ring);
  const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.025, 8, 32), mat.voidCore.clone());
  ringB.rotation.x = Math.PI / 2.4;
  ringB.position.set(0, 1.9, 0);
  group.add(ringB);
  const mkArm = (side: number, y: number, zOff: number) => {
    const root = new THREE.Group();
    root.position.set(0.48 * side, y, zOff);
    group.add(root);
    cap(mat.shade, 0.055, 0.72, 0.08 * side, -0.38, 0.1, root);
    const claw = box(gMat, 0.055, 0.055, 0.24, 0.08 * side, -0.86, 0.22, root);
    glow.push(claw);
    return root;
  };
  for (let i = 0; i < 4; i++) {
    const t = (i / 4) * Math.PI * 2;
    const tend = cyl(mat.shade, 0.035, 0.008, 1.0, Math.cos(t) * 0.28, 0.82, Math.sin(t) * 0.28, group);
    tend.rotation.z = Math.cos(t) * 0.45;
  }
  group.scale.setScalar(1.72);
  return {
    group,
    kind: "harbinger",
    leftArm: mkArm(-1, 2.08, 0),
    rightArm: mkArm(1, 2.08, 0),
    glow,
    core,
    ring,
  };
}

export function createCar(mat: Materials) {
  const g = new THREE.Group();
  box(mat.rust, 2.55, 0.42, 1.16, 0, 0.46, 0, g);
  box(mat.dark, 1.35, 0.46, 1.06, -0.12, 0.9, 0, g);
  box(mat.glass, 0.72, 0.28, 1.0, 0.22, 0.94, 0, g);
  box(mat.warning, 0.07, 0.06, 1.1, 1.22, 0.48, 0, g);
  box(mat.metal, 0.18, 0.08, 0.92, -1.18, 0.5, 0, g);
  box(mat.rust, 0.55, 0.12, 0.42, 0.74, 0.7, 0.42, g, 0.45, 0.18, 0.12);
  box(mat.dark, 0.9, 0.08, 1.08, 0.5, 0.7, 0, g);
  const wheel = (x: number, z: number, missing = false) => {
    if (missing) return;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14), mat.rubber);
    m.rotation.z = Math.PI / 2;
    m.position.set(x, 0.3, z);
    m.castShadow = true;
    g.add(m);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), mat.metal);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, 0.3, z);
    g.add(hub);
  };
  wheel(-0.78, 0.58);
  wheel(0.78, 0.58);
  wheel(-0.78, -0.58);
  wheel(0.78, -0.58, true);
  g.rotation.z = 0.05;
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
      opacity: 0.07,
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
  box(mat.metal, 3.5, 0.72, 1.7, 0, 0.7, 0, g);
  box(mat.dark, 1.7, 0.95, 1.45, -0.4, 1.32, 0, g);
  box(mat.ember, 0.32, 0.22, 0.32, 1.24, 0.92, 0.42, g);
  box(mat.rust, 1.15, 0.2, 2.3, 0.62, 0.2, 0.82, g, 0.4, 0.2, 0.1);
  box(mat.metal, 0.8, 0.16, 0.7, 1.1, 1.05, -0.2, g);
  const light = new THREE.PointLight(0xe85d04, 1.4, 8, 2);
  light.position.set(1.2, 1.1, 0.4);
  g.add(light);
  g.rotation.y = 0.5;
  g.rotation.z = 0.12;
  return g;
}

export function addWorldFromBoxes(scene: THREE.Object3D, boxes: AABB[], mat: Materials) {
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
    const cx = (b.minx + b.maxx) / 2;
    const cy = (b.miny + b.maxy) / 2;
    const cz = (b.minz + b.maxz) / 2;
    m.position.set(cx, cy, cz);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    if (!b.cover && h > 2.3 && w > 1.2 && d > 1.2) {
      const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.12, d + 0.12), mat.metal);
      ledge.position.set(cx, b.maxy - 0.06, cz);
      ledge.castShadow = true;
      scene.add(ledge);
      const belt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.08, d + 0.06), mat.rust);
      belt.position.set(cx, b.miny + h * 0.45, cz);
      scene.add(belt);
    }
  }
}

export function dressWorld(scene: THREE.Object3D, mat: Materials) {
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

  const skyline = new THREE.Group();
  const sil = [
    [-32, -20, 7, 18, 9],
    [-28, -48, 6, 26, 8],
    [-34, -72, 8, 32, 10],
    [-30, -96, 6, 22, 8],
    [32, -16, 7, 20, 9],
    [29, -44, 6, 28, 8],
    [35, -70, 9, 34, 11],
    [31, -100, 7, 24, 9],
    [-26, 16, 8, 14, 10],
    [27, 14, 7, 16, 9],
  ];
  sil.forEach(([x, z, w, h, d], i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.dark);
    b.position.set(x, h * 0.45, z);
    b.castShadow = true;
    b.receiveShadow = true;
    skyline.add(b);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.35, h * 0.28, d * 0.35), mat.rust);
    crown.position.set(x + (w > 7 ? 1.2 : -0.8), h * 0.72, z);
    skyline.add(crown);
    const glowWin = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.18, h * 0.12),
      new THREE.MeshStandardMaterial({
        color: 0x1a0c04,
        emissive: i % 2 ? 0xe85d04 : 0x22d3ee,
        emissiveIntensity: 1.8,
        toneMapped: false,
      }),
    );
    glowWin.position.set(x + (x > 0 ? -w * 0.48 : w * 0.48), h * 0.38, z);
    glowWin.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
    skyline.add(glowWin);
  });
  scene.add(skyline);
}

export function createAimReticle() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.36, 24),
    new THREE.MeshBasicMaterial({
      color: 0xe85d04,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  g.add(ring);
  const inner = new THREE.Mesh(
    new THREE.RingGeometry(0.04, 0.08, 12),
    new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  inner.rotation.x = -Math.PI / 2;
  g.add(inner);
  g.position.y = 0.06;
  return g;
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

function rarityHex(r: Rarity) {
  return r === "legendary" ? 0xfb923c : r === "rare" ? 0xc4b5fd : r === "magic" ? 0x60a5fa : 0xd6d3d1;
}

export function applyArmorKits(
  rig: PlayerRig,
  mat: Materials,
  items: InvItem[],
  equipped: Record<ArmorSlot, string | null>,
) {
  while (rig.kits.children.length) rig.kits.remove(rig.kits.children[0]);
  const piece = (slot: ArmorSlot) => items.find((i) => i.uid === equipped[slot]);
  const helm = piece("helm");
  if (helm) {
    const g = new THREE.Group();
    g.position.copy(rig.head.position);
    box(mat.metal, 0.34, 0.08, 0.32, 0, 0.22, 0, g);
    box(new THREE.MeshStandardMaterial({ color: rarityHex(helm.rarity), metalness: 0.55, roughness: 0.35, emissive: rarityHex(helm.rarity), emissiveIntensity: 0.25 }), 0.24, 0.04, 0.08, 0, 0.12, 0.18, g);
    rig.kits.add(g);
  }
  const chest = piece("chest");
  if (chest) {
    const g = new THREE.Group();
    g.position.copy(rig.torso.position);
    box(mat.metal, 0.66, 0.2, 0.16, 0, 0.22, 0.22, g);
    box(new THREE.MeshStandardMaterial({ color: rarityHex(chest.rarity), metalness: 0.4, roughness: 0.4, emissive: rarityHex(chest.rarity), emissiveIntensity: 0.2 }), 0.5, 0.08, 0.08, 0, 0.3, 0.28, g);
    rig.kits.add(g);
  }
  const arms = piece("arms");
  if (arms) {
    const tint = new THREE.MeshStandardMaterial({ color: rarityHex(arms.rarity), metalness: 0.5, roughness: 0.38 });
    box(tint, 0.16, 0.12, 0.22, 0.5, 0.82, 0.08, rig.kits);
    box(tint, 0.16, 0.12, 0.22, -0.5, 0.82, 0.08, rig.kits);
  }
  const legs = piece("legs");
  if (legs) {
    const tint = new THREE.MeshStandardMaterial({ color: rarityHex(legs.rarity), metalness: 0.45, roughness: 0.42 });
    box(tint, 0.2, 0.16, 0.22, 0.16, 0.28, 0.08, rig.kits);
    box(tint, 0.2, 0.16, 0.22, -0.16, 0.28, 0.08, rig.kits);
  }
}

export function createShipInterior(mat: Materials) {
  const root = new THREE.Group();
  root.name = "ship";

  const hull = new THREE.MeshStandardMaterial({
    color: 0x3a424c,
    metalness: 0.68,
    roughness: 0.34,
    envMapIntensity: 1.05,
  });
  const deck = new THREE.MeshStandardMaterial({
    color: 0x6a7380,
    metalness: 0.48,
    roughness: 0.42,
    envMapIntensity: 0.9,
  });
  const plate = new THREE.MeshStandardMaterial({
    color: 0x4c5560,
    metalness: 0.62,
    roughness: 0.36,
    envMapIntensity: 1,
  });

  const stars = new THREE.Mesh(
    new THREE.SphereGeometry(80, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x141c28, side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  root.add(stars);
  for (let i = 0; i < 48; i++) {
    const speck = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xe8f4ff, toneMapped: false, fog: false }),
    );
    const a = (i / 48) * Math.PI * 2;
    const b = ((i * 17) % 40) / 40 * Math.PI - Math.PI / 2;
    speck.position.set(Math.cos(a) * 42 * Math.cos(b), 10 + Math.sin(b) * 22, Math.sin(a) * 42 * Math.cos(b));
    root.add(speck);
  }

  const floor = new THREE.Mesh(new THREE.BoxGeometry(26, 0.28, 22), deck);
  floor.position.y = -0.14;
  floor.receiveShadow = true;
  root.add(floor);
  const run = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.05, 18),
    new THREE.MeshBasicMaterial({ color: 0xe85d04, toneMapped: false }),
  );
  run.position.set(0, 0.03, 0);
  root.add(run);
  const run2 = run.clone();
  run2.position.x = 5.1;
  root.add(run2);
  const run3 = run.clone();
  run3.position.x = -5.1;
  root.add(run3);

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.25, 2.4, 0.24, 28),
    new THREE.MeshStandardMaterial({
      color: 0x5a3a24,
      emissive: 0xe85d04,
      emissiveIntensity: 0.85,
      metalness: 0.28,
      roughness: 0.46,
    }),
  );
  pad.position.y = 0.14;
  pad.receiveShadow = true;
  root.add(pad);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.55, 28),
    new THREE.MeshBasicMaterial({ color: 0xff8a3a, toneMapped: false }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.27;
  root.add(disc);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.28, 0.05, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0xffb070, toneMapped: false }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.28;
  root.add(ring);

  for (const x of [-12.4, 12.4]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.4, 22), hull);
    wall.position.set(x, 2.1, 0);
    wall.castShadow = true;
    root.add(wall);
  }
  const aft = new THREE.Mesh(new THREE.BoxGeometry(26, 4.4, 0.4), hull);
  aft.position.set(0, 2.1, -10.6);
  root.add(aft);
  const bow = new THREE.Mesh(new THREE.BoxGeometry(26, 1.6, 0.35), hull);
  bow.position.set(0, 3.6, 10.5);
  root.add(bow);

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(12, 2.8, 0.12),
    new THREE.MeshStandardMaterial({
      color: 0x123848,
      emissive: 0x1a8aa0,
      emissiveIntensity: 0.9,
      metalness: 0.18,
      roughness: 0.12,
      transparent: true,
      opacity: 0.78,
    }),
  );
  glass.position.set(0, 2.2, 10.45);
  root.add(glass);

  for (const z of [-6, 0, 6]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(24, 0.16, 0.28), plate);
    beam.position.set(0, 5.6, z);
    root.add(beam);
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(20, 0.06, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xffc89a, toneMapped: false }),
    );
    strip.position.set(0, 5.48, z);
    root.add(strip);
  }

  const path = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.04, 5.2),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, toneMapped: false }),
  );
  path.position.set(3.4, 0.03, -2.2);
  path.rotation.y = -0.42;
  root.add(path);

  const cnc = new THREE.Group();
  cnc.position.set(5.4, 0, -4.4);
  cnc.name = "cnc";
  box(hull, 3.1, 0.32, 2.5, 0, 0.22, 0, cnc);
  box(mat.metal, 2.6, 0.1, 1.9, 0, 0.42, 0, cnc);
  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.05, 1.2),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, toneMapped: false }),
  );
  bed.position.set(0, 0.48, 0);
  cnc.add(bed);
  box(hull, 0.18, 2.6, 0.18, -1.35, 1.55, -1.0, cnc);
  box(hull, 0.18, 2.6, 0.18, 1.35, 1.55, -1.0, cnc);
  box(hull, 0.18, 2.6, 0.18, -1.35, 1.55, 1.0, cnc);
  box(hull, 0.18, 2.6, 0.18, 1.35, 1.55, 1.0, cnc);
  box(mat.metal, 3.0, 0.14, 0.2, 0, 2.85, 0, cnc);
  box(mat.voidCore, 0.2, 0.2, 2.2, 0, 2.7, 0, cnc);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.28), mat.ember);
  head.position.set(0, 1.15, 0);
  cnc.add(head);
  const hologram = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.82, toneMapped: false }),
  );
  hologram.position.set(0, 0.72, 0);
  hologram.name = "cncHolo";
  cnc.add(hologram);
  const lamp = new THREE.PointLight(0x5eead4, 3.2, 10, 1.4);
  lamp.position.set(0, 1.8, 0);
  cnc.add(lamp);
  root.add(cnc);

  const rack = new THREE.Group();
  rack.position.set(-6.4, 0, -3.2);
  box(hull, 2.4, 2.6, 0.4, 0, 1.4, 0, rack);
  for (let i = 0; i < 4; i++) box(mat.metal, 0.12, 1.4, 0.08, -0.8 + i * 0.5, 1.3, 0.16, rack);
  root.add(rack);

  const crateA = createCrate(mat);
  crateA.position.set(-5.4, 0, 3.6);
  root.add(crateA);
  const crateB = createCrate(mat);
  crateB.position.set(-4.2, 0, 4.4);
  root.add(crateB);

  const fill = new THREE.PointLight(0xffd4b0, 12, 28, 1);
  fill.position.set(0, 4.2, 1.2);
  root.add(fill);
  const rim = new THREE.PointLight(0xe85d04, 7, 18, 1.1);
  rim.position.set(-3.2, 2.8, 4);
  root.add(rim);
  const cncFill = new THREE.PointLight(0x5eead4, 5.5, 14, 1.2);
  cncFill.position.set(5.4, 2.8, -4.4);
  root.add(cncFill);

  root.userData.cnc = { x: 5.4, z: -4.4 };
  root.userData.holo = hologram;
  return root;
}
