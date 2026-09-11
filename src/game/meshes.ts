import * as THREE from "three";
import { bindPbr } from "./textures";
import type { AABB, AmmoId, ArmorSlot, EnemyKind, InvItem, LevelTheme, Rarity, WeaponId } from "./types";

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
    color: 0xb8b0a4,
    map: tex.ground ?? null,
    roughness: 0.9,
    metalness: 0.04,
  });
  const wall = new THREE.MeshStandardMaterial({
    color: 0xc4b9aa,
    map: tex.wall ?? null,
    roughness: 0.86,
    metalness: 0.06,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: 0x6a655c,
    map: tex.metal ?? null,
    roughness: 0.42,
    metalness: 0.78,
  });
  const armor = new THREE.MeshStandardMaterial({
    color: 0xe7ddd0,
    roughness: 0.3,
    metalness: 0.72,
    envMapIntensity: 1.2,
  });
  const shade = new THREE.MeshStandardMaterial({
    color: 0x1a1c22,
    map: tex.shade ?? null,
    roughness: 0.32,
    metalness: 0.55,
    emissive: 0x06332f,
    emissiveIntensity: 0.35,
  });
  bindPbr(concrete, tex.ground, { repeat: 1, bump: 1.35 });
  bindPbr(wall, tex.wall, { repeat: 1, bump: 1.05 });
  bindPbr(metal, tex.metal, { metal: true, repeat: 1 });
  bindPbr(armor, undefined, { metal: true, repeat: 1.4, bump: 0.95 });
  bindPbr(shade, tex.shade, { glow: true, repeat: 1.2 });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x2a3038,
    roughness: 0.46,
    metalness: 0.62,
    envMapIntensity: 1.05,
  });
  bindPbr(dark, undefined, { metal: true, bump: 0.88 });
  const rust = new THREE.MeshStandardMaterial({
    color: 0x7a4a36,
    map: tex.metal ?? null,
    roughness: 0.72,
    metalness: 0.38,
  });
  bindPbr(rust, tex.metal, { metal: true, bump: 1.15 });
  const asphalt = new THREE.MeshStandardMaterial({
    color: 0x6a655c,
    map: tex.ground ?? null,
    roughness: 0.92,
    metalness: 0.1,
  });
  bindPbr(asphalt, tex.ground, { bump: 1.55 });
  return {
    concrete,
    wall,
    metal,
    armor,
    shade,
    dark,
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
    asphalt,
    rust,
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
  leftShin: THREE.Object3D;
  rightShin: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftForearm: THREE.Object3D;
  rightForearm: THREE.Object3D;
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

function irand(i: number) {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
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
  box(armor, 0.48, 0.12, 0.28, 0, 0.86, 0.04, group);
  box(dark, 0.14, 0.1, 0.16, 0.22, 0.88, 0.08, group);
  box(dark, 0.14, 0.1, 0.16, -0.22, 0.88, 0.08, group);
  box(mat.ember, 0.06, 0.04, 0.05, 0.18, 0.94, 0.16, group);
  box(dark, 0.1, 0.16, 0.08, 0.3, 0.86, 0.1, group);
  box(metal, 0.08, 0.04, 0.1, 0.3, 0.8, 0.14, group);
  box(dark, 0.1, 0.16, 0.08, -0.3, 0.86, 0.1, group);
  box(mat.ember, 0.03, 0.06, 0.03, -0.3, 0.88, 0.15, group);
  box(mat.warning, 0.04, 0.03, 0.06, 0.3, 0.92, 0.12, group);
  box(armor, 0.6, 0.14, 0.38, 0, 0.86, 0.04, group);
  box(dark, 0.2, 0.12, 0.22, 0.24, 0.84, 0.14, group);
  box(dark, 0.2, 0.12, 0.22, -0.24, 0.84, 0.14, group);
  box(metal, 0.16, 0.08, 0.2, 0, 0.82, 0.2, group);

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
  cyl(dark, 0.018, 0.018, 0.42, 0.16, 0.04, -0.2, torso, 0.82);
  cyl(dark, 0.018, 0.018, 0.42, -0.16, 0.04, -0.2, torso, 0.82);
  cyl(dark, 0.014, 0.014, 0.3, 0.08, 0.22, 0.26, torso, 1.15);
  cyl(dark, 0.014, 0.014, 0.3, -0.08, 0.22, 0.26, torso, 1.15);
  box(mat.warning, 0.09, 0.03, 0.2, 0.2, 0.4, 0.1, torso);
  box(mat.warning, 0.09, 0.03, 0.2, -0.2, 0.4, 0.1, torso);
  box(metal, 0.08, 0.28, 0.08, 0.3, 0.14, -0.08, torso);
  box(metal, 0.08, 0.28, 0.08, -0.3, 0.14, -0.08, torso);
  box(dark, 0.52, 0.05, 0.36, 0, -0.08, 0.02, torso);
  box(metal, 0.1, 0.06, 0.08, 0.18, 0.32, 0.24, torso);
  box(metal, 0.1, 0.06, 0.08, -0.18, 0.32, 0.24, torso);
  sph(mat.ember, 0.02, 0.26, 0.36, 0.2, torso, 8);
  sph(mat.ember, 0.02, -0.26, 0.36, 0.2, torso, 8);
  box(armor, 0.58, 0.08, 0.36, 0, -0.02, 0.04, torso);
  box(dark, 0.2, 0.16, 0.08, 0, 0.2, 0.26, torso);
  box(mat.neon, 0.012, 0.28, 0.012, 0.18, 0.16, 0.24, torso);
  box(mat.neon, 0.012, 0.28, 0.012, -0.18, 0.16, 0.24, torso);
  box(metal, 0.36, 0.05, 0.08, 0, 0.42, 0.18, torso);
  box(armor, 0.18, 0.1, 0.16, 0.28, 0.08, 0.14, torso);
  box(armor, 0.18, 0.1, 0.16, -0.28, 0.08, 0.14, torso);
  for (let i = 0; i < 3; i++) box(dark, 0.42, 0.03, 0.06, 0, 0.02 + i * 0.08, 0.22, torso);
  box(mat.warning, 0.06, 0.06, 0.04, 0.22, 0.34, 0.24, torso);
  cyl(metal, 0.03, 0.03, 0.1, 0.32, 0.36, 0.16, torso, Math.PI / 2);
  box(armor, 0.38, 0.1, 0.28, 0, 0.46, 0.02, torso);
  box(dark, 0.16, 0.12, 0.1, 0, 0.12, 0.28, torso);
  sph(mat.ember, 0.035, 0, 0.14, 0.3, torso, 8);
  box(metal, 0.12, 0.08, 0.1, 0.26, 0.3, 0.16, torso);
  box(metal, 0.12, 0.08, 0.1, -0.26, 0.3, 0.16, torso);
  for (let i = 0; i < 4; i++) box(dark, 0.06, 0.02, 0.16, -0.18 + i * 0.12, 0.36, 0.2, torso);
  box(mat.neon, 0.42, 0.01, 0.01, 0, 0.08, 0.24, torso);
  cap(dark, 0.05, 0.1, 0, 0.48, 0.02, torso);
  box(armor, 0.72, 0.1, 0.2, 0, 0.42, 0.08, torso);
  box(dark, 0.16, 0.22, 0.14, 0.34, 0.28, 0.06, torso);
  box(dark, 0.16, 0.22, 0.14, -0.34, 0.28, 0.06, torso);
  box(metal, 0.1, 0.08, 0.18, 0.34, 0.38, 0.12, torso);
  box(metal, 0.1, 0.08, 0.18, -0.34, 0.38, 0.12, torso);
  box(mat.ember, 0.04, 0.04, 0.04, 0.34, 0.34, 0.16, torso);
  box(mat.ember, 0.04, 0.04, 0.04, -0.34, 0.34, 0.16, torso);
  box(armor, 0.2, 0.14, 0.12, 0, -0.12, 0.16, torso);
  box(dark, 0.08, 0.1, 0.08, 0.22, -0.06, 0.18, torso);
  box(dark, 0.08, 0.1, 0.08, -0.22, -0.06, 0.18, torso);
  cyl(mat.voidCore, 0.045, 0.045, 0.03, 0, 0.2, 0.3, torso, Math.PI / 2, 0, 10);
  box(mat.ember, 0.1, 0.018, 0.018, 0, 0.28, 0.3, torso);
  cyl(dark, 0.012, 0.012, 0.22, 0.2, 0.42, 0.04, torso, 1.05);
  cyl(dark, 0.012, 0.012, 0.22, -0.2, 0.42, 0.04, torso, 1.05);
  box(metal, 0.14, 0.04, 0.1, 0.32, 0.02, 0.16, torso);
  box(metal, 0.14, 0.04, 0.1, -0.32, 0.02, 0.16, torso);
  box(mat.warning, 0.04, 0.08, 0.03, 0.36, 0.12, 0.16, torso);
  box(armor, 0.46, 0.12, 0.36, 0, 0.52, 0.02, torso);
  box(dark, 0.24, 0.08, 0.2, 0, 0.54, 0.14, torso);
  box(metal, 0.16, 0.06, 0.14, 0.16, 0.5, 0.16, torso);
  box(metal, 0.16, 0.06, 0.14, -0.16, 0.5, 0.16, torso);
  box(armor, 0.78, 0.16, 0.28, 0, 0.4, 0.06, torso);
  box(armor, 0.28, 0.22, 0.22, 0.4, 0.32, 0.04, torso);
  box(armor, 0.28, 0.22, 0.22, -0.4, 0.32, 0.04, torso);
  box(armor, 0.24, 0.16, 0.22, 0.28, 0.88, 0.16, group);
  box(armor, 0.24, 0.16, 0.22, -0.28, 0.88, 0.16, group);

  const backpack = new THREE.Group();
  backpack.position.set(0, 0.16, -0.32);
  torso.add(backpack);
  box(dark, 0.4, 0.46, 0.2, 0, 0, 0, backpack);
  cyl(metal, 0.08, 0.08, 0.4, 0.13, 0.02, -0.02, backpack);
  cyl(metal, 0.08, 0.08, 0.4, -0.13, 0.02, -0.02, backpack);
  cyl(mat.ember, 0.038, 0.03, 0.12, 0, -0.2, 0.02, backpack);
  cyl(dark, 0.014, 0.014, 0.5, 0.1, 0.38, -0.02, backpack, 0.42);
  box(armor, 0.16, 0.12, 0.12, 0, 0.2, 0.1, backpack);
  box(mat.neon, 0.04, 0.18, 0.03, 0.18, 0.08, 0.1, backpack);
  box(metal, 0.12, 0.08, 0.08, 0.16, -0.16, 0.08, backpack);
  box(metal, 0.12, 0.08, 0.08, -0.16, -0.16, 0.08, backpack);
  cyl(mat.rubber, 0.02, 0.02, 0.28, 0.18, 0.22, 0.04, backpack, 1.1);
  cyl(mat.rubber, 0.02, 0.02, 0.28, -0.18, 0.22, 0.04, backpack, 1.1);
  box(dark, 0.3, 0.08, 0.08, 0, 0.28, -0.08, backpack);
  sph(mat.ember, 0.018, 0.14, -0.18, 0.08, backpack, 6);
  sph(mat.ember, 0.018, -0.14, -0.18, 0.08, backpack, 6);
  box(mat.warning, 0.08, 0.04, 0.06, 0, 0.18, 0.12, backpack);
  cyl(mat.rubber, 0.016, 0.016, 0.22, 0, 0.32, 0.08, backpack, 0.9);
  box(metal, 0.22, 0.06, 0.1, 0, -0.22, 0.08, backpack);
  box(dark, 0.14, 0.16, 0.1, 0.18, 0.04, 0.08, backpack);
  box(dark, 0.14, 0.16, 0.1, -0.18, 0.04, 0.08, backpack);
  box(mat.warning, 0.1, 0.02, 0.08, 0, 0.08, 0.12, backpack);
  cyl(metal, 0.05, 0.05, 0.16, 0.13, -0.08, -0.08, backpack, Math.PI / 2);
  cyl(metal, 0.05, 0.05, 0.16, -0.13, -0.08, -0.08, backpack, Math.PI / 2);
  box(mat.neon, 0.03, 0.1, 0.02, 0, 0.16, 0.12, backpack);
  box(armor, 0.34, 0.08, 0.14, 0, 0.28, 0.04, backpack);
  box(mat.dark, 0.12, 0.2, 0.1, 0, 0.06, -0.12, backpack);
  cyl(mat.metal, 0.04, 0.04, 0.18, 0.18, 0.18, -0.06, backpack);
  cyl(mat.metal, 0.04, 0.04, 0.18, -0.18, 0.18, -0.06, backpack);
  box(mat.voidCore, 0.06, 0.08, 0.04, 0, 0.12, 0.12, backpack);
  sph(mat.neon, 0.016, 0, 0.32, 0.06, backpack, 6);

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
  box(metal, 0.018, 0.05, 0.02, -0.06, 0.11, 0.208, head);
  box(metal, 0.018, 0.05, 0.02, 0.06, 0.11, 0.208, head);
    box(metal, 0.08, 0.06, 0.12, 0.15, 0.17, 0.06, head);
    box(armor, 0.38, 0.1, 0.24, 0, 0.21, 0.04, head);
    box(armor, 0.32, 0.1, 0.24, 0, -0.02, 0.12, head);
    box(dark, 0.3, 0.08, 0.1, 0, 0.11, 0.2, head);
    box(armor, 0.14, 0.16, 0.2, 0.18, 0.1, 0.0, head);
    box(armor, 0.14, 0.16, 0.2, -0.18, 0.1, 0.0, head);
    box(metal, 0.2, 0.04, 0.16, 0, 0.26, 0.1, head);
    cyl(dark, 0.012, 0.012, 0.22, 0.12, 0.3, -0.04, head, 0.28);
  sph(mat.ember, 0.018, 0.16, 0.17, 0.1, head, 8);
  box(dark, 0.08, 0.1, 0.08, 0, 0.08, -0.16, head);
  box(dark, 0.22, 0.06, 0.22, 0, -0.02, 0.02, head);
  cyl(metal, 0.016, 0.01, 0.08, -0.14, 0.2, 0.12, head, Math.PI / 2);
  box(armor, 0.36, 0.06, 0.22, 0, 0.16, -0.08, head);
  box(dark, 0.1, 0.12, 0.1, 0.16, 0.1, 0.1, head);
  box(dark, 0.1, 0.12, 0.1, -0.16, 0.1, 0.1, head);
  box(metal, 0.08, 0.04, 0.16, 0, 0.26, 0.08, head);
  box(mat.visor, 0.08, 0.02, 0.03, 0, 0.11, 0.21, head);
  cyl(dark, 0.01, 0.01, 0.14, -0.12, 0.28, -0.02, head, 0.5);
  sph(mat.neon, 0.012, -0.12, 0.34, 0.02, head, 6);
  box(armor, 0.12, 0.08, 0.1, 0, 0.04, 0.16, head);
  box(mat.bone, 0.16, 0.1, 0.12, 0, 0.02, 0.12, head);
  box(dark, 0.2, 0.04, 0.16, 0, 0.0, 0.1, head);
  box(armor, 0.08, 0.1, 0.18, 0.14, 0.14, -0.04, head);
  box(armor, 0.08, 0.1, 0.18, -0.14, 0.14, -0.04, head);
  cyl(metal, 0.012, 0.008, 0.16, 0.1, 0.32, 0.02, head, 0.2);
  sph(mat.ember, 0.012, 0.1, 0.4, 0.02, head, 6);
  box(mat.visor, 0.22, 0.016, 0.02, 0, 0.11, 0.2, head);
  box(armor, 0.26, 0.1, 0.2, 0, -0.1, 0.04, head);
  box(metal, 0.18, 0.04, 0.14, 0, -0.12, 0.14, head);
  box(dark, 0.08, 0.07, 0.1, 0.1, -0.08, 0.1, head);
  box(dark, 0.08, 0.07, 0.1, -0.1, -0.08, 0.1, head);
  box(mat.neon, 0.2, 0.01, 0.01, 0, 0.11, 0.216, head);
  box(mat.visor, 0.06, 0.028, 0.018, -0.06, 0.1, 0.208, head);
  box(mat.visor, 0.06, 0.028, 0.018, 0.06, 0.1, 0.208, head);
  box(mat.bone, 0.1, 0.05, 0.06, 0, 0.0, 0.16, head);
  box(dark, 0.04, 0.03, 0.05, -0.05, 0.0, 0.18, head);
  box(dark, 0.04, 0.03, 0.05, 0.05, 0.0, 0.18, head);
  box(metal, 0.06, 0.03, 0.08, 0.18, 0.22, 0.02, head);
  box(metal, 0.06, 0.03, 0.08, -0.18, 0.22, 0.02, head);
  cyl(dark, 0.008, 0.008, 0.1, 0.16, 0.26, 0.08, head, Math.PI / 2);
  sph(mat.neon, 0.01, 0.16, 0.26, 0.14, head, 6);
  box(armor, 0.28, 0.08, 0.16, 0, -0.04, 0.08, head);
  box(mat.dark, 0.2, 0.06, 0.1, 0, -0.08, 0.16, head);
  box(mat.visor, 0.1, 0.04, 0.03, 0, 0.08, 0.21, head);
  box(metal, 0.34, 0.04, 0.2, 0, 0.2, 0.02, head);
  box(dark, 0.06, 0.08, 0.12, 0.18, 0.06, 0.04, head);
  box(dark, 0.06, 0.08, 0.12, -0.18, 0.06, 0.04, head);
  box(metal, 0.22, 0.03, 0.12, 0, -0.14, 0.1, head);
  box(mat.ember, 0.03, 0.02, 0.03, 0.08, -0.12, 0.16, head);
  box(mat.ember, 0.03, 0.02, 0.03, -0.08, -0.12, 0.16, head);
  cyl(dark, 0.01, 0.01, 0.12, 0, 0.04, -0.18, head, 0.9);
  sph(mat.neon, 0.01, 0.2, 0.22, 0.08, head, 6);

  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.44 * side, 1.48, 0);
    root.rotation.z = 0.14 * side;
    group.add(root);
    box(armor, 0.28, 0.2, 0.32, 0.05 * side, 0.05, 0, root);
    box(armor, 0.36, 0.16, 0.4, 0.1 * side, 0.14, 0.02, root);
    box(metal, 0.22, 0.08, 0.3, 0.12 * side, 0.22, 0.04, root);
    box(dark, 0.14, 0.12, 0.18, 0.18 * side, 0.06, 0.16, root);
    sph(armor, 0.11, 0.05 * side, 0.02, 0, root, 10);
    cap(dark, 0.075, 0.22, 0.07 * side, -0.18, 0.02, root);
    box(armor, 0.12, 0.1, 0.14, 0.08 * side, 0.14, 0.08, root);
    box(armor, 0.16, 0.14, 0.2, 0.1 * side, 0.08, 0.12, root);
    box(metal, 0.08, 0.08, 0.1, 0.14 * side, -0.08, 0.14, root);
    box(mat.ember, 0.025, 0.025, 0.025, 0.16 * side, 0.02, 0.18, root);
    box(dark, 0.06, 0.1, 0.05, 0.16 * side, -0.16, 0.04, root);
    box(mat.warning, 0.04, 0.02, 0.03, 0.16 * side, -0.12, 0.07, root);
    box(mat.neon, 0.01, 0.1, 0.01, 0.14 * side, -0.1, 0.12, root);
    box(dark, 0.05, 0.08, 0.08, 0.14 * side, -0.2, 0.08, root);
    cyl(metal, 0.012, 0.012, 0.16, 0.12 * side, -0.16, 0.12, root, 1.1);
    box(armor, 0.18, 0.08, 0.16, 0.08 * side, 0.16, 0.06, root);
    box(metal, 0.06, 0.06, 0.12, 0.16 * side, 0.1, 0.1, root);
    sph(mat.ember, 0.018, 0.18 * side, 0.12, 0.16, root, 6);
    box(mat.warning, 0.03, 0.04, 0.04, 0.18 * side, 0.06, 0.16, root);
    const forearm = new THREE.Group();
    forearm.position.set(0.02 * side, -0.38, 0.04);
    root.add(forearm);
    cap(armor, 0.07, 0.2, 0.05 * side, -0.12, 0.02, forearm);
    box(metal, 0.15, 0.12, 0.22, 0.05 * side, -0.3, 0.08, forearm);
    box(mat.ember, 0.04, 0.035, 0.04, 0.05 * side, -0.24, 0.2, forearm);
    box(dark, 0.08, 0.06, 0.1, 0.08 * side, -0.32, 0.18, forearm);
    box(metal, 0.04, 0.04, 0.08, 0.1 * side, -0.18, 0.14, forearm);
    box(armor, 0.1, 0.08, 0.12, 0.04 * side, -0.38, 0.12, forearm);
    box(dark, 0.04, 0.05, 0.08, 0.08 * side, -0.44, 0.18, forearm);
    box(dark, 0.03, 0.04, 0.07, 0.0 * side, -0.46, 0.18, forearm);
    box(dark, 0.03, 0.04, 0.07, 0.12 * side, -0.46, 0.16, forearm);
    box(mat.warning, 0.03, 0.03, 0.04, 0.1 * side, -0.3, 0.18, forearm);
    cyl(metal, 0.018, 0.018, 0.08, 0.08 * side, -0.08, 0.12, forearm, 1.2);
    box(metal, 0.12, 0.04, 0.1, 0.06 * side, -0.4, 0.16, forearm);
    for (let f = 0; f < 4; f++) {
      box(dark, 0.018, 0.022, 0.055, (0.02 + f * 0.032) * side, -0.5, 0.2, forearm);
      box(armor, 0.014, 0.014, 0.03, (0.02 + f * 0.032) * side, -0.5, 0.23, forearm);
    }
    box(dark, 0.03, 0.035, 0.05, 0.0 * side, -0.48, 0.18, forearm);
    box(mat.ember, 0.02, 0.02, 0.02, 0.12 * side, -0.36, 0.2, forearm);
    box(mat.neon, 0.008, 0.12, 0.008, 0.12 * side, -0.16, 0.14, forearm);
    box(armor, 0.08, 0.1, 0.1, 0.08 * side, -0.2, 0.12, forearm);
    box(metal, 0.1, 0.03, 0.14, 0.04 * side, -0.34, 0.16, forearm);
    return { root, forearm };
  };
  const left = mkArm(-1);
  const right = mkArm(1);
  const leftArm = left.root;
  const rightArm = right.root;
  rightArm.rotation.x = -0.88;
  rightArm.rotation.y = -0.06;
  leftArm.rotation.x = -0.7;
  leftArm.rotation.z = 0.32;

  const gunGrip = new THREE.Group();
  gunGrip.position.set(0.04, -0.28, 0.12);
  gunGrip.rotation.set(0.86, 0.04, -0.02);
  right.forearm.add(gunGrip);

  const mkLeg = (side: number) => {
    const thigh = new THREE.Group();
    thigh.position.set(0.17 * side, 0.9, 0);
    group.add(thigh);
    cap(armor, 0.11, 0.28, 0, -0.16, 0.02, thigh);
    box(metal, 0.2, 0.11, 0.18, 0, -0.2, 0.1, thigh);
    box(armor, 0.16, 0.08, 0.14, 0, -0.08, 0.1, thigh);
    box(dark, 0.12, 0.1, 0.08, 0.08 * side, -0.28, 0.12, thigh);
    box(mat.warning, 0.04, 0.04, 0.06, 0.08 * side, -0.18, 0.14, thigh);
    box(dark, 0.1, 0.14, 0.08, 0.14 * side, -0.22, 0.08, thigh);
    box(metal, 0.08, 0.02, 0.06, 0.14 * side, -0.15, 0.12, thigh);
    box(mat.neon, 0.01, 0.12, 0.01, 0.1 * side, -0.24, 0.14, thigh);
    box(armor, 0.2, 0.1, 0.2, 0, -0.32, 0.1, thigh);
    box(metal, 0.1, 0.14, 0.1, 0.1 * side, -0.28, 0.08, thigh);
    box(mat.warning, 0.03, 0.03, 0.04, 0.16 * side, -0.2, 0.12, thigh);
    const shin = new THREE.Group();
    shin.position.set(0, -0.38, 0.02);
    thigh.add(shin);
    cap(dark, 0.08, 0.26, 0, -0.14, 0, shin);
    box(armor, 0.18, 0.12, 0.16, 0, -0.06, 0.07, shin);
    box(dark, 0.08, 0.1, 0.06, 0.12 * side, -0.1, 0.1, shin);
    cyl(metal, 0.016, 0.016, 0.14, 0, 0.02, 0.1, shin, 1.2);
    box(armor, 0.14, 0.16, 0.1, 0, -0.18, 0.1, shin);
    box(mat.warning, 0.03, 0.08, 0.03, 0.1 * side, -0.2, 0.12, shin);
    box(mat.rubber, 0.26, 0.12, 0.4, 0, -0.36, 0.06, shin);
    box(armor, 0.22, 0.1, 0.22, 0, -0.3, 0.22, shin);
    box(dark, 0.18, 0.08, 0.12, 0, -0.38, -0.12, shin);
    box(armor, 0.18, 0.1, 0.16, 0, -0.24, 0.12, shin);
    box(armor, 0.16, 0.06, 0.12, 0, -0.28, 0.14, shin);
    box(mat.rubber, 0.2, 0.03, 0.08, 0, -0.42, 0.18, shin);
    box(mat.rubber, 0.2, 0.03, 0.06, 0, -0.42, -0.1, shin);
    box(dark, 0.1, 0.06, 0.12, 0, -0.32, 0.16, shin);
    box(mat.rubber, 0.24, 0.04, 0.38, 0, -0.42, 0.05, shin);
    box(metal, 0.05, 0.03, 0.08, -0.06, -0.44, 0.22, shin);
    box(metal, 0.05, 0.03, 0.08, 0.06, -0.44, 0.22, shin);
    box(dark, 0.18, 0.04, 0.05, 0, -0.4, -0.14, shin);
    box(mat.rubber, 0.06, 0.04, 0.1, 0.1 * side, -0.36, 0.18, shin);
    cyl(metal, 0.012, 0.012, 0.08, 0.1 * side, -0.32, 0.2, shin, 1.2);
    box(armor, 0.12, 0.05, 0.2, 0, -0.3, 0.16, shin);
    box(metal, 0.14, 0.05, 0.14, 0, 0.02, 0.08, shin);
    box(dark, 0.1, 0.08, 0.1, 0.1 * side, -0.24, 0.12, shin);
    box(mat.rubber, 0.05, 0.05, 0.08, -0.08, -0.44, 0.2, shin);
    box(mat.rubber, 0.05, 0.05, 0.08, 0.08, -0.44, 0.2, shin);
    box(mat.neon, 0.01, 0.1, 0.01, 0.1 * side, -0.16, 0.14, shin);
    return { thigh, shin };
  };

  const gun = createRifle(mat);
  mountGunInRightHand(gun);
  gunGrip.add(gun);

  const kits = new THREE.Group();
  group.add(kits);
  const leftLeg = mkLeg(-1);
  const rightLeg = mkLeg(1);

  return {
    group,
    leftThigh: leftLeg.thigh,
    rightThigh: rightLeg.thigh,
    leftShin: leftLeg.shin,
    rightShin: rightLeg.shin,
    leftArm,
    rightArm,
    leftForearm: left.forearm,
    rightForearm: right.forearm,
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
  box(mat.dark, 0.078, 0.095, 0.46, 0, 0.012, -0.02, g);
  barrel(mat.metal, 0.022, 0.5, 0, 0.028, 0.4, g);
  barrel(mat.dark, 0.03, 0.09, 0, 0.028, 0.62, g);
  barrel(mat.metal, 0.036, 0.07, 0, 0.028, 0.7, g);
  box(mat.dark, 0.05, 0.19, 0.12, 0, -0.13, -0.1, g);
  box(mat.metal, 0.042, 0.042, 0.22, 0, -0.13, 0.12, g);
  box(mat.ember, 0.03, 0.03, 0.1, 0, 0.08, 0.08, g);
  box(mat.dark, 0.05, 0.075, 0.22, 0, 0.085, -0.18, g);
  box(mat.metal, 0.055, 0.15, 0.2, 0, -0.06, 0.24, g);
  box(mat.armor, 0.17, 0.048, 0.4, 0, -0.08, 0.16, g);
  box(mat.neon, 0.014, 0.014, 0.28, 0.034, 0.052, 0.08, g);
  sph(mat.ember, 0.016, 0, 0.082, 0.26, g, 8);
  box(mat.dark, 0.085, 0.042, 0.14, 0, 0.072, -0.02, g);
  box(mat.metal, 0.018, 0.018, 0.32, 0, 0.062, 0.24, g);
  box(mat.dark, 0.042, 0.11, 0.065, 0, -0.08, 0.02, g);
  box(mat.rubber, 0.058, 0.042, 0.085, 0, -0.21, -0.1, g);
  box(mat.metal, 0.02, 0.02, 0.16, 0.04, 0.04, 0.32, g);
  box(mat.warning, 0.016, 0.03, 0.06, 0.04, 0.06, -0.06, g);
  box(mat.dark, 0.03, 0.03, 0.08, 0, 0.1, 0.16, g);
  for (let i = 0; i < 4; i++) box(mat.metal, 0.012, 0.012, 0.04, 0, 0.07, 0.18 + i * 0.06, g);
  box(mat.dark, 0.07, 0.06, 0.16, 0, 0.02, -0.28, g);
  box(mat.rubber, 0.05, 0.08, 0.05, 0, -0.02, -0.34, g);
  box(mat.metal, 0.04, 0.04, 0.1, 0, 0.1, 0.32, g);
  box(mat.ember, 0.018, 0.018, 0.06, 0.04, 0.08, 0.2, g);
  cyl(mat.dark, 0.016, 0.016, 0.08, 0, -0.02, 0.18, g, Math.PI / 2, 0, 8);
  box(mat.dark, 0.06, 0.08, 0.12, 0, 0.04, -0.38, g);
  box(mat.rubber, 0.04, 0.1, 0.04, 0, 0.0, -0.42, g);
  box(mat.metal, 0.03, 0.06, 0.03, 0.04, 0.08, 0.48, g);
  box(mat.dark, 0.036, 0.14, 0.05, 0, -0.1, 0.08, g);
  box(mat.ember, 0.012, 0.04, 0.012, 0.04, 0.02, 0.08, g);
  box(mat.metal, 0.05, 0.02, 0.18, 0, 0.11, 0.08, g);
  box(mat.dark, 0.04, 0.06, 0.2, 0, 0.06, 0.36, g);
  box(mat.metal, 0.07, 0.03, 0.08, 0, -0.16, 0.04, g);
  box(mat.dark, 0.03, 0.05, 0.12, 0.04, 0.02, 0.5, g);
  box(mat.metal, 0.04, 0.02, 0.1, 0, 0.12, -0.12, g);
  sph(mat.ember, 0.012, 0.05, 0.06, 0.4, g, 6);
  box(mat.metal, 0.08, 0.06, 0.2, 0, 0.04, 0.16, g);
  box(mat.dark, 0.05, 0.08, 0.16, 0, 0.08, -0.22, g);
  box(mat.ember, 0.02, 0.02, 0.12, 0.04, 0.09, 0.28, g);
  return g;
}

export function createShotgun(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.11, 0.12, 0.4, 0, 0.012, -0.04, g);
  barrel(mat.metal, 0.022, 0.46, 0.032, 0.032, 0.3, g);
  barrel(mat.metal, 0.022, 0.46, -0.032, 0.032, 0.3, g);
  barrel(mat.dark, 0.03, 0.11, 0.032, 0.032, 0.54, g);
  barrel(mat.dark, 0.03, 0.11, -0.032, 0.032, 0.54, g);
  box(mat.dark, 0.075, 0.2, 0.13, 0, -0.13, -0.14, g);
  box(mat.ember, 0.038, 0.038, 0.09, 0, 0.1, 0.05, g);
  box(mat.rust, 0.14, 0.09, 0.2, 0, -0.02, -0.28, g);
  box(mat.armor, 0.15, 0.05, 0.22, 0, 0.075, -0.06, g);
  box(mat.metal, 0.13, 0.065, 0.16, 0, -0.02, 0.18, g);
  box(mat.dark, 0.09, 0.055, 0.12, 0, 0.085, 0.2, g);
  box(mat.rubber, 0.065, 0.045, 0.09, 0, -0.22, -0.14, g);
  box(mat.warning, 0.1, 0.02, 0.08, 0, 0.12, -0.16, g);
  box(mat.metal, 0.04, 0.04, 0.18, 0, 0.08, 0.32, g);
  box(mat.dark, 0.08, 0.06, 0.1, 0, -0.06, 0.06, g);
  cyl(mat.metal, 0.035, 0.035, 0.08, 0, 0.02, 0.22, g, Math.PI / 2, 0, 8);
  box(mat.dark, 0.12, 0.04, 0.22, 0, 0.08, -0.18, g);
  for (let i = 0; i < 3; i++) cyl(mat.ember, 0.012, 0.012, 0.04, -0.04 + i * 0.04, 0.12, -0.2, g);
  box(mat.metal, 0.03, 0.08, 0.08, 0, -0.04, 0.12, g);
  box(mat.rubber, 0.1, 0.04, 0.14, 0, -0.16, -0.22, g);
  box(mat.dark, 0.16, 0.05, 0.18, 0, -0.08, -0.36, g);
  box(mat.rubber, 0.08, 0.1, 0.06, 0, -0.04, -0.42, g);
  box(mat.metal, 0.08, 0.04, 0.2, 0, 0.06, 0.08, g);
  box(mat.ember, 0.02, 0.02, 0.08, 0.06, 0.1, 0.4, g);
  box(mat.dark, 0.04, 0.08, 0.1, 0.06, -0.02, 0.0, g);
  for (let i = 0; i < 5; i++) box(mat.metal, 0.018, 0.018, 0.05, 0.05, 0.1, 0.22 + i * 0.05, g);
  box(mat.metal, 0.1, 0.04, 0.12, 0, -0.1, -0.08, g);
  box(mat.ember, 0.03, 0.03, 0.05, 0, 0.12, 0.48, g);
  box(mat.metal, 0.12, 0.03, 0.08, 0, -0.14, 0.04, g);
  box(mat.dark, 0.05, 0.05, 0.16, 0, 0.04, 0.44, g);
  box(mat.warning, 0.04, 0.04, 0.04, 0.08, 0.08, -0.08, g);
  box(mat.metal, 0.16, 0.08, 0.12, 0, 0.02, 0.08, g);
  box(mat.dark, 0.05, 0.1, 0.22, 0, 0.04, 0.28, g);
  box(mat.rubber, 0.08, 0.06, 0.16, 0, -0.08, -0.2, g);
  return g;
}

export function createSmg(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.07, 0.085, 0.3, 0, 0.012, 0, g);
  barrel(mat.metal, 0.018, 0.26, 0, 0.022, 0.26, g);
  barrel(mat.dark, 0.026, 0.09, 0, 0.022, 0.4, g);
  box(mat.dark, 0.048, 0.2, 0.085, 0, -0.12, -0.02, g);
  box(mat.neon, 0.016, 0.016, 0.18, 0, 0.058, 0.05, g);
  box(mat.dark, 0.04, 0.05, 0.14, 0, 0.058, -0.15, g);
  box(mat.ember, 0.022, 0.022, 0.055, 0, 0.07, 0.16, g);
  box(mat.metal, 0.055, 0.14, 0.09, 0, -0.08, 0.09, g);
  box(mat.dark, 0.045, 0.075, 0.18, 0, 0.022, -0.24, g);
  box(mat.rubber, 0.052, 0.038, 0.065, 0, -0.2, -0.02, g);
  box(mat.armor, 0.1, 0.03, 0.16, 0, -0.04, 0.04, g);
  box(mat.metal, 0.03, 0.03, 0.12, 0.03, 0.04, 0.18, g);
  box(mat.warning, 0.02, 0.03, 0.05, 0.03, 0.06, -0.08, g);
  cyl(mat.dark, 0.02, 0.02, 0.1, 0, -0.02, 0.16, g, Math.PI / 2, 0, 8);
  box(mat.dark, 0.03, 0.08, 0.18, 0, 0.02, -0.22, g);
  box(mat.metal, 0.04, 0.1, 0.04, 0, -0.16, 0.06, g);
  box(mat.neon, 0.01, 0.01, 0.1, 0.03, 0.06, 0.12, g);
  box(mat.ember, 0.016, 0.016, 0.04, 0, 0.08, 0.22, g);
  box(mat.dark, 0.04, 0.12, 0.04, 0, -0.02, -0.32, g);
  box(mat.rubber, 0.03, 0.08, 0.03, 0, 0.02, -0.36, g);
  box(mat.metal, 0.05, 0.16, 0.04, 0, -0.12, 0.02, g);
  for (let i = 0; i < 4; i++) box(mat.dark, 0.018, 0.018, 0.03, 0.04, 0.04, 0.08 + i * 0.04, g);
  box(mat.neon, 0.008, 0.008, 0.14, -0.03, 0.06, 0.1, g);
  box(mat.metal, 0.022, 0.022, 0.08, 0, 0.03, 0.42, g);
  box(mat.dark, 0.05, 0.04, 0.08, 0, 0.06, -0.08, g);
  box(mat.metal, 0.08, 0.02, 0.1, 0, -0.06, 0.12, g);
  box(mat.ember, 0.014, 0.014, 0.05, 0.04, 0.07, 0.28, g);
  box(mat.dark, 0.05, 0.16, 0.07, 0.05, -0.08, 0.02, g);
  box(mat.metal, 0.09, 0.04, 0.18, 0, 0.07, 0.08, g);
  box(mat.neon, 0.012, 0.012, 0.16, 0.035, 0.07, 0.18, g);
  return g;
}

export function createDmr(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.062, 0.072, 0.52, 0, 0.022, 0.02, g);
  barrel(mat.metal, 0.016, 0.78, 0, 0.032, 0.55, g);
  barrel(mat.dark, 0.024, 0.16, 0, 0.032, 0.94, g);
  box(mat.dark, 0.048, 0.17, 0.11, 0, -0.11, -0.12, g);
  box(mat.metal, 0.042, 0.042, 0.24, 0, -0.11, 0.08, g);
  box(mat.armor, 0.15, 0.042, 0.46, 0, -0.06, 0.14, g);
  box(mat.dark, 0.055, 0.09, 0.18, 0, 0.095, -0.08, g);
  box(mat.glass, 0.04, 0.04, 0.16, 0, 0.15, -0.02, g);
  box(mat.neon, 0.012, 0.012, 0.12, 0, 0.155, 0.07, g);
  box(mat.metal, 0.085, 0.022, 0.09, 0.052, 0.012, 0.24, g);
  box(mat.metal, 0.085, 0.022, 0.09, -0.052, 0.012, 0.24, g);
  box(mat.dark, 0.038, 0.13, 0.055, 0, -0.085, 0.2, g);
  sph(mat.ember, 0.012, 0, 0.085, 0.4, g, 8);
  box(mat.metal, 0.02, 0.02, 0.36, 0, 0.07, 0.42, g);
  box(mat.dark, 0.05, 0.04, 0.1, 0, 0.18, -0.08, g);
  box(mat.warning, 0.02, 0.03, 0.06, 0.03, 0.08, -0.2, g);
  cyl(mat.dark, 0.018, 0.018, 0.08, 0, 0.15, 0.06, g, Math.PI / 2, 0, 8);
  box(mat.metal, 0.08, 0.02, 0.16, 0, 0.2, 0.04, g);
  box(mat.dark, 0.06, 0.05, 0.2, 0, 0.01, -0.3, g);
  box(mat.rubber, 0.04, 0.07, 0.04, 0, -0.02, -0.38, g);
  box(mat.metal, 0.03, 0.08, 0.03, 0.06, -0.08, 0.4, g);
  box(mat.metal, 0.03, 0.08, 0.03, -0.06, -0.08, 0.4, g);
  box(mat.dark, 0.05, 0.08, 0.16, 0, 0.04, -0.36, g);
  box(mat.rubber, 0.04, 0.1, 0.04, 0, 0.0, -0.44, g);
  box(mat.metal, 0.03, 0.03, 0.22, 0, 0.09, 0.62, g);
  box(mat.glass, 0.03, 0.03, 0.08, 0, 0.16, 0.08, g);
  box(mat.dark, 0.04, 0.04, 0.1, 0, 0.2, -0.02, g);
  box(mat.ember, 0.01, 0.01, 0.2, 0.02, 0.08, 0.5, g);
  box(mat.metal, 0.02, 0.06, 0.02, 0.04, -0.16, 0.16, g);
  box(mat.metal, 0.02, 0.06, 0.02, -0.04, -0.16, 0.16, g);
  box(mat.dark, 0.04, 0.03, 0.1, 0, 0.12, 0.72, g);
  box(mat.dark, 0.07, 0.12, 0.22, 0, 0.16, -0.04, g);
  box(mat.glass, 0.05, 0.05, 0.2, 0, 0.22, 0.04, g);
  box(mat.metal, 0.1, 0.03, 0.28, 0, 0.1, 0.36, g);
  box(mat.dark, 0.05, 0.2, 0.05, 0.05, -0.18, 0.22, g);
  box(mat.dark, 0.05, 0.2, 0.05, -0.05, -0.18, 0.22, g);
  box(mat.metal, 0.16, 0.02, 0.08, 0, -0.28, 0.22, g);
  box(mat.armor, 0.08, 0.16, 0.08, 0, -0.08, -0.02, g);
  barrel(mat.dark, 0.03, 0.22, 0, 0.032, 1.02, g);
  box(mat.neon, 0.01, 0.01, 0.18, 0, 0.24, 0.08, g);
  return g;
}

export function createCannon(mat: Materials) {
  const g = new THREE.Group();
  box(mat.rust, 0.11, 0.13, 0.26, 0, 0.032, 0.02, g);
  barrel(mat.metal, 0.034, 0.26, 0, 0.042, 0.24, g);
  barrel(mat.dark, 0.044, 0.07, 0, 0.042, 0.38, g);
  cyl(mat.metal, 0.075, 0.075, 0.12, 0, 0.022, -0.02, g, Math.PI / 2, 0, 10);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    sph(mat.dark, 0.016, Math.cos(a) * 0.048, 0.022 + Math.sin(a) * 0.048, -0.02, g, 6);
  }
  box(mat.dark, 0.06, 0.18, 0.09, 0, -0.11, -0.06, g);
  box(mat.rubber, 0.065, 0.045, 0.08, 0, -0.2, -0.06, g);
  box(mat.ember, 0.032, 0.032, 0.07, 0, 0.11, 0.1, g);
  box(mat.warning, 0.022, 0.045, 0.09, 0.055, 0.065, 0.04, g);
  box(mat.armor, 0.14, 0.04, 0.16, 0, -0.04, 0.08, g);
  box(mat.metal, 0.04, 0.04, 0.1, 0, 0.08, 0.22, g);
  box(mat.dark, 0.08, 0.05, 0.1, 0, 0.1, -0.12, g);
  sph(mat.ember, 0.014, 0.05, 0.08, 0.12, g, 6);
  box(mat.rust, 0.08, 0.08, 0.14, 0, 0.04, -0.16, g);
  box(mat.metal, 0.05, 0.05, 0.08, 0, 0.1, 0.3, g);
  box(mat.warning, 0.1, 0.02, 0.06, 0, 0.14, -0.04, g);
  cyl(mat.ember, 0.02, 0.02, 0.06, 0.06, 0.04, 0.08, g);
  box(mat.dark, 0.08, 0.06, 0.12, 0, 0.02, -0.22, g);
  box(mat.rubber, 0.05, 0.08, 0.05, 0, -0.02, -0.26, g);
  for (let i = 0; i < 5; i++) {
    box(mat.metal, 0.09, 0.012, 0.04, 0, 0.06 + i * 0.016, 0.16, g);
  }
  box(mat.warning, 0.03, 0.05, 0.03, -0.06, 0.08, 0.08, g);
  sph(mat.ember, 0.018, 0, 0.1, 0.36, g, 6);
  box(mat.metal, 0.06, 0.08, 0.04, 0.08, 0.0, 0.12, g);
  box(mat.dark, 0.05, 0.04, 0.08, 0, 0.12, 0.18, g);
  cyl(mat.rust, 0.025, 0.025, 0.08, 0, 0.04, 0.32, g, Math.PI / 2, 0, 8);
  box(mat.dark, 0.14, 0.1, 0.18, 0, 0.04, 0.08, g);
  box(mat.metal, 0.1, 0.06, 0.1, 0, 0.12, 0.16, g);
  box(mat.warning, 0.08, 0.03, 0.1, 0, 0.16, 0.02, g);
  return g;
}

export function createLmg(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.11, 0.11, 0.5, 0, 0.032, 0.04, g);
  barrel(mat.metal, 0.028, 0.56, 0, 0.042, 0.46, g);
  barrel(mat.dark, 0.042, 0.2, 0, 0.042, 0.4, g);
  box(mat.metal, 0.17, 0.15, 0.24, 0.13, -0.02, 0.02, g);
  box(mat.warning, 0.17, 0.032, 0.045, 0.13, 0.065, 0.13, g);
  box(mat.dark, 0.065, 0.2, 0.11, 0, -0.13, -0.1, g);
  box(mat.armor, 0.2, 0.055, 0.44, 0, -0.06, 0.15, g);
  box(mat.metal, 0.13, 0.032, 0.13, 0, 0.13, -0.04, g);
  box(mat.dark, 0.085, 0.085, 0.085, 0, 0.17, -0.08, g);
  box(mat.metal, 0.1, 0.022, 0.18, 0.085, -0.08, 0.3, g);
  box(mat.metal, 0.1, 0.022, 0.18, -0.085, -0.08, 0.3, g);
  box(mat.neon, 0.014, 0.014, 0.22, 0.045, 0.085, 0.12, g);
  box(mat.ember, 0.03, 0.03, 0.06, 0.13, 0.08, 0.02, g);
  for (let i = 0; i < 5; i++) box(mat.metal, 0.03, 0.012, 0.04, 0.16, -0.04 + i * 0.03, 0.1, g);
  box(mat.rubber, 0.06, 0.04, 0.08, 0, -0.22, -0.1, g);
  box(mat.dark, 0.05, 0.05, 0.1, 0, 0.08, 0.28, g);
  box(mat.metal, 0.04, 0.1, 0.04, 0.1, -0.12, 0.38, g);
  box(mat.metal, 0.04, 0.1, 0.04, -0.1, -0.12, 0.38, g);
  box(mat.dark, 0.08, 0.05, 0.16, 0, 0.02, -0.26, g);
  for (let i = 0; i < 4; i++) box(mat.ember, 0.02, 0.01, 0.05, 0.2, -0.08 + i * 0.03, 0.02, g);
  cyl(mat.dark, 0.03, 0.03, 0.12, 0, 0.1, 0.16, g, Math.PI / 2, 0, 8);
  box(mat.dark, 0.08, 0.08, 0.14, 0, 0.04, -0.32, g);
  box(mat.rubber, 0.05, 0.1, 0.05, 0, 0.0, -0.38, g);
  box(mat.metal, 0.06, 0.12, 0.04, 0, 0.08, -0.16, g);
  for (let i = 0; i < 6; i++) {
    box(mat.ember, 0.018, 0.008, 0.04, 0.2, -0.1 + i * 0.028, 0.08, g);
  }
  box(mat.dark, 0.04, 0.04, 0.16, 0, 0.12, 0.28, g);
  box(mat.metal, 0.08, 0.02, 0.22, 0, -0.1, 0.42, g);
  box(mat.dark, 0.2, 0.03, 0.08, 0.16, 0.08, -0.04, g);
  box(mat.ember, 0.1, 0.02, 0.04, 0.18, 0.1, 0.04, g);
  box(mat.metal, 0.03, 0.08, 0.12, 0.2, -0.02, 0.16, g);
  box(mat.dark, 0.2, 0.18, 0.28, 0.16, 0.0, 0.02, g);
  box(mat.warning, 0.2, 0.04, 0.06, 0.16, 0.1, 0.14, g);
  box(mat.metal, 0.08, 0.04, 0.28, 0, -0.1, 0.36, g);
  return g;
}

export function createRail(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.058, 0.065, 0.4, 0, 0.022, -0.02, g);
  barrel(mat.metal, 0.012, 0.76, 0.03, 0.032, 0.44, g);
  barrel(mat.metal, 0.012, 0.76, -0.03, 0.032, 0.44, g);
  for (let i = 0; i < 6; i++) {
    const z = 0.06 + i * 0.12;
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.009, 6, 14), mat.voidCore);
    coil.rotation.y = Math.PI / 2;
    coil.position.set(0, 0.032, z);
    g.add(coil);
  }
  box(mat.voidCore, 0.045, 0.045, 0.12, 0, 0.032, 0.84, g);
  box(mat.dark, 0.048, 0.17, 0.1, 0, -0.11, -0.12, g);
  box(mat.neon, 0.032, 0.09, 0.045, 0, 0.085, -0.16, g);
  sph(mat.voidCore, 0.032, 0, 0.11, -0.08, g, 8);
  box(mat.armor, 0.13, 0.038, 0.24, 0, -0.05, 0.06, g);
  box(mat.metal, 0.02, 0.02, 0.2, 0, 0.07, 0.5, g);
  box(mat.dark, 0.04, 0.05, 0.08, 0, 0.08, -0.22, g);
  box(mat.warning, 0.018, 0.03, 0.05, 0.03, 0.06, -0.18, g);
  box(mat.dark, 0.1, 0.08, 0.16, 0, -0.02, -0.22, g);
  box(mat.voidCore, 0.04, 0.06, 0.04, 0.05, 0.06, -0.18, g);
  box(mat.metal, 0.03, 0.03, 0.14, 0, 0.08, 0.72, g);
  sph(mat.voidCore, 0.018, 0, 0.08, 0.4, g, 6);
  box(mat.dark, 0.05, 0.08, 0.12, 0, 0.02, -0.3, g);
  box(mat.rubber, 0.04, 0.09, 0.04, 0, -0.02, -0.36, g);
  box(mat.voidCore, 0.08, 0.02, 0.18, 0, 0.09, 0.2, g);
  box(mat.metal, 0.04, 0.04, 0.08, 0.05, 0.04, 0.6, g);
  box(mat.neon, 0.01, 0.01, 0.28, 0, 0.07, 0.36, g);
  cyl(mat.voidCore, 0.02, 0.02, 0.06, 0, 0.08, 0.84, g);
  box(mat.dark, 0.04, 0.04, 0.2, 0, 0.06, 0.16, g);
  box(mat.metal, 0.06, 0.02, 0.1, 0, 0.1, 0.6, g);
  sph(mat.neon, 0.012, 0.04, 0.08, 0.28, g, 6);
  box(mat.dark, 0.12, 0.1, 0.36, 0, 0.03, 0.18, g);
  box(mat.voidCore, 0.06, 0.06, 0.42, 0, 0.04, 0.28, g);
  box(mat.armor, 0.16, 0.08, 0.2, 0, -0.08, -0.16, g);
  box(mat.voidCore, 0.1, 0.12, 0.1, 0, 0.08, -0.2, g);
  sph(mat.voidCore, 0.04, 0, 0.14, -0.2, g, 8);
  box(mat.metal, 0.08, 0.04, 0.32, 0, 0.1, 0.48, g);
  box(mat.neon, 0.02, 0.02, 0.4, 0, 0.12, 0.36, g);
  return g;
}

export function createGrenadeLauncher(mat: Materials) {
  const g = new THREE.Group();
  barrel(mat.dark, 0.058, 0.46, 0, 0.062, 0.2, g);
  barrel(mat.metal, 0.05, 0.18, 0, 0.062, 0.46, g);
  box(mat.dark, 0.13, 0.13, 0.3, 0, 0.022, -0.06, g);
  cyl(mat.metal, 0.085, 0.085, 0.11, 0.02, -0.04, -0.08, g, Math.PI / 2, 0, 10);
  box(mat.dark, 0.065, 0.18, 0.11, 0, -0.13, -0.14, g);
  box(mat.warning, 0.14, 0.042, 0.045, 0, 0.13, 0.08, g);
  box(mat.warning, 0.14, 0.042, 0.045, 0, 0.13, 0.24, g);
  sph(mat.ember, 0.042, 0, 0.065, 0.52, g, 8);
  box(mat.ember, 0.032, 0.032, 0.065, 0, 0.15, -0.04, g);
  box(mat.armor, 0.15, 0.042, 0.22, 0, -0.06, 0.02, g);
  box(mat.metal, 0.05, 0.05, 0.12, 0, 0.08, 0.32, g);
  box(mat.dark, 0.08, 0.06, 0.1, 0, -0.04, 0.12, g);
  box(mat.rubber, 0.06, 0.04, 0.08, 0, -0.22, -0.14, g);
  cyl(mat.ember, 0.02, 0.02, 0.08, 0.06, 0.04, 0.18, g);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    sph(mat.ember, 0.014, Math.cos(a) * 0.07, -0.04 + Math.sin(a) * 0.04, -0.08, g, 6);
  }
  box(mat.dark, 0.08, 0.05, 0.14, 0, 0.02, -0.24, g);
  box(mat.metal, 0.04, 0.04, 0.08, 0, 0.12, 0.4, g);
  box(mat.dark, 0.1, 0.06, 0.12, 0, 0.02, -0.3, g);
  box(mat.rubber, 0.06, 0.08, 0.05, 0, -0.02, -0.34, g);
  box(mat.metal, 0.04, 0.08, 0.04, 0.08, 0.06, 0.28, g);
  box(mat.warning, 0.03, 0.06, 0.03, -0.07, 0.1, 0.16, g);
  for (let i = 0; i < 3; i++) box(mat.ember, 0.02, 0.02, 0.05, -0.04 + i * 0.04, 0.16, 0.12, g);
  box(mat.dark, 0.06, 0.08, 0.06, 0.08, -0.08, -0.04, g);
  box(mat.metal, 0.1, 0.03, 0.14, 0, 0.14, 0.32, g);
  box(mat.warning, 0.08, 0.02, 0.08, 0, 0.16, -0.12, g);
  cyl(mat.dark, 0.11, 0.11, 0.16, 0.04, -0.02, -0.06, g, Math.PI / 2, 0, 10);
  barrel(mat.dark, 0.07, 0.2, 0, 0.062, 0.58, g);
  box(mat.ember, 0.16, 0.06, 0.16, 0, 0.16, 0.16, g);
  box(mat.armor, 0.2, 0.08, 0.28, 0, -0.1, -0.02, g);
  box(mat.warning, 0.18, 0.05, 0.08, 0, 0.18, 0.0, g);
  box(mat.metal, 0.06, 0.16, 0.06, 0.1, -0.08, 0.12, g);
  return g;
}

export function createWeaponMesh(id: WeaponId, mat: Materials) {
  if (id === "shotgun") return createShotgun(mat);
  if (id === "smg") return createSmg(mat);
  if (id === "dmr") return createDmr(mat);
  if (id === "cannon") return createCannon(mat);
  if (id === "lmg") return createLmg(mat);
  if (id === "rail") return createRail(mat);
  if (id === "gl") return createGrenadeLauncher(mat);
  if (id === "pulse") return createPulse(mat);
  return createRifle(mat);
}

export function createPulse(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 0.09, 0.1, 0.42, 0, 0.02, 0.02, g);
  box(mat.armor, 0.16, 0.05, 0.28, 0, -0.05, 0.08, g);
  barrel(mat.voidCore, 0.022, 0.48, 0, 0.036, 0.38, g);
  barrel(mat.metal, 0.032, 0.12, 0, 0.036, 0.6, g);
  barrel(mat.dark, 0.04, 0.08, 0, 0.036, 0.68, g);
  box(mat.dark, 0.055, 0.2, 0.1, 0, -0.14, -0.06, g);
  box(mat.rubber, 0.055, 0.05, 0.08, 0, -0.24, -0.06, g);
  box(mat.voidCore, 0.07, 0.16, 0.08, 0.06, -0.04, 0.04, g);
  sph(mat.voidCore, 0.032, 0.06, 0.06, 0.04, g, 8);
  box(mat.neon, 0.02, 0.02, 0.28, 0, 0.08, 0.12, g);
  box(mat.neon, 0.014, 0.014, 0.2, 0.04, 0.06, 0.2, g);
  box(mat.metal, 0.05, 0.05, 0.16, 0, 0.09, 0.22, g);
  box(mat.dark, 0.07, 0.08, 0.16, 0, 0.02, -0.24, g);
  box(mat.rubber, 0.05, 0.1, 0.05, 0, -0.02, -0.32, g);
  box(mat.voidCore, 0.04, 0.04, 0.1, 0.045, 0.07, 0.18, g);
  for (let i = 0; i < 5; i++) box(mat.neon, 0.014, 0.014, 0.03, 0.045, 0.055, 0.06 + i * 0.055, g);
  box(mat.metal, 0.08, 0.03, 0.12, 0, 0.1, -0.08, g);
  box(mat.dark, 0.04, 0.06, 0.2, 0, 0.06, 0.4, g);
  sph(mat.voidCore, 0.016, 0, 0.1, 0.32, g, 6);
  box(mat.warning, 0.02, 0.03, 0.05, 0.04, 0.08, -0.12, g);
  return g;
}

export function createAmmoMesh(id: AmmoId, mat: Materials) {
  const g = new THREE.Group();
  if (id === "shell") {
    box(mat.dark, 0.2, 0.1, 0.24, 0, 0.05, 0, g);
    box(mat.metal, 0.22, 0.02, 0.26, 0, 0.1, 0, g);
    box(mat.warning, 0.2, 0.02, 0.04, 0, 0.06, 0.12, g);
    for (let i = 0; i < 4; i++) {
      cyl(mat.ember, 0.018, 0.018, 0.07, -0.05 + (i % 2) * 0.1, 0.12, -0.05 + Math.floor(i / 2) * 0.1, g);
      cyl(mat.metal, 0.018, 0.018, 0.03, -0.05 + (i % 2) * 0.1, 0.16, -0.05 + Math.floor(i / 2) * 0.1, g);
    }
    box(mat.dark, 0.04, 0.08, 0.04, 0.12, 0.06, 0, g);
    box(mat.metal, 0.16, 0.02, 0.04, 0, 0.04, 0.12, g);
  } else if (id === "compact") {
    box(mat.dark, 0.09, 0.22, 0.13, 0, 0.11, 0, g);
    box(mat.metal, 0.08, 0.04, 0.11, 0, 0.23, 0, g);
    box(mat.neon, 0.02, 0.1, 0.02, 0.045, 0.11, 0.06, g);
    box(mat.ember, 0.02, 0.04, 0.02, -0.04, 0.16, 0.06, g);
    box(mat.metal, 0.03, 0.03, 0.08, 0, 0.18, 0.08, g);
    box(mat.dark, 0.04, 0.06, 0.04, 0.05, 0.08, 0.06, g);
    box(mat.warning, 0.08, 0.015, 0.02, 0, 0.06, 0.07, g);
  } else if (id === "heavy") {
    box(mat.metal, 0.24, 0.16, 0.18, 0, 0.08, 0, g);
    box(mat.warning, 0.24, 0.03, 0.03, 0, 0.13, 0.09, g);
    box(mat.dark, 0.2, 0.05, 0.14, 0, 0.17, 0, g);
    for (let i = 0; i < 3; i++) box(mat.ember, 0.03, 0.02, 0.08, -0.06 + i * 0.06, 0.2, 0, g);
    box(mat.dark, 0.06, 0.08, 0.06, 0.1, 0.06, 0.08, g);
    cyl(mat.metal, 0.02, 0.02, 0.1, -0.1, 0.1, 0.08, g, Math.PI / 2);
    box(mat.metal, 0.04, 0.1, 0.04, 0.12, 0.08, -0.06, g);
    box(mat.dark, 0.08, 0.03, 0.16, 0, 0.03, 0, g);
  } else if (id === "cell") {
    box(mat.dark, 0.12, 0.18, 0.12, 0, 0.09, 0, g);
    box(mat.voidCore, 0.07, 0.14, 0.07, 0, 0.1, 0, g);
    sph(mat.voidCore, 0.035, 0, 0.2, 0, g, 8);
    box(mat.neon, 0.02, 0.1, 0.02, 0.06, 0.09, 0, g);
    box(mat.metal, 0.14, 0.02, 0.14, 0, 0.02, 0, g);
    box(mat.voidCore, 0.03, 0.03, 0.03, 0.05, 0.16, 0.05, g);
    box(mat.metal, 0.1, 0.02, 0.1, 0, 0.18, 0, g);
    box(mat.neon, 0.016, 0.06, 0.016, -0.06, 0.1, 0.05, g);
  } else {
    box(mat.dark, 0.11, 0.24, 0.15, 0, 0.12, 0, g);
    box(mat.metal, 0.1, 0.03, 0.13, 0, 0.25, 0, g);
    box(mat.ember, 0.03, 0.12, 0.02, 0.055, 0.11, 0.07, g);
    box(mat.warning, 0.11, 0.02, 0.02, 0, 0.04, 0.08, g);
    box(mat.metal, 0.04, 0.04, 0.08, 0, 0.2, 0.08, g);
    for (let i = 0; i < 3; i++) box(mat.dark, 0.08, 0.012, 0.02, 0, 0.08 + i * 0.04, 0.08, g);
    box(mat.metal, 0.03, 0.08, 0.03, -0.05, 0.12, 0.08, g);
    box(mat.dark, 0.06, 0.03, 0.1, 0, 0.02, 0, g);
  }
  return g;
}

export function createArmorMesh(slot: ArmorSlot, mat: Materials, rarity: Rarity = "common", name = "") {
  const g = new THREE.Group();
  const tint = kitTint(rarity, 0.2);
  const style = armorStyle(name);
  if (slot === "helm") {
    sph(mat.armor, 0.17, 0, 0.08, 0, g, 12);
    box(mat.dark, 0.3, 0.07, 0.28, 0, 0.19, 0, g);
    box(tint, 0.22, 0.045, 0.07, 0, 0.1, 0.17, g);
    box(mat.metal, 0.24, 0.02, 0.045, 0, 0.14, 0.18, g);
    box(mat.metal, 0.24, 0.02, 0.045, 0, 0.07, 0.18, g);
    box(mat.armor, 0.12, 0.1, 0.1, 0.14, 0.1, 0.06, g);
    box(mat.armor, 0.12, 0.1, 0.1, -0.14, 0.1, 0.06, g);
    cyl(mat.dark, 0.012, 0.012, 0.16, 0.12, 0.26, -0.02, g, 0.4);
    box(mat.armor, 0.28, 0.05, 0.22, 0, 0.22, -0.06, g);
    box(mat.dark, 0.1, 0.1, 0.1, 0.16, 0.08, 0.1, g);
    box(mat.dark, 0.1, 0.1, 0.1, -0.16, 0.08, 0.1, g);
    sph(mat.ember, 0.014, 0.14, 0.16, 0.08, g, 6);
    box(mat.visor, 0.08, 0.02, 0.03, 0, 0.1, 0.2, g);
    cyl(mat.metal, 0.01, 0.008, 0.12, -0.1, 0.26, 0.02, g, 0.35);
    box(mat.neon, 0.16, 0.008, 0.008, 0, 0.1, 0.21, g);
    box(mat.dark, 0.22, 0.04, 0.16, 0, 0.0, 0.08, g);
    box(mat.metal, 0.06, 0.03, 0.08, 0.16, 0.2, 0.02, g);
    box(mat.armor, 0.24, 0.08, 0.16, 0, -0.04, 0.08, g);
    box(mat.ember, 0.03, 0.02, 0.03, 0.08, 0.0, 0.16, g);
    if (style === "ember") {
      box(mat.ember, 0.24, 0.06, 0.06, 0, 0.1, 0.2, g);
      box(mat.ember, 0.06, 0.12, 0.06, 0, 0.26, -0.02, g);
      box(mat.dark, 0.08, 0.16, 0.08, 0.16, 0.18, -0.02, g);
    } else if (style === "sealed") {
      box(mat.dark, 0.26, 0.14, 0.1, 0, 0.08, 0.16, g);
      box(mat.metal, 0.18, 0.03, 0.06, 0, 0.16, 0.22, g);
    } else if (style === "void") {
      box(mat.voidCore, 0.2, 0.03, 0.05, 0, 0.1, 0.2, g);
      cyl(mat.voidCore, 0.01, 0.008, 0.16, 0.12, 0.28, 0, g, 0.3);
    } else {
      box(mat.visor, 0.18, 0.03, 0.04, 0, 0.1, 0.2, g);
      box(mat.metal, 0.08, 0.04, 0.1, 0.16, 0.2, 0.02, g);
    }
  } else if (slot === "chest") {
    box(mat.armor, 0.34, 0.3, 0.18, 0, 0.1, 0, g);
    box(mat.metal, 0.24, 0.14, 0.09, 0, 0.13, 0.11, g);
    box(tint, 0.18, 0.045, 0.045, 0, 0.2, 0.13, g);
    box(mat.dark, 0.11, 0.18, 0.09, 0.15, 0.08, -0.06, g);
    box(mat.dark, 0.11, 0.18, 0.09, -0.15, 0.08, -0.06, g);
    box(mat.ember, 0.06, 0.03, 0.03, 0, 0.16, 0.15, g);
    box(mat.warning, 0.05, 0.03, 0.08, 0.12, 0.22, 0.06, g);
    box(mat.armor, 0.38, 0.08, 0.14, 0, 0.24, 0.02, g);
    box(mat.dark, 0.2, 0.1, 0.08, 0, 0.08, 0.12, g);
    for (let i = 0; i < 3; i++) box(mat.dark, 0.22, 0.015, 0.04, 0, 0.02 + i * 0.05, 0.1, g);
    box(mat.neon, 0.01, 0.16, 0.01, 0.1, 0.1, 0.12, g);
    box(mat.neon, 0.01, 0.16, 0.01, -0.1, 0.1, 0.12, g);
    sph(mat.ember, 0.02, 0, 0.14, 0.16, g, 6);
    box(mat.metal, 0.1, 0.08, 0.08, 0.16, 0.18, 0.08, g);
    box(mat.metal, 0.1, 0.08, 0.08, -0.16, 0.18, 0.08, g);
    box(mat.warning, 0.08, 0.02, 0.1, 0, 0.26, 0.08, g);
    box(mat.armor, 0.12, 0.1, 0.08, 0.18, 0.2, 0.08, g);
    box(mat.armor, 0.12, 0.1, 0.08, -0.18, 0.2, 0.08, g);
    box(tint, 0.06, 0.06, 0.05, 0.2, 0.24, 0.1, g);
    if (style === "assault") {
      box(mat.metal, 0.4, 0.08, 0.12, 0, 0.28, 0.06, g);
      box(tint, 0.2, 0.12, 0.08, 0, 0.12, 0.14, g);
      box(mat.armor, 0.16, 0.14, 0.1, 0.2, 0.22, 0.1, g);
      box(mat.armor, 0.16, 0.14, 0.1, -0.2, 0.22, 0.1, g);
    } else if (style === "ember") {
      sph(mat.ember, 0.03, 0, 0.14, 0.16, g, 8);
      box(mat.ember, 0.16, 0.04, 0.04, 0, 0.2, 0.16, g);
    } else if (style === "void") {
      box(mat.voidCore, 0.12, 0.08, 0.06, 0, 0.14, 0.16, g);
      box(mat.neon, 0.22, 0.012, 0.012, 0, 0.08, 0.14, g);
    } else {
      box(mat.metal, 0.28, 0.06, 0.08, 0, 0.26, 0.08, g);
    }
  } else if (slot === "arms") {
    box(mat.armor, 0.13, 0.24, 0.13, 0.11, 0.08, 0, g);
    box(mat.armor, 0.13, 0.24, 0.13, -0.11, 0.08, 0, g);
    box(tint, 0.11, 0.065, 0.11, 0.11, 0.17, 0.045, g);
    box(tint, 0.11, 0.065, 0.11, -0.11, 0.17, 0.045, g);
    box(mat.metal, 0.09, 0.09, 0.11, 0.11, -0.02, 0.045, g);
    box(mat.metal, 0.09, 0.09, 0.11, -0.11, -0.02, 0.045, g);
    box(mat.ember, 0.03, 0.03, 0.03, 0.14, 0.1, 0.08, g);
    box(mat.dark, 0.08, 0.08, 0.1, 0.11, -0.08, 0.06, g);
    box(mat.dark, 0.08, 0.08, 0.1, -0.11, -0.08, 0.06, g);
    box(mat.warning, 0.04, 0.03, 0.05, 0.14, 0.16, 0.08, g);
    cyl(mat.metal, 0.015, 0.015, 0.08, 0.14, 0.04, 0.08, g, 1.1);
    cyl(mat.metal, 0.015, 0.015, 0.08, -0.14, 0.04, 0.08, g, 1.1);
    box(mat.neon, 0.01, 0.1, 0.01, 0.16, 0.1, 0.08, g);
    box(mat.neon, 0.01, 0.1, 0.01, -0.16, 0.1, 0.08, g);
    box(mat.dark, 0.06, 0.08, 0.08, 0.11, -0.12, 0.06, g);
    box(mat.dark, 0.06, 0.08, 0.08, -0.11, -0.12, 0.06, g);
    if (style === "servo") {
      box(mat.metal, 0.1, 0.08, 0.12, 0.11, -0.14, 0.08, g);
      box(mat.metal, 0.1, 0.08, 0.12, -0.11, -0.14, 0.08, g);
      cyl(mat.metal, 0.018, 0.018, 0.1, 0.16, 0.02, 0.08, g, 1.1);
    }
  } else {
    box(mat.armor, 0.13, 0.28, 0.15, 0.085, 0.08, 0, g);
    box(mat.armor, 0.13, 0.28, 0.15, -0.085, 0.08, 0, g);
    box(tint, 0.11, 0.055, 0.13, 0.085, 0.17, 0.045, g);
    box(tint, 0.11, 0.055, 0.13, -0.085, 0.17, 0.045, g);
    box(mat.rubber, 0.15, 0.045, 0.2, 0.085, -0.07, 0.045, g);
    box(mat.rubber, 0.15, 0.045, 0.2, -0.085, -0.07, 0.045, g);
    box(mat.metal, 0.08, 0.08, 0.08, 0.085, 0.02, 0.08, g);
    box(mat.metal, 0.08, 0.08, 0.08, -0.085, 0.02, 0.08, g);
    box(mat.dark, 0.1, 0.08, 0.1, 0.085, 0.1, 0.1, g);
    box(mat.dark, 0.1, 0.08, 0.1, -0.085, 0.1, 0.1, g);
    box(mat.warning, 0.04, 0.03, 0.05, 0.12, 0.18, 0.08, g);
    box(mat.rubber, 0.16, 0.03, 0.22, 0.085, -0.1, 0.06, g);
    box(mat.rubber, 0.16, 0.03, 0.22, -0.085, -0.1, 0.06, g);
    box(mat.metal, 0.04, 0.03, 0.08, 0.1, -0.12, 0.12, g);
    box(mat.metal, 0.04, 0.03, 0.08, -0.1, -0.12, 0.12, g);
    box(mat.dark, 0.08, 0.1, 0.06, 0.14, 0.12, 0.04, g);
    box(mat.dark, 0.08, 0.1, 0.06, -0.14, 0.12, 0.04, g);
    box(mat.neon, 0.01, 0.08, 0.01, 0.14, 0.08, 0.1, g);
    box(mat.neon, 0.01, 0.08, 0.01, -0.14, 0.08, 0.1, g);
    if (style === "rail") {
      box(mat.voidCore, 0.03, 0.16, 0.03, 0.12, 0.08, 0.1, g);
      box(mat.voidCore, 0.03, 0.16, 0.03, -0.12, 0.08, 0.1, g);
    } else if (style === "strider") {
      box(mat.metal, 0.1, 0.03, 0.16, 0.085, 0.2, 0.08, g);
      box(mat.metal, 0.1, 0.03, 0.16, -0.085, 0.2, 0.08, g);
    }
  }
  return g;
}

export function createHealthOrb(mat: Materials) {
  const g = new THREE.Group();
  sph(mat.ember, 0.12, 0, 0.08, 0, g, 10);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xe85d04, transparent: true, opacity: 0.28, toneMapped: false, depthWrite: false }),
  );
  glow.position.y = 0.08;
  g.add(glow);
  return g;
}

export function createScrapPile(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 0.16, 0.08, 0.12, 0, 0.04, 0, g);
  box(mat.rust, 0.1, 0.06, 0.14, 0.05, 0.08, 0.02, g);
  box(mat.warning, 0.06, 0.04, 0.08, -0.04, 0.09, -0.02, g);
  box(mat.dark, 0.08, 0.05, 0.1, -0.06, 0.06, 0.06, g);
  box(mat.ember, 0.04, 0.03, 0.04, 0.02, 0.1, -0.06, g);
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
  if (kind === "spitter") return createSpitter(mat);
  if (kind === "wraith") return createWraith(mat);
  return createHusk(mat);
}

function createSpitter(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  cap(mat.shade, 0.16, 0.4, 0, 1.12, 0.04, group);
  box(mat.shade, 0.36, 0.48, 0.3, 0, 1.16, 0.08, group, 0.2);
  box(mat.rust, 0.28, 0.2, 0.22, 0, 1.28, 0.2, group);
  sph(mat.shade, 0.16, 0, 1.52, 0.1, group, 10);
  glow.push(box(gMat, 0.16, 0.04, 0.05, 0, 1.52, 0.24, group));
  glow.push(box(mat.ember, 0.1, 0.08, 0.1, 0, 1.22, 0.26, group));
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.26, 1.3, 0.04);
  leftArm.rotation.z = -0.4;
  group.add(leftArm);
  cap(mat.shade, 0.05, 0.42, -0.04, -0.22, 0.04, leftArm);
  glow.push(box(gMat, 0.03, 0.03, 0.14, -0.04, -0.52, 0.1, leftArm));
  const rightArm = new THREE.Group();
  rightArm.position.set(0.26, 1.28, 0.08);
  group.add(rightArm);
  cap(mat.shade, 0.055, 0.3, 0.04, -0.06, 0.16, rightArm, Math.PI / 2);
  box(mat.rust, 0.1, 0.1, 0.2, 0.04, -0.08, 0.34, rightArm);
  glow.push(box(mat.ember, 0.08, 0.08, 0.1, 0.04, -0.1, 0.48, rightArm));
  cap(mat.shade, 0.055, 0.46, -0.1, 0.46, 0.02, group);
  cap(mat.shade, 0.055, 0.46, 0.1, 0.46, 0.02, group);
  group.scale.setScalar(1.12);
  return { group, kind: "spitter", leftArm, rightArm, glow };
}

function createWraith(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  const ghost = mat.shade.clone();
  ghost.transparent = true;
  ghost.opacity = 0.72;
  cap(ghost, 0.12, 0.5, 0, 1.28, 0, group);
  box(ghost, 0.24, 0.58, 0.18, 0, 1.32, 0, group, 0.35);
  sph(ghost, 0.13, 0, 1.78, 0.06, group, 10);
  glow.push(box(gMat, 0.12, 0.03, 0.04, 0, 1.8, 0.18, group));
  glow.push(box(mat.voidCore, 0.04, 0.22, 0.04, 0, 1.4, 0.12, group));
  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.22 * side, 1.48, 0);
    root.rotation.z = 0.55 * side;
    group.add(root);
    cap(ghost, 0.04, 0.7, 0.03 * side, -0.38, 0.04, root);
    glow.push(box(gMat, 0.02, 0.02, 0.2, 0.03 * side, -0.82, 0.14, root));
    return root;
  };
  cap(ghost, 0.045, 0.62, -0.08, 0.5, 0, group);
  cap(ghost, 0.045, 0.62, 0.08, 0.5, 0, group);
  group.scale.setScalar(1.05);
  return { group, kind: "wraith", leftArm: mkArm(-1), rightArm: mkArm(1), glow };
}

function createHusk(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  cap(mat.shade, 0.15, 0.44, 0, 1.16, 0.03, group);
  box(mat.shade, 0.32, 0.52, 0.26, 0, 1.2, 0.05, group, 0.32);
  box(mat.shade, 0.38, 0.16, 0.2, 0, 1.38, -0.08, group, 0.45);
  sph(mat.shade, 0.17, 0, 1.6, 0.08, group, 12);
  box(mat.shade, 0.2, 0.14, 0.16, 0, 1.62, 0.1, group, 0.2);
  const eye = box(gMat, 0.18, 0.035, 0.05, 0, 1.6, 0.22, group);
  glow.push(eye);
  glow.push(box(gMat, 0.022, 0.5, 0.02, 0.08, 1.18, 0.17, group));
  glow.push(box(gMat, 0.2, 0.018, 0.02, 0, 1.06, 0.16, group));
  glow.push(box(gMat, 0.016, 0.28, 0.016, -0.1, 1.28, 0.16, group));
  box(mat.shade, 0.12, 0.36, 0.04, 0.16, 1.1, -0.12, group, 0.2, 0, 0.4);
  box(mat.shade, 0.1, 0.28, 0.04, -0.14, 0.92, -0.1, group, 0.3, 0, -0.35);
  box(mat.shade, 0.06, 0.22, 0.05, 0.1, 0.78, 0.08, group, 0.5, 0, 0.2);
  sph(mat.shade, 0.05, 0.12, 0.68, 0.1, group, 6);
  glow.push(box(gMat, 0.04, 0.04, 0.04, 0, 1.42, 0.18, group));
  box(mat.shade, 0.18, 0.08, 0.12, 0, 1.48, 0.16, group);
  box(mat.shade, 0.08, 0.16, 0.08, 0.14, 1.32, 0.12, group);
  glow.push(box(gMat, 0.03, 0.03, 0.08, 0.12, 1.5, 0.18, group));
  const mkArm = (side: number, extra = 0) => {
    const root = new THREE.Group();
    root.position.set(0.27 * side, 1.36, 0.04);
    root.rotation.z = 0.5 * side;
    group.add(root);
    cap(mat.shade, 0.048, 0.64 + extra, 0.04 * side, -0.36, 0.06, root);
    glow.push(box(gMat, 0.032, 0.032, 0.26, 0.04 * side, -0.8, 0.17, root));
    box(mat.shade, 0.028, 0.028, 0.16, 0.02 * side, -0.84, 0.24, root, 0.4);
    box(gMat, 0.02, 0.02, 0.12, 0.06 * side, -0.86, 0.2, root, -0.3);
    box(gMat, 0.016, 0.016, 0.1, 0, -0.88, 0.14, root, 0.5);
    return root;
  };
  cap(mat.shade, 0.058, 0.5, -0.1, 0.48, 0.02, group);
  cap(mat.shade, 0.058, 0.5, 0.1, 0.48, 0.02, group);
  box(mat.shade, 0.13, 0.06, 0.28, -0.1, 0.08, 0.05, group);
  box(mat.shade, 0.13, 0.06, 0.28, 0.1, 0.08, 0.05, group);
  box(mat.shade, 0.08, 0.04, 0.18, -0.1, 0.06, 0.16, group);
  box(mat.shade, 0.08, 0.04, 0.18, 0.1, 0.06, 0.16, group);
  return { group, kind: "husk", leftArm: mkArm(-1, 0.1), rightArm: mkArm(1), glow };
}

function createStalker(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  cap(mat.shade, 0.11, 0.52, 0, 1.32, 0, group);
  box(mat.shade, 0.26, 0.62, 0.22, 0, 1.38, 0, group, 0.28);
  box(mat.shade, 0.18, 0.4, 0.16, 0, 1.2, -0.12, group, 0.55);
  sph(mat.shade, 0.14, 0, 1.86, 0.08, group, 10);
  box(mat.shade, 0.16, 0.12, 0.18, 0, 1.84, 0.12, group, 0.25);
  glow.push(box(gMat, 0.14, 0.035, 0.04, 0, 1.88, 0.2, group));
  glow.push(box(gMat, 0.012, 0.22, 0.012, 0.06, 1.5, 0.12, group));
  for (let i = 0; i < 4; i++) {
    box(mat.shade, 0.05, 0.08, 0.06, 0, 1.1 + i * 0.12, -0.14, group);
  }
  cyl(mat.shade, 0.012, 0.01, 0.38, 0.08, 2.08, -0.04, group, 0.3);
  cyl(mat.shade, 0.01, 0.008, 0.28, -0.06, 2.04, -0.06, group, 0.42);
  box(mat.shade, 0.1, 0.08, 0.14, 0, 1.72, 0.16, group);
  glow.push(box(gMat, 0.04, 0.04, 0.06, 0, 1.7, 0.22, group));
  box(mat.shade, 0.06, 0.22, 0.05, 0.1, 1.35, -0.16, group, 0.4);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.22, 1.52, 0);
  leftArm.rotation.z = -0.35;
  group.add(leftArm);
  cap(mat.shade, 0.04, 0.5, -0.04, -0.26, 0.04, leftArm);
  glow.push(box(gMat, 0.024, 0.024, 0.16, -0.04, -0.62, 0.12, leftArm));
  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 1.5, 0.04);
  group.add(rightArm);
  cap(mat.shade, 0.05, 0.36, 0.04, -0.08, 0.2, rightArm, Math.PI / 2);
  box(mat.shade, 0.08, 0.08, 0.22, 0.04, -0.08, 0.38, rightArm);
  glow.push(box(gMat, 0.07, 0.07, 0.12, 0.04, -0.1, 0.52, rightArm));
  barrel(mat.dark, 0.018, 0.16, 0.04, -0.08, 0.62, rightArm);
  cap(mat.shade, 0.05, 0.58, -0.09, 0.52, 0.04, group, 0.2);
  cap(mat.shade, 0.05, 0.58, 0.09, 0.52, -0.02, group, -0.15);
  box(mat.shade, 0.12, 0.05, 0.3, -0.09, 0.08, 0.05, group);
  box(mat.shade, 0.12, 0.05, 0.3, 0.09, 0.08, 0.05, group);
  box(mat.shade, 0.06, 0.04, 0.16, -0.09, 0.06, 0.18, group);
  box(mat.shade, 0.06, 0.04, 0.16, 0.09, 0.06, 0.18, group);
  group.scale.setScalar(1.1);
  return { group, kind: "stalker", leftArm, rightArm, glow };
}

function createBrute(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  box(mat.shade, 0.82, 0.72, 0.46, 0, 1.38, 0, group);
  box(mat.metal, 0.74, 0.16, 0.5, 0, 1.66, 0.02, group);
  box(mat.rust, 0.7, 0.12, 0.48, 0, 1.12, 0.04, group);
  box(mat.metal, 0.28, 0.36, 0.18, 0.38, 1.46, 0.22, group);
  box(mat.metal, 0.28, 0.36, 0.18, -0.38, 1.46, 0.22, group);
  glow.push(box(gMat, 0.3, 0.24, 0.08, 0, 1.34, 0.26, group));
  glow.push(box(gMat, 0.06, 0.18, 0.04, 0.16, 1.34, 0.3, group));
  glow.push(box(gMat, 0.06, 0.18, 0.04, -0.16, 1.34, 0.3, group));
  sph(mat.shade, 0.22, 0, 1.96, 0.04, group, 10);
  box(mat.shade, 0.4, 0.32, 0.34, 0, 1.92, 0.04, group);
  box(mat.metal, 0.36, 0.08, 0.3, 0, 2.1, 0.06, group);
  glow.push(box(gMat, 0.2, 0.055, 0.05, 0, 1.94, 0.24, group));
  box(mat.metal, 0.5, 0.08, 0.4, 0, 1.5, 0.18, group);
  box(mat.rust, 0.18, 0.22, 0.12, 0.32, 1.22, 0.18, group);
  box(mat.rust, 0.18, 0.22, 0.12, -0.32, 1.22, 0.18, group);
  box(mat.shade, 0.12, 0.22, 0.1, 0.28, 2.08, -0.08, group, 0, 0, 0.4);
  box(mat.shade, 0.12, 0.22, 0.1, -0.28, 2.08, -0.08, group, 0, 0, -0.4);
  const mkArm = (side: number) => {
    const root = new THREE.Group();
    root.position.set(0.52 * side, 1.52, 0);
    root.rotation.z = 0.1 * side;
    group.add(root);
    box(mat.shade, 0.3, 0.28, 0.32, 0.08 * side, 0.02, 0, root);
    box(mat.metal, 0.22, 0.14, 0.26, 0.08 * side, 0.08, 0.12, root);
    cap(mat.shade, 0.12, 0.48, 0.1 * side, -0.4, 0.05, root);
    glow.push(box(gMat, 0.2, 0.2, 0.24, 0.1 * side, -0.78, 0.1, root));
    box(mat.metal, 0.08, 0.16, 0.08, 0.18 * side, -0.72, 0.2, root);
    return root;
  };
  cap(mat.shade, 0.12, 0.46, -0.2, 0.52, 0, group);
  cap(mat.shade, 0.12, 0.46, 0.2, 0.52, 0, group);
  box(mat.shade, 0.24, 0.12, 0.36, -0.2, 0.1, 0.06, group);
  box(mat.shade, 0.24, 0.12, 0.36, 0.2, 0.1, 0.06, group);
  box(mat.metal, 0.2, 0.08, 0.28, -0.2, 0.16, 0.14, group);
  box(mat.metal, 0.2, 0.08, 0.28, 0.2, 0.16, 0.14, group);
  group.scale.setScalar(1.28);
  return { group, kind: "brute", leftArm: mkArm(-1), rightArm: mkArm(1), glow };
}

function createHarbinger(mat: Materials): EnemyRig {
  const group = new THREE.Group();
  const glow: THREE.Mesh[] = [];
  const gMat = cloneGlow(mat.shadeGlow);
  cap(mat.shade, 0.22, 0.7, 0, 1.7, 0, group);
  box(mat.shade, 0.68, 0.88, 0.4, 0, 1.72, 0, group);
  box(mat.shade, 0.82, 1.05, 0.18, 0, 1.55, -0.22, group, 0.15);
  sph(mat.shade, 0.26, 0, 2.52, 0.06, group, 12);
  box(mat.shade, 0.44, 0.62, 0.36, 0, 2.48, 0.06, group);
  box(mat.shade, 0.56, 0.28, 0.42, 0, 2.72, 0.02, group);
  for (let i = 0; i < 7; i++) {
    const a = (i - 3) * 0.24;
    box(mat.shade, 0.07, 0.5, 0.07, Math.sin(a) * 0.26, 3.05, Math.cos(a) * 0.1, group);
  }
  glow.push(box(gMat, 0.26, 0.07, 0.06, 0, 2.54, 0.26, group));
  glow.push(box(gMat, 0.04, 0.36, 0.03, 0.12, 2.2, 0.22, group));
  box(mat.shade, 0.5, 0.12, 0.22, 0, 2.2, 0.18, group);
  glow.push(box(gMat, 0.08, 0.08, 0.08, -0.16, 2.4, 0.24, group));
  box(mat.shade, 0.1, 0.28, 0.08, 0.28, 2.7, -0.1, group, 0, 0, 0.35);
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
    glow.push(box(gMat, 0.055, 0.055, 0.24, 0.08 * side, -0.86, 0.22, root));
    box(mat.shade, 0.04, 0.04, 0.16, 0.04 * side, -0.9, 0.3, root, 0.35);
    return root;
  };
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2;
    const tend = cyl(mat.shade, 0.032, 0.006, 1.15, Math.cos(t) * 0.3, 0.78, Math.sin(t) * 0.3, group);
    tend.rotation.z = Math.cos(t) * 0.5;
    tend.rotation.x = Math.sin(t) * 0.25;
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
  box(mat.rust, 0.7, 0.08, 0.95, 0.35, 1.16, 0.02, g, 0.35, 0.08, 0.12);
  box(mat.dark, 0.42, 0.55, 0.06, 0.85, 0.72, 0.58, g, 0.15, 0.4, 0.2);
  box(mat.metal, 0.12, 0.08, 0.22, -0.7, 0.52, 0.58, g);
  box(mat.ember, 0.08, 0.05, 0.06, 1.1, 0.52, 0.5, g);
  box(mat.ember, 0.08, 0.05, 0.06, 1.1, 0.52, -0.5, g);
  box(mat.metal, 0.06, 0.12, 0.22, 1.28, 0.52, 0.32, g);
  box(mat.metal, 0.06, 0.12, 0.22, 1.28, 0.52, -0.32, g);
  box(mat.dark, 0.04, 0.18, 0.7, -0.55, 0.78, 0.54, g);
  box(mat.dark, 0.04, 0.18, 0.7, 0.35, 0.78, 0.54, g);
  box(mat.metal, 0.12, 0.08, 0.18, 0.9, 0.86, 0.58, g, 0.2, 0.3);
  box(mat.warning, 0.18, 0.04, 0.08, -1.22, 0.42, 0.0, g);
  box(mat.dark, 0.08, 0.22, 0.08, -0.2, 1.05, 0.52, g);
  box(mat.rust, 0.35, 0.08, 0.28, -0.9, 0.72, -0.52, g, 0.3, -0.2);
  box(mat.metal, 0.16, 0.05, 0.12, 0.2, 1.12, 0.0, g);
  cyl(mat.dark, 0.012, 0.012, 0.28, -0.85, 1.18, 0.2, g, 0.4);
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
  cyl(mat.rust, 0.08, 0.1, 0.16, 0, 0.12, 0, g);
  cyl(mat.rust, 0.07, 0.07, 0.1, 0, 1.8, 0, g);
  box(mat.dark, 0.72, 0.1, 0.22, 0.22, 3.24, 0, g);
  box(mat.metal, 0.18, 0.08, 0.16, 0.48, 3.18, 0, g);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), mat.ember);
  bulb.position.set(0.4, 3.02, 0);
  g.add(bulb);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.12, 10, 1, true), mat.dark);
  shade.position.set(0.4, 3.16, 0);
  g.add(shade);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1.85, 3.35, 14, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xe85d04,
      transparent: true,
      opacity: 0.11,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  cone.position.set(0.4, 1.38, 0);
  cone.rotation.z = 0.1;
  g.add(cone);
  box(mat.dark, 0.14, 0.22, 0.1, 0.04, 1.15, 0.08, g);
  box(mat.rust, 0.1, 0.08, 0.08, 0.02, 2.2, 0.06, g);
  box(mat.warning, 0.06, 0.18, 0.04, 0.08, 2.55, 0.06, g);
  box(mat.metal, 0.08, 0.08, 0.08, 0.32, 3.24, 0, g);
  cyl(mat.dark, 0.015, 0.015, 0.55, 0.18, 3.12, 0.08, g, 1.2, 0.4);
  box(mat.ember, 0.04, 0.03, 0.04, 0.52, 3.08, 0.08, g);
  const light = new THREE.PointLight(0xe85d04, 2.15, 12, 1.7);
  light.position.copy(bulb.position);
  g.add(light);
  g.rotation.z = 0.08;
  return g;
}

export function createRubble(mat: Materials) {
  const g = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const s = 0.16 + irand(i + 3) * 0.52;
    const m = new THREE.Mesh(
      i % 3 === 0 ? new THREE.BoxGeometry(s * 1.4, s * 0.7, s) : new THREE.DodecahedronGeometry(s, 0),
      i % 2 ? mat.concrete : mat.rust,
    );
    m.position.set((irand(i) - 0.5) * 1.4, s * 0.38, (irand(i + 9) - 0.5) * 1.4);
    m.rotation.set(irand(i + 2), irand(i + 5), irand(i + 7));
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  for (let i = 0; i < 3; i++) {
    cyl(mat.rust, 0.018, 0.018, 0.7 + irand(i) * 0.4, (irand(i + 11) - 0.5) * 0.8, 0.28, (irand(i + 13) - 0.5) * 0.8, g, 0.9, irand(i) * 2);
  }
  return g;
}

export function createBarrel(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.rust, 0.28, 0.3, 0.85, 0, 0.42, 0, g, 0, 0, 10);
  cyl(mat.warning, 0.29, 0.29, 0.08, 0, 0.62, 0, g, 0, 0, 10);
  cyl(mat.dark, 0.285, 0.285, 0.05, 0, 0.82, 0, g, 0, 0, 10);
  cyl(mat.dark, 0.285, 0.285, 0.05, 0, 0.18, 0, g, 0, 0, 10);
  box(mat.rust, 0.12, 0.08, 0.06, 0.26, 0.5, 0.08, g, 0.2, 0.4);
  box(mat.dark, 0.08, 0.1, 0.04, 0.28, 0.7, -0.06, g);
  box(mat.metal, 0.06, 0.04, 0.1, 0, 0.86, 0.18, g);
  cyl(mat.warning, 0.3, 0.3, 0.04, 0, 0.4, 0, g, 0, 0, 10);
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 7), mat.ember);
  fire.position.set(0, 1.04, 0);
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
  box(mat.dark, 0.08, 0.72, 0.08, 0.32, 0.36, 0.32, g);
  box(mat.dark, 0.08, 0.72, 0.08, -0.32, 0.36, -0.32, g);
  box(mat.metal, 0.16, 0.05, 0.16, 0.22, 0.72, 0.22, g);
  box(mat.dark, 0.08, 0.72, 0.08, 0.32, 0.36, -0.32, g);
  box(mat.dark, 0.08, 0.72, 0.08, -0.32, 0.36, 0.32, g);
  box(mat.ember, 0.06, 0.04, 0.06, 0, 0.74, 0.28, g);
  box(mat.warning, 0.06, 0.06, 0.72, 0.36, 0.35, 0, g);
  box(mat.metal, 0.2, 0.04, 0.12, -0.18, 0.72, -0.2, g);
  return g;
}

export function createBarricade(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 1.8, 0.12, 0.16, 0, 0.42, 0, g, 0, 0, 0.18);
  box(mat.metal, 1.8, 0.12, 0.16, 0, 0.72, 0, g, 0, 0, -0.12);
  box(mat.warning, 1.7, 0.05, 0.05, 0, 0.58, 0.02, g);
  cyl(mat.dark, 0.04, 0.04, 0.9, -0.7, 0.45, 0, g);
  cyl(mat.dark, 0.04, 0.04, 0.9, 0.7, 0.45, 0, g);
  box(mat.rust, 0.22, 0.18, 0.18, -0.85, 0.12, 0.05, g);
  box(mat.dark, 0.14, 0.22, 0.08, 0.55, 0.55, 0.08, g);
  return g;
}

export function createWreck(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 3.5, 0.72, 1.7, 0, 0.7, 0, g);
  box(mat.dark, 1.7, 0.95, 1.45, -0.4, 1.32, 0, g);
  box(mat.ember, 0.32, 0.22, 0.32, 1.24, 0.92, 0.42, g);
  box(mat.rust, 1.15, 0.2, 2.3, 0.62, 0.2, 0.82, g, 0.4, 0.2, 0.1);
  box(mat.metal, 0.8, 0.16, 0.7, 1.1, 1.05, -0.2, g);
  box(mat.rust, 0.9, 0.18, 1.1, 1.4, 0.55, 0.7, g, 0.55, 0.3, 0.2);
  box(mat.dark, 0.55, 0.7, 0.08, -1.2, 1.1, 0.7, g, 0.2, 0.5);
  box(mat.glass, 0.5, 0.22, 0.7, -0.2, 1.55, 0.2, g, 0.25);
  box(mat.metal, 0.45, 0.12, 0.9, -1.4, 0.35, -0.4, g, 0.3, 0.4);
  box(mat.rust, 0.7, 0.14, 0.5, 0.2, 0.18, -0.9, g, 0.2, 0.5);
  box(mat.dark, 0.18, 0.55, 0.18, 1.5, 0.7, -0.5, g, 0.4);
  box(mat.ember, 0.16, 0.12, 0.16, 1.1, 0.85, -0.2, g);
  box(mat.warning, 0.3, 0.05, 0.12, -0.8, 1.5, 0.6, g, 0.2);
  cyl(mat.rubber, 0.22, 0.22, 0.16, -1.2, 0.28, -0.6, g, 0, Math.PI / 2, 10);
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
      const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.16, d + 0.18), mat.metal);
      ledge.position.set(cx, b.maxy - 0.04, cz);
      ledge.castShadow = true;
      scene.add(ledge);
      const belt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.1, d + 0.08), mat.rust);
      belt.position.set(cx, b.miny + h * 0.45, cz);
      scene.add(belt);
      const base = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.22, d + 0.1), mat.dark);
      base.position.set(cx, b.miny + 0.11, cz);
      scene.add(base);
      const face = cx < 0 ? 1 : -1;
      const fx = cx < 0 ? b.maxx + 0.02 : b.minx - 0.02;
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.7, 0.9), mat.dark);
      door.position.set(fx, b.miny + 0.85, cz);
      scene.add(door);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 1.15), mat.metal);
      lintel.position.set(fx, b.miny + 1.78, cz);
      scene.add(lintel);
      const ac = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.55), mat.metal);
      ac.position.set(cx + face * (w * 0.22), b.maxy + 0.22, cz + d * 0.15);
      ac.castShadow = true;
      scene.add(ac);
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), mat.dark);
      vent.position.set(cx - face * (w * 0.18), b.maxy + 0.08, cz - d * 0.12);
      scene.add(vent);
    }
  }
}

export function dressWorld(scene: THREE.Object3D, mat: Materials, theme: LevelTheme = "ash") {
  const roadMat = theme === "spire" ? mat.dark : theme === "rail" ? mat.rust : mat.asphalt;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 132), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, -48);
  road.receiveShadow = true;
  scene.add(road);

  for (const x of [-2.92, 2.92]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 132), mat.concrete);
    curb.position.set(x, 0.06, -48);
    curb.castShadow = true;
    curb.receiveShadow = true;
    scene.add(curb);
  }
  const walkMat = new THREE.MeshStandardMaterial({
    color: 0x8a8074,
    roughness: 0.92,
    metalness: 0.06,
  });
  bindPbr(walkMat, undefined, { bump: 1.2 });
  const ashMat = new THREE.MeshStandardMaterial({
    color: 0x4a3c30,
    roughness: 0.96,
    metalness: 0.04,
  });
  bindPbr(ashMat, undefined, { bump: 1.45 });
  for (const x of [-4.35, 4.35]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 132), walkMat);
    walk.position.set(x, 0.03, -48);
    walk.receiveShadow = true;
    scene.add(walk);
  }
  for (const x of [-6.4, 6.4]) {
    const dirt = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 132), ashMat);
    dirt.position.set(x, 0.02, -48);
    dirt.receiveShadow = true;
    scene.add(dirt);
  }

  const dashGeo = new THREE.PlaneGeometry(0.14, 1.5);
  dashGeo.rotateX(-Math.PI / 2);
  const dashes = new THREE.InstancedMesh(dashGeo, mat.warning, 42);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 42; i++) {
    dummy.position.set(0, 0.035, 10 - i * 3.1);
    dummy.updateMatrix();
    dashes.setMatrixAt(i, dummy.matrix);
  }
  scene.add(dashes);

  const stainGeo = new THREE.CircleGeometry(0.85, 10);
  stainGeo.rotateX(-Math.PI / 2);
  const stainMat = new THREE.MeshStandardMaterial({
    color: 0x1a1410,
    roughness: 0.98,
    metalness: 0.02,
    transparent: true,
    opacity: 0.45,
  });
  const stains = new THREE.InstancedMesh(stainGeo, stainMat, 18);
  for (let i = 0; i < 18; i++) {
    dummy.position.set((irand(i) - 0.5) * 3.2, 0.03, 8 - i * 6.8);
    dummy.scale.setScalar(0.55 + irand(i + 4) * 1.1);
    dummy.updateMatrix();
    stains.setMatrixAt(i, dummy.matrix);
    dummy.scale.setScalar(1);
  }
  scene.add(stains);

  const winGeo = new THREE.PlaneGeometry(0.7, 1.02);
  const frameGeo = new THREE.BoxGeometry(1.02, 1.38, 0.14);
  const recessGeo = new THREE.BoxGeometry(0.86, 1.18, 0.08);
  const winMatA = new THREE.MeshStandardMaterial({
    color: 0x1a0c04,
    emissive: theme === "spire" ? 0x22d3ee : theme === "rail" ? 0xfb923c : 0xe85d04,
    emissiveIntensity: theme === "spire" ? 1.4 : 1.85,
    roughness: 1,
    toneMapped: false,
  });
  const winMatB = new THREE.MeshStandardMaterial({
    color: 0x041014,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.55,
    roughness: 1,
    toneMapped: false,
  });
  const spots: { x: number; y: number; z: number; ry: number }[] = [];
  const strips: [number, number, number, number][] = [
    [-17.98, 10, -22, Math.PI / 2],
    [17.98, 10, -22, -Math.PI / 2],
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
  const frames = new THREE.InstancedMesh(frameGeo, mat.dark, spots.length);
  const recesses = new THREE.InstancedMesh(recessGeo, mat.asphalt, spots.length);
  const meshA = new THREE.InstancedMesh(winGeo, winMatA, spots.length);
  const meshB = new THREE.InstancedMesh(winGeo, winMatB, spots.length);
  let ia = 0;
  let ib = 0;
  spots.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z);
    dummy.rotation.set(0, s.ry, 0);
    dummy.updateMatrix();
    frames.setMatrixAt(i, dummy.matrix);
    const into = s.x < 0 ? -0.02 : 0.02;
    dummy.position.set(s.x + into, s.y, s.z);
    dummy.updateMatrix();
    recesses.setMatrixAt(i, dummy.matrix);
    const glass = s.x < 0 ? 0.06 : -0.06;
    dummy.position.set(s.x + glass, s.y, s.z);
    dummy.updateMatrix();
    if (i % 5 === 0) {
      meshB.setMatrixAt(ib++, dummy.matrix);
    } else {
      meshA.setMatrixAt(ia++, dummy.matrix);
    }
  });
  meshA.count = ia;
  meshB.count = ib;
  scene.add(frames);
  scene.add(recesses);
  scene.add(meshA);
  scene.add(meshB);

  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 4 - i * 11;
    const x = side * (Math.abs(z) > 70 ? 15.6 : Math.abs(z) > 40 ? 7.7 : 7.7);
    box(mat.metal, 0.08, 3.4, 0.08, x, 2.2, z, scene);
    box(mat.metal, 0.7, 0.06, 0.7, x + side * 0.32, 3.8, z, scene);
    box(mat.metal, 0.7, 0.06, 0.7, x + side * 0.32, 2.6, z, scene);
    box(mat.metal, 0.7, 0.06, 0.7, x + side * 0.32, 1.4, z, scene);
  }
  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -6 - i * 13;
    box(mat.rust, 0.08, 1.4, 1.8, side * 5.6, 2.4, z, scene);
    box(mat.warning, 0.04, 0.7, 1.4, side * 5.66, 2.45, z, scene);
  }

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
    const belt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.18, d + 0.2), mat.metal);
    belt.position.set(x, h * 0.62, z);
    skyline.add(belt);
    const face = x > 0 ? -w * 0.501 : w * 0.501;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if ((r + c + i) % 4 === 0) continue;
        const glowWin = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.12, h * 0.08),
          new THREE.MeshStandardMaterial({
            color: 0x1a0c04,
            emissive: (r + i) % 2 ? 0xe85d04 : 0x22d3ee,
            emissiveIntensity: 1.7,
            toneMapped: false,
          }),
        );
        glowWin.position.set(x + face, h * 0.18 + r * h * 0.16, z - d * 0.28 + c * d * 0.28);
        glowWin.rotation.y = x > 0 ? -Math.PI / 2 : Math.PI / 2;
        skyline.add(glowWin);
      }
    }
  });
  scene.add(skyline);

  for (let i = 0; i < 14; i++) {
    const mound = new THREE.Mesh(new THREE.SphereGeometry(0.55 + irand(i) * 0.45, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat.rust);
    mound.position.set((irand(i + 2) - 0.5) * 10, 0.02, 6 - i * 8.2);
    mound.scale.set(1.4, 0.35, 1.1);
    mound.receiveShadow = true;
    scene.add(mound);
  }

  for (let i = 0; i < 9; i++) {
    const z = 6 - i * 14;
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 12), mat.metal);
    hole.position.set((i % 2 ? -1.1 : 1.15), 0.04, z);
    scene.add(hole);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.03, 12), mat.dark);
    lid.position.set((i % 2 ? -1.1 : 1.15), 0.07, z);
    scene.add(lid);
  }
  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 2 - i * 15;
    box(mat.ember, 0.16, 0.55, 0.16, side * 3.35, 0.32, z, scene);
    box(mat.metal, 0.2, 0.08, 0.2, side * 3.35, 0.62, z, scene);
    box(mat.dark, 0.06, 0.22, 0.06, side * 3.35, 0.78, z, scene);
  }
  for (let i = 0; i < 6; i++) {
    const z = -8 - i * 18;
    for (const x of [-1.6, -0.55, 0.55, 1.6]) {
      const bar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.7, 0.12),
        new THREE.MeshBasicMaterial({ color: 0xe8dcc4, transparent: true, opacity: 0.55, toneMapped: false }),
      );
      bar.rotation.x = -Math.PI / 2;
      bar.position.set(x, 0.036, z);
      scene.add(bar);
    }
  }
  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 4 - i * 12.5;
    box(mat.dark, 0.42, 0.28, 0.32, side * 4.7, 0.16, z, scene);
    box(mat.rust, 0.28, 0.18, 0.22, side * 4.55, 0.32, z + 0.12, scene);
    box(mat.warning, 0.18, 0.04, 0.18, side * 4.75, 0.36, z - 0.08, scene);
  }

  const signNames = ["NOX MART", "ASHFALL", "GATE-7", "VISTA", "RED SUN", "KIOSK", "REPAIR", "VOID"];
  const signCols = ["#e85d04", "#5eead4", "#e8b423", "#f4d4b0"];
  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 8 - i * 10.5;
    const x = side * (Math.abs(z) > 70 ? 15.2 : 7.35);
    box(mat.metal, 0.08, 0.9, 2.2, x, 2.55, z, scene);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 0.42),
      new THREE.MeshBasicMaterial({
        map: deckMark(signNames[i % signNames.length], signCols[i % signCols.length], 512, 96),
        transparent: true,
        toneMapped: false,
      }),
    );
    sign.position.set(x + side * 0.06, 2.7, z);
    sign.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(sign);
    box(mat.dark, 0.12, 2.05, 1.1, x + side * 0.08, 1.1, z + 0.7, scene);
    box(mat.metal, 0.16, 0.1, 1.2, x + side * 0.08, 2.15, z + 0.7, scene);
    box(mat.ember, 0.04, 0.08, 0.04, x + side * 0.16, 1.55, z + 0.35, scene);
    box(mat.rust, 1.8, 0.06, 1.15, x + side * 0.7, 2.2, z, scene);
    box(mat.dark, 0.08, 0.55, 0.08, x + side * 0.15, 1.9, z - 0.95, scene);
    box(mat.dark, 0.08, 0.55, 0.08, x + side * 0.15, 1.9, z + 0.95, scene);
  }

  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 2 - i * 16;
    box(mat.metal, 1.05, 1.05, 0.7, side * 4.95, 0.58, z, scene);
    box(mat.dark, 1.1, 0.08, 0.74, side * 4.95, 1.12, z, scene);
    box(mat.rust, 0.9, 0.7, 0.55, side * 4.95, 0.5, z, scene);
    box(mat.warning, 1.0, 0.05, 0.05, side * 4.95, 0.85, z + 0.36, scene);
    box(mat.ember, 0.08, 0.08, 0.04, side * 4.55, 0.95, z + 0.32, scene);
  }

  const wireGeo = new THREE.CylinderGeometry(0.018, 0.018, 9.4, 4);
  wireGeo.rotateZ(Math.PI / 2);
  const wires = new THREE.InstancedMesh(wireGeo, mat.dark, 14);
  for (let i = 0; i < 14; i++) {
    dummy.position.set(0, 5.4 + (i % 3) * 0.18, 6 - i * 9.2);
    dummy.rotation.set(0, 0, i % 2 ? 0.08 : -0.06);
    dummy.updateMatrix();
    wires.setMatrixAt(i, dummy.matrix);
  }
  scene.add(wires);
  dummy.rotation.set(0, 0, 0);

  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -4 - i * 20;
    box(mat.dark, 0.16, 3.4, 0.16, side * 3.15, 1.75, z, scene);
    box(mat.metal, 0.7, 0.12, 0.22, side * 2.85, 3.35, z, scene);
    box(mat.ember, 0.1, 0.18, 0.1, side * 2.55, 3.2, z + 0.08, scene);
    box(mat.warning, 0.1, 0.18, 0.1, side * 2.55, 3.2, z - 0.08, scene);
    box(mat.dark, 0.22, 0.35, 0.22, side * 3.15, 0.22, z, scene);
  }

  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 5 - i * 13;
    box(mat.dark, 0.08, 2.6, 0.08, side * 6.15, 1.4, z, scene);
    box(mat.metal, 0.22, 0.18, 0.22, side * 6.15, 2.75, z, scene);
    box(mat.rust, 0.16, 0.4, 0.16, side * 6.15, 0.28, z, scene);
    cyl(mat.dark, 0.012, 0.012, 1.4, side * 6.15, 2.9, z + 0.55, scene, 1.15);
  }

  for (let i = 0; i < 7; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -10 - i * 15;
    box(mat.rust, 0.55, 1.15, 0.08, side * 5.85, 1.5, z, scene);
    box(mat.dark, 0.48, 0.95, 0.04, side * 5.82, 1.5, z + side * 0.05, scene);
    box(mat.ember, 0.12, 0.08, 0.04, side * 5.78, 1.95, z + side * 0.06, scene);
  }
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

export function createWalkMark() {
  const g = new THREE.Group();
  g.name = "walkMark";
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.46, 28),
    new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  g.add(ring);
  const mid = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.2, 20),
    new THREE.MeshBasicMaterial({
      color: 0xe85d04,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  mid.rotation.x = -Math.PI / 2;
  mid.position.y = 0.01;
  g.add(mid);
  const pin = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.28, 8),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, toneMapped: false }),
  );
  pin.position.y = 0.28;
  g.add(pin);
  g.visible = false;
  return g;
}

export function createExtractPad() {
  const g = new THREE.Group();
  g.name = "extractPad";
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.05, 1.55, 36),
    new THREE.MeshBasicMaterial({
      color: 0x5eead4,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  g.add(ring);
  const inner = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.52, 24),
    new THREE.MeshBasicMaterial({
      color: 0xe85d04,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.02;
  g.add(inner);
  const gem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.12, 0),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, toneMapped: false }),
  );
  gem.position.y = 0.42;
  g.add(gem);
  g.visible = false;
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
  const floor = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.08, 8, 28), mat.voidCore);
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -2.15;
  g.add(floor);
  box(mat.metal, 1.3, 4.4, 0.7, 0, 2.2, -2.7, g);
  box(mat.metal, 1.3, 4.4, 0.7, 0, 2.2, 2.7, g);
  box(mat.dark, 1.5, 0.22, 0.9, 0, 0.12, -2.7, g);
  box(mat.dark, 1.5, 0.22, 0.9, 0, 0.12, 2.7, g);
  box(mat.metal, 0.35, 0.55, 0.35, 0.2, 4.55, -2.7, g);
  box(mat.metal, 0.35, 0.55, 0.35, 0.2, 4.55, 2.7, g);
  box(mat.neon, 0.12, 3.6, 0.12, 0.4, 2.0, -2.7, g);
  box(mat.neon, 0.12, 3.6, 0.12, 0.4, 2.0, 2.7, g);
  box(mat.dark, 1.6, 0.35, 0.9, 0, 4.4, -2.7, g);
  box(mat.dark, 1.6, 0.35, 0.9, 0, 4.4, 2.7, g);
  box(mat.voidCore, 0.18, 0.18, 5.6, 0, 4.55, 0, g);
  box(mat.metal, 0.55, 1.8, 0.55, 0.3, 0.95, -1.6, g);
  box(mat.metal, 0.55, 1.8, 0.55, 0.3, 0.95, 1.6, g);
  box(mat.warning, 0.4, 0.08, 0.4, 0.3, 1.9, -1.6, g);
  box(mat.warning, 0.4, 0.08, 0.4, 0.3, 1.9, 1.6, g);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    box(mat.metal, 0.12, 0.22, 0.08, Math.sin(a) * 2.5, 0.2 + (i % 2) * 0.15, Math.cos(a) * 2.5, g);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    sph(mat.voidCore, 0.07, Math.sin(a) * 2.15, 1.1 + (i % 3) * 0.55, Math.cos(a) * 2.15, g, 6);
  }
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
  box(mat.dark, 0.06, 0.05, 0.06, 0, 0.12, 0, g);
  box(mat.warning, 0.04, 0.02, 0.04, 0, 0.15, 0, g);
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
  const hot = new THREE.MeshBasicMaterial({
    color: 0xfff4d6,
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
    depthWrite: false,
  });
  const a = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), mat);
  const b = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), mat);
  b.rotation.y = Math.PI / 2;
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), hot);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 8), mat);
  cone.rotation.x = Math.PI / 2;
  cone.position.z = 0.14;
  g.add(a);
  g.add(b);
  g.add(core);
  g.add(cone);
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

type ArmorStyle = "ember" | "rail" | "sealed" | "assault" | "servo" | "strider" | "void" | "issue";

function armorStyle(name: string): ArmorStyle {
  const n = name.toLowerCase();
  if (n.includes("ember")) return "ember";
  if (n.includes("rail")) return "rail";
  if (n.includes("sealed")) return "sealed";
  if (n.includes("assault") || n.includes("hardened")) return "assault";
  if (n.includes("servo")) return "servo";
  if (n.includes("strider")) return "strider";
  if (n.includes("void") || n.includes("null")) return "void";
  return "issue";
}

function kitTint(rarity: Rarity, glow = 0.28) {
  return new THREE.MeshStandardMaterial({
    color: rarityHex(rarity),
    metalness: 0.52,
    roughness: 0.36,
    emissive: rarityHex(rarity),
    emissiveIntensity: glow,
  });
}

function kitGroup() {
  const g = new THREE.Group();
  g.userData.kit = true;
  return g;
}

function deckMark(text: string, color: string, w = 512, h = 128) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, w, h);
  g.fillStyle = color;
  g.font = `700 ${Math.floor(h * 0.46)}px "IBM Plex Mono", ui-monospace, monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function vistaTex() {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 384;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, 384);
  sky.addColorStop(0, "#05080f");
  sky.addColorStop(0.55, "#0a1220");
  sky.addColorStop(1, "#1a2430");
  g.fillStyle = sky;
  g.fillRect(0, 0, 768, 384);
  const planet = g.createRadialGradient(250, 400, 20, 250, 430, 210);
  planet.addColorStop(0, "#a8d4ee");
  planet.addColorStop(0.22, "#4a90b0");
  planet.addColorStop(0.48, "#2a6280");
  planet.addColorStop(0.72, "#163040");
  planet.addColorStop(1, "#070b12");
  g.fillStyle = planet;
  g.beginPath();
  g.arc(250, 430, 210, 0, Math.PI * 2);
  g.fill();
  const limb = g.createRadialGradient(250, 400, 160, 250, 400, 230);
  limb.addColorStop(0, "rgba(140,210,255,0)");
  limb.addColorStop(1, "rgba(160,220,255,0.45)");
  g.fillStyle = limb;
  g.beginPath();
  g.arc(250, 430, 220, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#2f6a48";
  g.globalAlpha = 0.5;
  g.beginPath();
  g.ellipse(210, 390, 70, 28, -0.4, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(300, 410, 40, 16, 0.3, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 0.35;
  g.fillStyle = "#d8c4a0";
  for (let i = 0; i < 18; i++) {
    g.fillRect(430 + Math.random() * 80, 300 + Math.random() * 50, 2, 2);
  }
  g.globalAlpha = 0.22;
  g.fillStyle = "#c8d8e8";
  g.beginPath();
  g.ellipse(180, 220, 120, 14, -0.12, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  for (let i = 0; i < 140; i++) {
    const a = 0.35 + Math.random() * 0.65;
    g.fillStyle = `rgba(236,244,255,${a})`;
    g.fillRect(Math.random() * 768, Math.random() * 250, Math.random() > 0.86 ? 2 : 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function hazardTex() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 32;
  const g = c.getContext("2d")!;
  g.fillStyle = "#111318";
  g.fillRect(0, 0, 128, 32);
  g.fillStyle = "#e8b423";
  for (let i = -32; i < 160; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 10, 0);
    g.lineTo(i + 26, 32);
    g.lineTo(i + 16, 32);
    g.closePath();
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 1);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function stripKitChildren(obj: THREE.Object3D) {
  const kill = obj.children.filter((c) => c.userData.kit);
  for (const c of kill) obj.remove(c);
}

export function applyArmorKits(
  rig: PlayerRig,
  mat: Materials,
  items: InvItem[],
  equipped: Record<ArmorSlot, string | null>,
) {
  while (rig.kits.children.length) rig.kits.remove(rig.kits.children[0]);
  stripKitChildren(rig.head);
  stripKitChildren(rig.torso);
  stripKitChildren(rig.leftArm);
  stripKitChildren(rig.rightArm);
  stripKitChildren(rig.leftForearm);
  stripKitChildren(rig.rightForearm);
  stripKitChildren(rig.leftThigh);
  stripKitChildren(rig.rightThigh);
  stripKitChildren(rig.leftShin);
  stripKitChildren(rig.rightShin);
  const piece = (slot: ArmorSlot) => items.find((i) => i.uid === equipped[slot]);
  const helm = piece("helm");
  if (helm) {
    const g = kitGroup();
    const tint = kitTint(helm.rarity, 0.34);
    const style = armorStyle(helm.name);
    box(mat.metal, 0.38, 0.1, 0.36, 0, 0.26, 0, g);
    box(mat.armor, 0.34, 0.08, 0.22, 0, 0.22, -0.08, g);
    box(mat.dark, 0.1, 0.14, 0.14, 0.18, 0.16, 0.06, g);
    box(mat.dark, 0.1, 0.14, 0.14, -0.18, 0.16, 0.06, g);
    box(tint, 0.28, 0.05, 0.1, 0, 0.12, 0.2, g);
    if (style === "ember") {
      box(mat.ember, 0.3, 0.07, 0.08, 0, 0.11, 0.22, g);
      box(mat.ember, 0.08, 0.16, 0.08, 0, 0.3, -0.04, g);
      sph(mat.ember, 0.02, 0.16, 0.22, 0.12, g, 6);
      sph(mat.ember, 0.02, -0.16, 0.22, 0.12, g, 6);
    } else if (style === "sealed") {
      box(mat.dark, 0.3, 0.16, 0.12, 0, 0.1, 0.18, g);
      box(mat.metal, 0.22, 0.04, 0.06, 0, 0.16, 0.24, g);
      box(mat.armor, 0.2, 0.08, 0.16, 0, 0.0, 0.16, g);
    } else if (style === "void") {
      box(mat.voidCore, 0.26, 0.04, 0.08, 0, 0.12, 0.22, g);
      cyl(mat.voidCore, 0.012, 0.01, 0.2, 0.14, 0.34, 0.0, g, 0.25);
      sph(mat.neon, 0.016, 0.14, 0.44, 0.04, g, 6);
    } else {
      box(mat.visor, 0.22, 0.04, 0.05, 0, 0.11, 0.22, g);
      box(mat.neon, 0.2, 0.01, 0.01, 0, 0.11, 0.24, g);
      cyl(mat.dark, 0.01, 0.01, 0.16, 0.14, 0.32, -0.02, g, 0.35);
      box(mat.armor, 0.32, 0.08, 0.2, 0, -0.02, 0.14, g);
      box(mat.metal, 0.1, 0.06, 0.12, 0.16, 0.22, 0.02, g);
    }
    box(tint, 0.14, 0.04, 0.06, 0, 0.08, 0.22, g);
    rig.head.add(g);
  }
  const chest = piece("chest");
  if (chest) {
    const g = kitGroup();
    const tint = kitTint(chest.rarity, 0.26);
    const style = armorStyle(chest.name);
    box(mat.metal, 0.72, 0.24, 0.2, 0, 0.2, 0.24, g);
    box(tint, 0.54, 0.1, 0.1, 0, 0.32, 0.32, g);
    box(mat.armor, 0.6, 0.12, 0.14, 0, 0.06, 0.28, g);
    box(mat.armor, 0.26, 0.18, 0.14, 0.34, 0.28, 0.16, g);
    box(mat.armor, 0.26, 0.18, 0.14, -0.34, 0.28, 0.16, g);
    for (let i = 0; i < 3; i++) box(mat.dark, 0.42, 0.025, 0.06, 0, 0.1 + i * 0.06, 0.32, g);
    if (style === "assault") {
      box(mat.metal, 0.78, 0.16, 0.16, 0, 0.4, 0.18, g);
      box(tint, 0.36, 0.16, 0.12, 0, 0.18, 0.34, g);
      box(mat.warning, 0.12, 0.04, 0.14, 0.22, 0.38, 0.24, g);
    } else if (style === "ember") {
      box(mat.ember, 0.16, 0.08, 0.08, 0, 0.2, 0.36, g);
      sph(mat.ember, 0.04, 0, 0.16, 0.36, g, 8);
    } else if (style === "void") {
      box(mat.voidCore, 0.18, 0.1, 0.08, 0, 0.2, 0.36, g);
      box(mat.neon, 0.5, 0.015, 0.015, 0, 0.08, 0.34, g);
    } else {
      box(mat.ember, 0.08, 0.04, 0.05, 0, 0.18, 0.34, g);
      box(mat.neon, 0.014, 0.22, 0.014, 0.16, 0.2, 0.34, g);
      box(mat.neon, 0.014, 0.22, 0.014, -0.16, 0.2, 0.34, g);
      box(mat.metal, 0.62, 0.1, 0.12, 0, 0.38, 0.18, g);
    }
    rig.torso.add(g);
  }
  const arms = piece("arms");
  if (arms) {
    const tint = kitTint(arms.rarity, 0.22);
    const style = armorStyle(arms.name);
    const dressArm = (side: number, upper: THREE.Object3D, fore: THREE.Object3D) => {
      const u = kitGroup();
      box(tint, 0.24, 0.14, 0.26, 0.1 * side, 0.04, 0.1, u);
      box(mat.metal, 0.16, 0.1, 0.16, 0.14 * side, 0.14, 0.08, u);
      box(mat.dark, 0.1, 0.1, 0.12, 0.16 * side, -0.08, 0.14, u);
      if (style === "servo") {
        cyl(mat.metal, 0.02, 0.02, 0.16, 0.18 * side, -0.02, 0.16, u, 1.15);
        box(mat.warning, 0.05, 0.05, 0.06, 0.18 * side, 0.08, 0.18, u);
      } else if (style === "ember") {
        sph(mat.ember, 0.022, 0.18 * side, 0.08, 0.2, u, 6);
      }
      upper.add(u);
      const f = kitGroup();
      box(tint, 0.18, 0.14, 0.22, 0.06 * side, -0.26, 0.1, f);
      box(mat.metal, 0.12, 0.1, 0.14, 0.08 * side, -0.16, 0.16, f);
      box(mat.dark, 0.1, 0.12, 0.12, 0.08 * side, -0.36, 0.16, f);
      if (style === "servo") {
        box(mat.metal, 0.14, 0.08, 0.16, 0.06 * side, -0.42, 0.18, f);
        for (let i = 0; i < 4; i++) box(mat.dark, 0.02, 0.03, 0.06, (0.02 + i * 0.03) * side, -0.5, 0.22, f);
      } else {
        box(mat.neon, 0.01, 0.1, 0.01, 0.12 * side, -0.2, 0.18, f);
        box(mat.armor, 0.14, 0.08, 0.16, 0.06 * side, -0.4, 0.16, f);
      }
      fore.add(f);
    };
    dressArm(-1, rig.leftArm, rig.leftForearm);
    dressArm(1, rig.rightArm, rig.rightForearm);
  }
  const legs = piece("legs");
  if (legs) {
    const tint = kitTint(legs.rarity, 0.22);
    const style = armorStyle(legs.name);
    const dressLeg = (side: number, thigh: THREE.Object3D, shin: THREE.Object3D) => {
      const t = kitGroup();
      box(tint, 0.24, 0.2, 0.26, 0, -0.2, 0.12, t);
      box(mat.metal, 0.18, 0.08, 0.2, 0, -0.32, 0.16, t);
      box(mat.dark, 0.1, 0.12, 0.1, 0.12 * side, -0.28, 0.1, t);
      thigh.add(t);
      const s = kitGroup();
      box(tint, 0.2, 0.18, 0.18, 0, -0.14, 0.1, s);
      box(mat.armor, 0.18, 0.1, 0.2, 0, -0.3, 0.16, s);
      box(mat.rubber, 0.16, 0.05, 0.22, 0, -0.38, 0.16, s);
      if (style === "rail") {
        box(mat.voidCore, 0.04, 0.2, 0.04, 0.1 * side, -0.16, 0.16, s);
        box(mat.neon, 0.014, 0.16, 0.014, 0.1 * side, -0.18, 0.18, s);
      } else if (style === "strider") {
        box(mat.metal, 0.14, 0.04, 0.22, 0, -0.08, 0.14, s);
        box(mat.warning, 0.04, 0.1, 0.04, 0.1 * side, -0.2, 0.16, s);
      } else {
        box(mat.warning, 0.04, 0.08, 0.04, 0.1 * side, -0.18, 0.16, s);
      }
      shin.add(s);
    };
    dressLeg(-1, rig.leftThigh, rig.leftShin);
    dressLeg(1, rig.rightThigh, rig.rightShin);
  }
}

export function createShipInterior(mat: Materials) {
  const root = new THREE.Group();
  root.name = "ship";

  const hull = new THREE.MeshStandardMaterial({
    color: 0x4a5562,
    metalness: 0.68,
    roughness: 0.36,
    envMapIntensity: 1.15,
  });
  bindPbr(hull, undefined, { metal: true });
  const deck = new THREE.MeshStandardMaterial({
    color: 0x6e7682,
    metalness: 0.52,
    roughness: 0.4,
    envMapIntensity: 0.95,
  });
  bindPbr(deck, undefined, { metal: true });
  const plate = new THREE.MeshStandardMaterial({
    color: 0x525b66,
    metalness: 0.66,
    roughness: 0.34,
    envMapIntensity: 1.05,
  });
  const grate = new THREE.MeshStandardMaterial({
    color: 0x2a3038,
    metalness: 0.7,
    roughness: 0.28,
    envMapIntensity: 1.15,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x0a2430,
    emissive: 0x146c80,
    emissiveIntensity: 0.55,
    metalness: 0.15,
    roughness: 0.08,
    transparent: true,
    opacity: 0.62,
    envMapIntensity: 1.8,
  });
  const hazard = new THREE.MeshStandardMaterial({
    map: hazardTex(),
    metalness: 0.2,
    roughness: 0.55,
  });

  const stars = new THREE.Mesh(
    new THREE.SphereGeometry(90, 28, 18),
    new THREE.MeshBasicMaterial({ color: 0x101820, side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  root.add(stars);
  for (let i = 0; i < 64; i++) {
    const speck = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xe8f4ff, toneMapped: false, fog: false }),
    );
    const a = (i / 64) * Math.PI * 2;
    const b = (((i * 19) % 50) / 50) * Math.PI - Math.PI / 2;
    speck.position.set(Math.cos(a) * 48 * Math.cos(b), 8 + Math.sin(b) * 26, Math.sin(a) * 48 * Math.cos(b));
    root.add(speck);
  }

  const floor = new THREE.Mesh(new THREE.BoxGeometry(24, 0.28, 20.4), deck);
  floor.position.y = -0.14;
  floor.receiveShadow = true;
  root.add(floor);

  for (let x = -10; x <= 10; x += 2.4) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 19.4), plate);
    seam.position.set(x, 0.01, 0);
    root.add(seam);
  }
  for (let z = -8.4; z <= 8.4; z += 2.4) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(23.2, 0.02, 0.04), plate);
    seam.position.set(0, 0.012, z);
    root.add(seam);
  }
  for (const [x, z] of [
    [-7.2, 4.6],
    [7.4, 4.8],
    [-7.6, -6.2],
    [3.2, 6.2],
  ] as const) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.03, 1.5), grate);
    g.position.set(x, 0.02, z);
    g.receiveShadow = true;
    root.add(g);
  }

  const tape = new THREE.Mesh(new THREE.BoxGeometry(22.6, 0.03, 0.22), hazard);
  tape.position.set(0, 0.03, 8.55);
  root.add(tape);
  const tapeAft = tape.clone();
  tapeAft.position.z = -8.55;
  root.add(tapeAft);

  const mark = (tex: THREE.Texture, x: number, z: number, s = 2.4) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(s, s * 0.28),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.04, z);
    root.add(m);
  };
  mark(deckMark("CHIMERA", "#e85d04"), -4.6, 2.4, 3.4);
  mark(deckMark("READY DECK  ·  PAD-01", "#d8c4a0", 768, 96), 0, -2.6, 4.2);
  mark(deckMark("CNC-A", "#5eead4"), 4.2, -2.2, 1.8);
  mark(deckMark("EVA-03", "#9aa4b2"), -6.2, -1.1, 1.6);

  const run = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.04, 16.4),
    new THREE.MeshBasicMaterial({ color: 0xe85d04, toneMapped: false }),
  );
  run.position.set(0, 0.03, 0);
  root.add(run);
  const runL = run.clone();
  runL.position.x = -4.8;
  root.add(runL);
  const runR = run.clone();
  runR.position.x = 4.8;
  root.add(runR);

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.15, 2.32, 0.2, 32),
    new THREE.MeshStandardMaterial({
      color: 0x4a3224,
      emissive: 0xe85d04,
      emissiveIntensity: 0.55,
      metalness: 0.32,
      roughness: 0.44,
    }),
  );
  pad.position.y = 0.12;
  pad.receiveShadow = true;
  root.add(pad);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 32),
    new THREE.MeshBasicMaterial({ color: 0xff8a3a, toneMapped: false }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.23;
  root.add(disc);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.18, 0.045, 8, 40),
    new THREE.MeshBasicMaterial({ color: 0xffb070, toneMapped: false }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.24;
  root.add(ring);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    box(plate, 0.34, 0.08, 0.16, Math.cos(a) * 2.05, 0.18, Math.sin(a) * 2.05, root, 0, -a, 0);
  }

  const path = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.035, 4.6),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, toneMapped: false }),
  );
  path.position.set(2.9, 0.03, -2.1);
  path.rotation.y = -0.48;
  root.add(path);

  const wallH = 6.05;
  for (const x of [-11.15, 11.15]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.42, wallH, 20.6), hull);
    wall.position.set(x, wallH * 0.5, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    root.add(wall);
    const kick = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 20.2), hazard);
    kick.position.set(x + (x > 0 ? -0.22 : 0.22), 0.14, 0);
    root.add(kick);
    for (let z = -8.4; z <= 8.4; z += 2.8) {
      box(plate, 0.28, 5.7, 0.22, x + (x > 0 ? -0.18 : 0.18), 2.9, z, root);
      cyl(mat.metal, 0.045, 0.045, 5.2, x + (x > 0 ? -0.38 : 0.38), 2.7, z + 0.55, root);
      box(mat.dark, 0.12, 0.12, 2.2, x + (x > 0 ? -0.32 : 0.32), 4.6, z, root);
      const inset = x > 0 ? -0.28 : 0.28;
      box(plate, 0.06, 1.55, 2.05, x + inset, 1.55, z + 1.35, root);
      box(grate, 0.04, 1.15, 1.65, x + inset * 1.15, 1.55, z + 1.35, root);
      box(plate, 0.06, 1.35, 1.85, x + inset, 3.85, z + 1.35, root);
      box(mat.dark, 0.08, 0.55, 0.85, x + inset * 1.2, 1.05, z + 0.2, root);
      box(z % 5.6 === 0 ? mat.neon : mat.ember, 0.03, 0.12, 0.12, x + inset * 1.35, 1.15, z + 0.2, root);
      box(mat.metal, 0.1, 0.1, 0.7, x + inset, 2.85, z + 1.35, root);
    }
    const walk = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.08, 18.6), plate);
    walk.position.set(x + (x > 0 ? -0.85 : 0.85), 3.15, 0);
    walk.castShadow = true;
    root.add(walk);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 18.6), mat.metal);
    rail.position.set(x + (x > 0 ? -1.35 : 1.35), 3.42, 0);
    root.add(rail);
  }

  const bow = new THREE.Mesh(new THREE.BoxGeometry(22.8, wallH, 0.42), hull);
  bow.position.set(0, wallH * 0.5, 9.95);
  bow.castShadow = true;
  root.add(bow);

  box(hull, 22.8, 1.15, 0.42, 0, 0.55, -9.95, root);
  box(hull, 22.8, 1.05, 0.42, 0, 5.55, -9.95, root);
  box(hull, 2.4, 4.4, 0.42, -10.2, 3.1, -9.95, root);
  box(hull, 2.4, 4.4, 0.42, 10.2, 3.1, -9.95, root);
  box(plate, 18.6, 0.2, 0.28, 0, 3.55, -9.78, root);
  box(plate, 0.2, 3.6, 0.28, -3.45, 3.55, -9.78, root);
  box(plate, 0.2, 3.6, 0.28, 3.45, 3.55, -9.78, root);
  const paneGlass = glass.clone();
  paneGlass.opacity = 0.28;
  paneGlass.emissiveIntensity = 0.1;
  for (const [x, y] of [
    [-5.15, 2.35],
    [0, 2.35],
    [5.15, 2.35],
    [-5.15, 4.65],
    [0, 4.65],
    [5.15, 4.65],
  ] as const) {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(2.85, 1.58, 0.05), paneGlass);
    pane.position.set(x, y, -9.72);
    root.add(pane);
  }
  box(hazard, 10.2, 0.16, 0.12, 0, 1.28, -9.7, root);
  const vista = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 6.4),
    new THREE.MeshBasicMaterial({ map: vistaTex(), fog: false }),
  );
  vista.position.set(0, 3.4, -12.4);
  root.add(vista);
  mark(deckMark("AFT VIEW  ·  EARTH 2172", "#7ec8d4", 768, 96), 0, -8.55, 3.6);

  const lock = new THREE.Group();
  lock.position.set(0, 0, 9.55);
  box(plate, 3.4, 3.6, 0.5, 0, 1.9, 0, lock);
  const hatch = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.18, 24), mat.metal);
  hatch.rotation.x = Math.PI / 2;
  hatch.position.set(0, 1.7, 0.2);
  lock.add(hatch);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.04, 8, 16), mat.ember);
  wheel.position.set(0, 1.7, 0.32);
  lock.add(wheel);
  box(hazard, 3.5, 0.14, 0.14, 0, 0.28, 0.1, lock);
  box(mat.warning, 0.16, 0.16, 0.1, -1.35, 3.35, 0.2, lock);
  box(mat.neon, 0.16, 0.16, 0.1, 1.35, 3.35, 0.2, lock);
  root.add(lock);

  const ceil = new THREE.Mesh(new THREE.BoxGeometry(22.8, 0.2, 20.2), hull);
  ceil.position.y = 6.15;
  ceil.receiveShadow = true;
  root.add(ceil);
  for (let z = -7.2; z <= 7.2; z += 2.4) {
    box(plate, 21.6, 0.18, 0.28, 0, 5.95, z, root);
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(16.5, 0.05, 0.12),
      new THREE.MeshBasicMaterial({ color: 0xffd2a8, toneMapped: false }),
    );
    strip.position.set(0, 5.84, z);
    root.add(strip);
  }
  cyl(mat.dark, 0.07, 0.07, 18.2, 3.55, 5.7, 0, root, Math.PI / 2, 0, 8);
  cyl(mat.metal, 0.05, 0.05, 18.2, -3.45, 5.66, 0, root, Math.PI / 2, 0, 8);
  box(mat.metal, 20.4, 0.16, 0.4, 0, 5.55, 0, root);
  box(mat.ember, 0.55, 0.28, 0.7, 0, 5.35, 0, root);
  box(plate, 8.4, 0.35, 0.55, 1.2, 4.85, 1.6, root);
  box(mat.dark, 7.6, 0.12, 0.22, 1.2, 4.58, 1.6, root);
  for (let i = 0; i < 5; i++) box(mat.metal, 0.18, 0.18, 0.7, -2.2 + i * 1.7, 4.85, 1.85, root);

  const cnc = new THREE.Group();
  cnc.position.set(5.4, 0, -4.4);
  cnc.name = "cnc";
  box(hull, 3.2, 0.34, 2.6, 0, 0.22, 0, cnc);
  box(mat.metal, 2.7, 0.1, 2.0, 0, 0.44, 0, cnc);
  const bed = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 0.05, 1.25),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, toneMapped: false }),
  );
  bed.position.set(0, 0.5, 0);
  cnc.add(bed);
  box(hull, 0.16, 2.7, 0.16, -1.4, 1.6, -1.05, cnc);
  box(hull, 0.16, 2.7, 0.16, 1.4, 1.6, -1.05, cnc);
  box(hull, 0.16, 2.7, 0.16, -1.4, 1.6, 1.05, cnc);
  box(hull, 0.16, 2.7, 0.16, 1.4, 1.6, 1.05, cnc);
  box(mat.metal, 3.1, 0.14, 0.2, 0, 2.95, 0, cnc);
  box(mat.voidCore, 0.2, 0.2, 2.3, 0, 2.78, 0, cnc);
  box(plate, 0.7, 1.15, 0.45, -1.85, 1.05, 1.15, cnc);
  box(mat.neon, 0.42, 0.22, 0.04, -1.85, 1.35, 1.38, cnc);
  box(mat.ember, 0.08, 0.08, 0.06, -1.85, 0.72, 1.4, cnc);
  box(plate, 0.55, 0.85, 0.4, 1.85, 0.9, 1.1, cnc);
  box(mat.dark, 0.42, 0.18, 0.04, 1.85, 1.15, 1.32, cnc);
  box(mat.metal, 0.18, 0.18, 0.18, 0.55, 0.72, 0.7, cnc);
  box(mat.warning, 2.4, 0.04, 0.08, 0, 0.48, 1.15, cnc);
  for (let i = 0; i < 4; i++) box(mat.metal, 0.08, 0.08, 0.22, -0.75 + i * 0.5, 0.58, -0.7, cnc);
  box(mat.dark, 1.6, 0.08, 0.12, 0, 2.55, 0.8, cnc);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.3), mat.ember);
  head.position.set(0, 1.18, 0);
  cnc.add(head);
  const hologram = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.82, toneMapped: false }),
  );
  hologram.position.set(0, 0.74, 0);
  hologram.name = "cncHolo";
  cnc.add(hologram);
  const lamp = new THREE.PointLight(0x5eead4, 3.4, 10, 1.4);
  lamp.position.set(0, 1.85, 0);
  cnc.add(lamp);
  root.add(cnc);

  const rack = new THREE.Group();
  rack.position.set(-6.6, 0, -3.4);
  box(hull, 2.6, 2.8, 0.42, 0, 1.5, 0, rack);
  for (let i = 0; i < 5; i++) {
    box(mat.metal, 0.1, 1.55, 0.07, -1.0 + i * 0.5, 1.4, 0.18, rack);
    box(mat.dark, 0.08, 0.08, 0.22, -1.0 + i * 0.5, 2.15, 0.28, rack);
    box(mat.dark, 0.06, 0.42, 0.16, -1.0 + i * 0.5, 1.55, 0.28, rack);
    box(i % 2 ? mat.ember : mat.neon, 0.03, 0.03, 0.04, -1.0 + i * 0.5, 1.85, 0.36, rack);
  }
  box(hazard, 2.6, 0.08, 0.1, 0, 0.18, 0.2, rack);
  box(plate, 2.5, 0.06, 0.28, 0, 0.72, 0.22, rack);
  box(plate, 2.5, 0.06, 0.28, 0, 2.05, 0.22, rack);
  box(mat.warning, 2.4, 0.03, 0.04, 0, 2.55, 0.24, rack);
  root.add(rack);

  const lockers = new THREE.Group();
  lockers.position.set(-7.2, 0, 2.4);
  for (let i = 0; i < 4; i++) {
    box(plate, 0.72, 2.15, 0.55, i * 0.78, 1.15, 0, lockers);
    box(mat.dark, 0.5, 0.08, 0.04, i * 0.78, 1.7, 0.29, lockers);
    box(i % 2 ? mat.neon : mat.ember, 0.08, 0.08, 0.04, i * 0.78, 2.05, 0.3, lockers);
    box(mat.metal, 0.08, 0.18, 0.06, i * 0.78 + 0.22, 1.15, 0.3, lockers);
    box(mat.dark, 0.55, 0.9, 0.04, i * 0.78, 0.85, 0.28, lockers);
    box(mat.warning, 0.12, 0.03, 0.04, i * 0.78 - 0.18, 1.95, 0.3, lockers);
  }
  box(plate, 3.2, 0.08, 0.6, 1.17, 2.28, 0, lockers);
  box(mat.metal, 3.1, 0.04, 0.12, 1.17, 2.34, 0.22, lockers);
  root.add(lockers);

  const crateA = createCrate(mat);
  crateA.position.set(-5.2, 0, 5.1);
  crateA.rotation.y = 0.2;
  root.add(crateA);
  const crateB = createCrate(mat);
  crateB.position.set(-3.9, 0, 5.7);
  crateB.rotation.y = -0.35;
  root.add(crateB);
  const barrel = createBarrel(mat);
  barrel.position.set(7.4, 0, 5.2);
  root.add(barrel);

  for (let i = 0; i < 3; i++) {
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.28 + i * 0.05, 0.035, 6, 16, Math.PI * 1.2), mat.rubber);
    hose.rotation.x = Math.PI / 2;
    hose.position.set(2.15 + i * 0.12, 0.08, 1.8);
    root.add(hose);
  }

  const bench = new THREE.Group();
  bench.position.set(3.15, 0, 1.55);
  box(plate, 1.55, 0.08, 0.72, 0, 0.92, 0, bench);
  box(hull, 0.1, 0.92, 0.1, -0.65, 0.46, 0.26, bench);
  box(hull, 0.1, 0.92, 0.1, 0.65, 0.46, 0.26, bench);
  box(hull, 0.1, 0.92, 0.1, -0.65, 0.46, -0.26, bench);
  box(hull, 0.1, 0.92, 0.1, 0.65, 0.46, -0.26, bench);
  box(mat.metal, 0.42, 0.16, 0.28, -0.35, 1.04, 0.08, bench);
  box(mat.dark, 0.22, 0.12, 0.18, 0.38, 1.02, -0.05, bench);
  box(mat.ember, 0.06, 0.06, 0.06, 0.52, 1.1, 0.12, bench);
  root.add(bench);

  const tool = new THREE.Group();
  tool.position.set(1.65, 0, 1.15);
  box(mat.dark, 0.55, 0.28, 0.38, 0, 0.16, 0, tool);
  box(mat.metal, 0.5, 0.04, 0.34, 0, 0.32, 0, tool);
  box(mat.warning, 0.5, 0.03, 0.04, 0, 0.18, 0.18, tool);
  root.add(tool);

  for (let i = 0; i < 5; i++) {
    const chev = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xe8b423, transparent: true, opacity: 0.7, toneMapped: false }),
    );
    chev.rotation.x = -Math.PI / 2;
    chev.rotation.z = -Math.PI / 4;
    chev.position.set(-1.15 + i * 0.42, 0.045, 2.35);
    root.add(chev);
  }
  for (let i = 0; i < 4; i++) {
    cyl(mat.rubber, 0.025, 0.025, 1.15, 0.35 + i * 0.08, 0.03, 0.2 - i * 0.35, root, Math.PI / 2, 0.35, 6);
  }

  for (let z = -4.8; z <= 4.8; z += 2.4) {
    box(plate, 0.55, 0.12, 0.55, 0, 5.72, z, root);
    box(mat.ember, 0.38, 0.04, 0.18, 0, 5.64, z, root);
  }

  box(plate, 2.2, 1.1, 0.16, -8.4, 2.4, -6.4, root, 0, 0.4, 0);
  box(mat.neon, 1.4, 0.55, 0.05, -8.35, 2.5, -6.28, root, 0, 0.4, 0);
  box(mat.ember, 0.1, 0.1, 0.06, -8.9, 2.05, -6.2, root);
  for (let i = 0; i < 4; i++) {
    cyl(mat.dark, 0.06, 0.06, 4.2, -3 + i * 2.1, 1.15, -9.35, root, Math.PI / 2, 0, 8);
  }
  for (let i = 0; i < 6; i++) {
    box(plate, 0.55, 0.7, 0.12, -9.7, 1.6 + (i % 3) * 0.85, -1.2 + Math.floor(i / 3) * 2.2, root);
    box(grate, 0.4, 0.45, 0.04, -9.62, 1.6 + (i % 3) * 0.85, -1.2 + Math.floor(i / 3) * 2.2, root);
  }
  box(mat.metal, 0.22, 0.22, 7.2, -9.55, 4.35, -2.4, root);
  box(mat.dark, 0.14, 0.14, 6.4, -9.35, 3.85, -1.8, root);
  for (let i = 0; i < 5; i++) {
    sph(mat.metal, 0.05, -9.45, 2.2 + i * 0.45, -4.6, root, 6);
  }

  const tanks = new THREE.Group();
  tanks.position.set(7.15, 0, 2.55);
  for (let i = 0; i < 3; i++) {
    cyl(mat.metal, 0.16, 0.16, 1.15, i * 0.42, 0.62, 0, tanks);
    sph(mat.dark, 0.12, i * 0.42, 1.22, 0, tanks, 8);
    box(i === 1 ? mat.ember : mat.neon, 0.05, 0.08, 0.03, i * 0.42, 0.85, 0.16, tanks);
  }
  root.add(tanks);

  const console = new THREE.Group();
  console.position.set(8.35, 0, 0.4);
  box(plate, 0.22, 1.55, 1.35, 0, 1.4, 0, console);
  box(mat.neon, 0.04, 0.55, 0.85, -0.14, 1.55, 0, console);
  box(mat.ember, 0.05, 0.08, 0.08, -0.14, 1.05, 0.35, console);
  box(mat.dark, 0.18, 0.22, 0.4, -0.08, 0.55, 0, console);
  root.add(console);

  const cable = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.03, 6, 18, Math.PI * 0.9), mat.rubber);
  cable.rotation.set(Math.PI / 2, 0.4, 0.2);
  cable.position.set(1.8, 0.04, 0.35);
  root.add(cable);
  for (let i = 0; i < 4; i++) {
    box(mat.warning, 0.55, 0.03, 0.08, -0.9 + i * 0.55, 0.05, -0.15, root);
  }
  box(plate, 0.7, 0.08, 0.7, 0.15, 2.85, 2.1, root);
  box(mat.ember, 0.42, 0.05, 0.22, 0.15, 2.78, 2.1, root);
  const deskLamp = new THREE.PointLight(0xffc58a, 2.4, 7, 1.6);
  deskLamp.position.set(0.15, 2.55, 2.1);
  root.add(deskLamp);

  const fill = new THREE.PointLight(0xffe0c0, 10, 24, 1);
  fill.position.set(0, 4.4, 0.8);
  root.add(fill);
  const rim = new THREE.PointLight(0xe85d04, 5.5, 16, 1.15);
  rim.position.set(-2.6, 2.6, 3.4);
  root.add(rim);
  const cncFill = new THREE.PointLight(0x5eead4, 5.2, 13, 1.2);
  cncFill.position.set(5.4, 2.8, -4.4);
  root.add(cncFill);
  const viewFill = new THREE.PointLight(0x4aa8bc, 3.2, 14, 1.4);
  viewFill.position.set(0, 3.4, -7.4);
  root.add(viewFill);

  const ops = new THREE.Group();
  ops.position.set(0, 0, -6.2);
  ops.name = "ops";
  box(plate, 2.4, 0.12, 1.6, 0, 0.86, 0, ops);
  box(hull, 0.1, 0.86, 0.1, -1.0, 0.43, 0.6, ops);
  box(hull, 0.1, 0.86, 0.1, 1.0, 0.43, 0.6, ops);
  box(hull, 0.1, 0.86, 0.1, -1.0, 0.43, -0.6, ops);
  box(hull, 0.1, 0.86, 0.1, 1.0, 0.43, -0.6, ops);
  box(mat.voidCore, 1.1, 0.04, 0.8, 0, 0.94, 0, ops);
  const opsHolo = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.78, toneMapped: false }),
  );
  opsHolo.position.set(0, 1.28, 0);
  opsHolo.name = "opsHolo";
  ops.add(opsHolo);
  box(mat.neon, 0.5, 0.04, 0.04, 0, 0.98, 0.7, ops);
  box(mat.warning, 1.6, 0.03, 0.06, 0, 0.9, 0.82, ops);
  mark(deckMark("OPS  ·  DISTRICTS", "#5eead4"), 0, -5.1, 2.4);
  const opsLamp = new THREE.PointLight(0x5eead4, 2.6, 8, 1.5);
  opsLamp.position.set(0, 1.7, -6.2);
  root.add(opsLamp);
  root.add(ops);

  const med = new THREE.Group();
  med.position.set(6.2, 0, 3.8);
  med.name = "medbay";
  box(plate, 1.8, 1.7, 0.7, 0, 0.95, 0, med);
  box(mat.ember, 0.7, 0.5, 0.08, 0, 1.2, 0.38, med);
  box(mat.dark, 0.55, 0.18, 0.08, 0, 0.7, 0.38, med);
  box(mat.warning, 1.6, 0.04, 0.08, 0, 0.18, 0.32, med);
  sph(mat.ember, 0.08, 0.55, 1.45, 0.28, med, 8);
  box(mat.metal, 0.2, 0.2, 0.2, -0.55, 1.35, 0.28, med);
  mark(deckMark("MEDBAY  ·  STIM", "#e85d04"), 6.2, 2.7, 1.8);
  const medLamp = new THREE.PointLight(0xe85d04, 2.2, 7, 1.5);
  medLamp.position.set(6.2, 1.8, 3.8);
  root.add(medLamp);
  root.add(med);

  root.userData.cnc = { x: 5.4, z: -4.4 };
  root.userData.ops = { x: 0, z: -6.2 };
  root.userData.med = { x: 6.2, z: 3.8 };
  root.userData.holo = hologram;
  return root;
}
