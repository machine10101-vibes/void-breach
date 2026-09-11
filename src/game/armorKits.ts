import * as THREE from "three";
import type { Materials, PlayerRig } from "./meshes";
import type { ArmorSlot, InvItem, Rarity } from "./types";

export type ArmorStyle = "issue" | "salvaged" | "ember" | "rail" | "sealed" | "assault" | "servo" | "strider" | "void";

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

function rarityHex(r: Rarity) {
  return r === "legendary" ? 0xfb923c : r === "rare" ? 0xc4b5fd : r === "magic" ? 0x60a5fa : 0xd6d3d1;
}

export function kitTint(rarity: Rarity, glow = 0.28) {
  return new THREE.MeshStandardMaterial({
    color: rarityHex(rarity),
    metalness: 0.52,
    roughness: 0.36,
    emissive: rarityHex(rarity),
    emissiveIntensity: glow,
  });
}

export function armorStyle(name: string): ArmorStyle {
  const n = name.toLowerCase();
  if (n.includes("ember")) return "ember";
  if (n.includes("rail")) return "rail";
  if (n.includes("sealed") || n.includes("lined")) return "sealed";
  if (n.includes("assault") || n.includes("hardened")) return "assault";
  if (n.includes("servo")) return "servo";
  if (n.includes("strider")) return "strider";
  if (n.includes("void") || n.includes("null")) return "void";
  if (n.includes("salvaged")) return "salvaged";
  return "issue";
}

type Palette = {
  plate: THREE.MeshStandardMaterial;
  glow: THREE.MeshStandardMaterial;
  accent: THREE.MeshStandardMaterial;
  light: THREE.MeshStandardMaterial;
  visor: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  rust: THREE.MeshStandardMaterial;
};

function stylePalette(mat: Materials, style: ArmorStyle, rarity: Rarity): Palette {
  const plate = mat.armor.clone();
  plate.color = plate.color.clone();
  const glow = kitTint(rarity, 0.24);
  const visor = mat.visor.clone();
  visor.emissive = mat.visor.emissive.clone();
  let accent = mat.metal;
  let light = mat.neon;
  if (style === "ember") {
    plate.color.setHex(0x6a3a24);
    plate.metalness = 0.42;
    plate.roughness = 0.48;
    visor.color.setHex(0x2a0c04);
    visor.emissive.setHex(0xff6a12);
    visor.emissiveIntensity = 5.2;
    accent = mat.ember;
    light = mat.visor;
  } else if (style === "void") {
    plate.color.setHex(0x243040);
    plate.metalness = 0.7;
    plate.roughness = 0.28;
    visor.color.setHex(0x021018);
    visor.emissive.setHex(0x22d3ee);
    visor.emissiveIntensity = 5.4;
    accent = mat.voidCore;
    light = mat.voidCore;
  } else if (style === "rail") {
    plate.color.setHex(0x3a4a52);
    visor.color.setHex(0x041418);
    visor.emissive.setHex(0x5eead4);
    visor.emissiveIntensity = 4.4;
    accent = mat.voidCore;
    light = mat.neon;
  } else if (style === "sealed") {
    plate.color.setHex(0x3e444c);
    plate.roughness = 0.5;
    visor.color.setHex(0x111318);
    visor.emissive.setHex(0x1a2228);
    visor.emissiveIntensity = 0.15;
    visor.metalness = 0.55;
    visor.roughness = 0.22;
    accent = mat.dark;
    light = mat.metal;
  } else if (style === "assault") {
    plate.color.setHex(0x6a5840);
    visor.emissiveIntensity = 3.2;
    accent = mat.warning;
    light = mat.warning;
  } else if (style === "servo") {
    plate.color.setHex(0x58564e);
    accent = mat.metal;
    light = mat.ember;
  } else if (style === "strider") {
    plate.color.setHex(0x5a5040);
    accent = mat.metal;
    light = mat.warning;
  } else if (style === "salvaged") {
    plate.color.setHex(0x6a4a34);
    plate.roughness = 0.72;
    plate.metalness = 0.38;
    visor.emissiveIntensity = 1.6;
    accent = mat.rust;
    light = mat.ember;
  } else {
    plate.color.setHex(0x5c6168);
    plate.metalness = 0.72;
    plate.roughness = 0.34;
    visor.emissiveIntensity = 3.4;
    accent = mat.metal;
    light = mat.neon;
  }
  return {
    plate,
    glow,
    accent,
    light,
    visor,
    dark: mat.dark,
    metal: mat.metal,
    rubber: mat.rubber,
    rust: mat.rust,
  };
}

function kitGroup() {
  const g = new THREE.Group();
  g.userData.kit = true;
  return g;
}

function glowBox(
  mat: THREE.Material,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  glows: THREE.Mesh[],
) {
  const m = box(mat, w, h, d, x, y, z, parent);
  m.userData.kitGlow = true;
  glows.push(m);
  return m;
}

export function buildHelmKit(mat: Materials, style: ArmorStyle, rarity: Rarity, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  sph(p.plate, 0.24, 0, 0.14, 0.0, g, 14);
  box(p.plate, 0.44, 0.22, 0.4, 0, 0.12, 0.04, g);
  box(p.dark, 0.42, 0.1, 0.38, 0, 0.26, 0.0, g);
  box(p.plate, 0.36, 0.12, 0.24, 0, 0.22, -0.12, g);
  box(p.plate, 0.16, 0.18, 0.2, 0.2, 0.12, 0.02, g);
  box(p.plate, 0.16, 0.18, 0.2, -0.2, 0.12, 0.02, g);
  box(p.dark, 0.24, 0.08, 0.18, 0, 0.0, 0.12, g);
  box(p.metal, 0.2, 0.06, 0.16, 0, 0.08, -0.2, g);
  cyl(p.dark, 0.016, 0.012, 0.22, 0.14, 0.36, -0.06, g, 0.35);
  glowBox(p.glow, 0.12, 0.03, 0.04, 0, 0.06, 0.22, g, glows);

  if (style === "ember") {
    glowBox(p.visor, 0.3, 0.07, 0.08, 0, 0.11, 0.2, g, glows);
    box(p.accent, 0.1, 0.26, 0.1, 0, 0.4, -0.04, g);
    sph(p.accent, 0.03, 0.16, 0.22, 0.12, g, 6);
    sph(p.accent, 0.03, -0.16, 0.22, 0.12, g, 6);
    box(p.dark, 0.12, 0.16, 0.12, 0.22, 0.18, -0.06, g);
  } else if (style === "sealed") {
    box(p.dark, 0.32, 0.16, 0.12, 0, 0.1, 0.18, g);
    box(p.metal, 0.2, 0.04, 0.08, 0, 0.16, 0.24, g);
    cyl(p.metal, 0.035, 0.035, 0.12, 0.14, 0.02, 0.16, g, Math.PI / 2);
    cyl(p.metal, 0.035, 0.035, 0.12, -0.14, 0.02, 0.16, g, Math.PI / 2);
    box(p.plate, 0.18, 0.1, 0.14, 0, -0.04, 0.16, g);
  } else if (style === "void") {
    glowBox(p.visor, 0.26, 0.05, 0.07, 0, 0.11, 0.21, g, glows);
    cyl(p.accent, 0.012, 0.008, 0.22, 0.14, 0.34, 0.0, g, 0.28);
    sph(p.light, 0.02, 0.14, 0.46, 0.04, g, 6);
    box(p.accent, 0.1, 0.08, 0.06, 0, 0.08, 0.22, g);
  } else if (style === "assault") {
    box(p.metal, 0.42, 0.1, 0.28, 0, 0.24, 0.04, g);
    glowBox(p.visor, 0.2, 0.04, 0.05, 0, 0.1, 0.22, g, glows);
    box(p.accent, 0.08, 0.03, 0.12, 0.16, 0.2, 0.1, g);
    box(p.accent, 0.08, 0.03, 0.12, -0.16, 0.2, 0.1, g);
  } else if (style === "salvaged") {
    box(p.rust, 0.16, 0.1, 0.12, 0.16, 0.16, 0.04, g);
    box(p.dark, 0.1, 0.08, 0.16, -0.12, 0.06, 0.14, g);
    glowBox(p.visor, 0.14, 0.03, 0.04, -0.04, 0.1, 0.2, g, glows);
    box(p.metal, 0.06, 0.08, 0.08, 0.18, 0.04, 0.1, g);
  } else if (style === "rail") {
    glowBox(p.visor, 0.22, 0.03, 0.04, 0, 0.11, 0.22, g, glows);
    box(p.accent, 0.03, 0.16, 0.03, 0.16, 0.16, 0.1, g);
    box(p.accent, 0.03, 0.16, 0.03, -0.16, 0.16, 0.1, g);
    box(p.light, 0.014, 0.12, 0.014, 0.16, 0.16, 0.12, g);
  } else {
    glowBox(p.visor, 0.22, 0.04, 0.05, 0, 0.11, 0.21, g, glows);
    box(p.light, 0.18, 0.01, 0.01, 0, 0.11, 0.24, g);
    cyl(p.dark, 0.01, 0.01, 0.16, 0.12, 0.3, -0.02, g, 0.32);
    box(p.metal, 0.1, 0.05, 0.12, 0.16, 0.2, 0.04, g);
    box(p.plate, 0.28, 0.08, 0.16, 0, -0.04, 0.1, g);
  }
  return g;
}

export function buildChestKit(mat: Materials, style: ArmorStyle, rarity: Rarity, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  box(p.plate, 0.74, 0.5, 0.36, 0, 0.16, 0.08, g);
  box(p.plate, 0.64, 0.18, 0.3, 0, 0.42, 0.04, g);
  box(p.plate, 0.54, 0.14, 0.24, 0, 0.48, -0.08, g);
  box(p.dark, 0.44, 0.2, 0.14, 0, 0.18, 0.24, g);
  box(p.plate, 0.3, 0.26, 0.24, 0.36, 0.28, 0.12, g);
  box(p.plate, 0.3, 0.26, 0.24, -0.36, 0.28, 0.12, g);
  box(p.metal, 0.22, 0.1, 0.16, 0.38, 0.36, 0.02, g);
  box(p.metal, 0.22, 0.1, 0.16, -0.38, 0.36, 0.02, g);
  for (let i = 0; i < 3; i++) box(p.dark, 0.44, 0.03, 0.06, 0, 0.02 + i * 0.07, 0.22, g);
  glowBox(p.glow, 0.18, 0.045, 0.05, 0, 0.32, 0.24, g, glows);

  if (style === "assault") {
    box(p.metal, 0.86, 0.2, 0.26, 0, 0.5, 0.08, g);
    box(p.plate, 0.32, 0.26, 0.24, 0.44, 0.32, 0.08, g);
    box(p.plate, 0.32, 0.26, 0.24, -0.44, 0.32, 0.08, g);
    box(p.accent, 0.16, 0.05, 0.18, 0.24, 0.46, 0.2, g);
    box(p.accent, 0.16, 0.05, 0.18, -0.24, 0.46, 0.2, g);
    box(p.glow, 0.3, 0.14, 0.12, 0, 0.16, 0.24, g);
  } else if (style === "ember") {
    glowBox(p.accent, 0.2, 0.06, 0.06, 0, 0.22, 0.24, g, glows);
    sph(p.accent, 0.045, 0, 0.16, 0.26, g, 8);
    box(p.dark, 0.08, 0.16, 0.08, 0.3, 0.08, 0.16, g);
    box(p.dark, 0.08, 0.16, 0.08, -0.3, 0.08, 0.16, g);
  } else if (style === "void") {
    box(p.accent, 0.2, 0.14, 0.1, 0, 0.18, 0.24, g);
    glowBox(p.light, 0.48, 0.016, 0.016, 0, 0.08, 0.22, g, glows);
    box(p.plate, 0.5, 0.1, 0.18, 0, 0.4, -0.12, g);
    sph(p.light, 0.03, 0, 0.2, 0.28, g, 8);
  } else if (style === "sealed") {
    box(p.dark, 0.5, 0.2, 0.16, 0, 0.16, 0.18, g);
    box(p.metal, 0.16, 0.1, 0.1, 0.24, 0.28, 0.16, g);
    box(p.metal, 0.16, 0.1, 0.1, -0.24, 0.28, 0.16, g);
    cyl(p.metal, 0.03, 0.03, 0.12, 0.2, 0.08, 0.2, g, Math.PI / 2);
  } else if (style === "salvaged") {
    box(p.rust, 0.22, 0.16, 0.12, 0.22, 0.2, 0.18, g);
    box(p.dark, 0.14, 0.2, 0.1, -0.2, 0.08, 0.16, g);
    box(p.metal, 0.08, 0.08, 0.14, 0.08, 0.28, 0.18, g, 0.2);
  } else if (style === "rail") {
    box(p.accent, 0.04, 0.28, 0.04, 0.18, 0.16, 0.22, g);
    box(p.accent, 0.04, 0.28, 0.04, -0.18, 0.16, 0.22, g);
    glowBox(p.light, 0.014, 0.22, 0.014, 0.18, 0.16, 0.24, g, glows);
  } else {
    box(p.metal, 0.48, 0.08, 0.12, 0, 0.38, 0.14, g);
    box(p.light, 0.012, 0.22, 0.012, 0.16, 0.16, 0.22, g);
    box(p.light, 0.012, 0.22, 0.012, -0.16, 0.16, 0.22, g);
    box(p.accent, 0.08, 0.04, 0.05, 0, 0.2, 0.24, g);
  }
  return g;
}

export function buildUpperArmKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  box(p.plate, 0.26, 0.18, 0.3, 0.1 * side, 0.08, 0.04, g);
  box(p.plate, 0.34, 0.16, 0.36, 0.16 * side, 0.2, 0.02, g);
  box(p.dark, 0.12, 0.12, 0.16, 0.18 * side, 0.04, 0.16, g);
  box(p.metal, 0.1, 0.08, 0.14, 0.2 * side, 0.16, -0.1, g);
  glowBox(p.glow, 0.1, 0.04, 0.08, 0.14 * side, 0.2, 0.14, g, glows);

  if (style === "servo") {
    cyl(p.metal, 0.02, 0.02, 0.16, 0.18 * side, -0.02, 0.14, g, 1.15);
    box(p.metal, 0.1, 0.08, 0.12, 0.16 * side, -0.08, 0.12, g);
    box(p.accent, 0.05, 0.05, 0.06, 0.18 * side, 0.08, 0.16, g);
  } else if (style === "ember") {
    sph(p.accent, 0.024, 0.18 * side, 0.08, 0.18, g, 6);
    box(p.accent, 0.06, 0.04, 0.08, 0.16 * side, 0.12, 0.16, g);
  } else if (style === "assault") {
    box(p.plate, 0.2, 0.16, 0.22, 0.16 * side, 0.12, 0.1, g);
    box(p.accent, 0.05, 0.04, 0.1, 0.2 * side, 0.18, 0.14, g);
  } else if (style === "void") {
    box(p.accent, 0.08, 0.1, 0.08, 0.16 * side, 0.08, 0.16, g);
    glowBox(p.light, 0.02, 0.1, 0.02, 0.18 * side, 0.08, 0.18, g, glows);
  } else if (style === "salvaged") {
    box(p.rust, 0.1, 0.12, 0.1, 0.16 * side, 0.1, 0.12, g);
    box(p.metal, 0.06, 0.06, 0.1, 0.14 * side, -0.04, 0.12, g);
  } else {
    box(p.metal, 0.12, 0.06, 0.16, 0.14 * side, 0.18, 0.08, g);
    box(p.light, 0.01, 0.1, 0.01, 0.16 * side, 0.04, 0.16, g);
  }
  return g;
}

export function buildForearmKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  box(p.plate, 0.16, 0.12, 0.22, 0.05 * side, -0.28, 0.08, g);
  box(p.metal, 0.12, 0.08, 0.16, 0.06 * side, -0.18, 0.14, g);
  box(p.dark, 0.1, 0.1, 0.12, 0.06 * side, -0.36, 0.14, g);

  if (style === "servo") {
    box(p.metal, 0.14, 0.08, 0.16, 0.06 * side, -0.42, 0.16, g);
    for (let i = 0; i < 4; i++) box(p.dark, 0.02, 0.03, 0.06, (0.02 + i * 0.03) * side, -0.5, 0.2, g);
    cyl(p.metal, 0.016, 0.016, 0.1, 0.1 * side, -0.22, 0.16, g, 1.1);
  } else if (style === "ember") {
    sph(p.accent, 0.02, 0.08 * side, -0.24, 0.2, g, 6);
    box(p.accent, 0.05, 0.04, 0.08, 0.06 * side, -0.3, 0.18, g);
  } else if (style === "void") {
    glowBox(p.light, 0.03, 0.08, 0.03, 0.1 * side, -0.24, 0.18, g, glows);
  } else if (style === "salvaged") {
    box(p.rust, 0.08, 0.08, 0.1, 0.08 * side, -0.32, 0.16, g);
  } else {
    box(p.light, 0.01, 0.1, 0.01, 0.1 * side, -0.22, 0.16, g);
    box(p.plate, 0.12, 0.07, 0.14, 0.05 * side, -0.4, 0.14, g);
  }
  return g;
}

export function buildThighKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  box(p.plate, 0.22, 0.2, 0.22, 0, -0.18, 0.1, g);
  box(p.metal, 0.16, 0.08, 0.16, 0, -0.3, 0.14, g);
  box(p.dark, 0.08, 0.12, 0.08, 0.1 * side, -0.24, 0.1, g);
  glowBox(p.glow, 0.08, 0.03, 0.06, 0, -0.1, 0.18, g, glows);
  if (style === "strider") {
    box(p.metal, 0.14, 0.05, 0.2, 0, -0.06, 0.14, g);
    box(p.accent, 0.05, 0.1, 0.05, 0.1 * side, -0.2, 0.16, g);
  } else if (style === "salvaged") {
    box(p.rust, 0.1, 0.1, 0.1, 0.08 * side, -0.16, 0.14, g);
  }
  return g;
}

export function buildShinKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  box(p.plate, 0.22, 0.2, 0.2, 0, -0.12, 0.1, g);
  box(p.plate, 0.24, 0.12, 0.24, 0, -0.28, 0.16, g);
  box(p.rubber, 0.26, 0.1, 0.34, 0, -0.4, 0.1, g);
  box(p.dark, 0.18, 0.06, 0.12, 0, -0.42, -0.1, g);
  box(p.metal, 0.1, 0.14, 0.08, 0.1 * side, -0.16, -0.06, g);

  if (style === "rail") {
    box(p.accent, 0.045, 0.22, 0.045, 0.1 * side, -0.16, 0.16, g);
    glowBox(p.light, 0.016, 0.18, 0.016, 0.1 * side, -0.16, 0.18, g, glows);
    box(p.accent, 0.045, 0.22, 0.045, -0.08 * side, -0.16, 0.16, g);
  } else if (style === "strider") {
    box(p.metal, 0.14, 0.04, 0.22, 0, -0.06, 0.14, g);
    box(p.accent, 0.04, 0.12, 0.04, 0.1 * side, -0.2, 0.16, g);
    box(p.plate, 0.12, 0.16, 0.08, 0, -0.2, 0.2, g);
  } else if (style === "void") {
    glowBox(p.light, 0.04, 0.14, 0.04, 0.08 * side, -0.16, 0.16, g, glows);
  } else if (style === "ember") {
    box(p.accent, 0.06, 0.04, 0.1, 0, -0.18, 0.18, g);
  } else if (style === "salvaged") {
    box(p.rust, 0.1, 0.08, 0.12, 0.08 * side, -0.2, 0.14, g);
  } else {
    box(p.accent, 0.04, 0.08, 0.04, 0.1 * side, -0.18, 0.16, g);
    box(p.metal, 0.12, 0.04, 0.16, 0, -0.3, 0.18, g);
  }
  return g;
}

function fitPreview(src: THREE.Object3D, target = 0.46) {
  const wrap = new THREE.Group();
  wrap.add(src);
  wrap.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(wrap);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  src.position.sub(center);
  const m = Math.max(size.x, size.y, size.z, 0.001);
  wrap.scale.setScalar(target / m);
  return wrap;
}

export function createArmorMesh(slot: ArmorSlot, mat: Materials, rarity: Rarity = "common", name = "") {
  const style = armorStyle(name);
  if (slot === "helm") return fitPreview(buildHelmKit(mat, style, rarity));
  if (slot === "chest") return fitPreview(buildChestKit(mat, style, rarity));
  if (slot === "arms") {
    const g = new THREE.Group();
    const L = buildUpperArmKit(mat, style, rarity, -1);
    const Lf = buildForearmKit(mat, style, rarity, -1);
    const R = buildUpperArmKit(mat, style, rarity, 1);
    const Rf = buildForearmKit(mat, style, rarity, 1);
    L.position.set(-0.16, 0.14, 0);
    Lf.position.set(-0.16, 0.14, 0);
    R.position.set(0.16, 0.14, 0);
    Rf.position.set(0.16, 0.14, 0);
    g.add(L, Lf, R, Rf);
    return fitPreview(g);
  }
  const g = new THREE.Group();
  const Lt = buildThighKit(mat, style, rarity, -1);
  const Ls = buildShinKit(mat, style, rarity, -1);
  const Rt = buildThighKit(mat, style, rarity, 1);
  const Rs = buildShinKit(mat, style, rarity, 1);
  Lt.position.set(-0.12, 0.16, 0);
  Ls.position.set(-0.12, 0.16, 0);
  Rt.position.set(0.12, 0.16, 0);
  Rs.position.set(0.12, 0.16, 0);
  g.add(Lt, Ls, Rt, Rs);
  return fitPreview(g);
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
  rig.kitGlows.length = 0;
  const piece = (slot: ArmorSlot) => items.find((i) => i.uid === equipped[slot]);

  const helm = piece("helm");
  rig.visor.visible = !helm;
  if (helm) {
    const style = armorStyle(helm.name);
    rig.head.add(buildHelmKit(mat, style, helm.rarity, rig.kitGlows));
  }

  const chest = piece("chest");
  if (chest) {
    rig.torso.add(buildChestKit(mat, armorStyle(chest.name), chest.rarity, rig.kitGlows));
  }

  const arms = piece("arms");
  if (arms) {
    const style = armorStyle(arms.name);
    rig.leftArm.add(buildUpperArmKit(mat, style, arms.rarity, -1, rig.kitGlows));
    rig.rightArm.add(buildUpperArmKit(mat, style, arms.rarity, 1, rig.kitGlows));
    rig.leftForearm.add(buildForearmKit(mat, style, arms.rarity, -1, rig.kitGlows));
    rig.rightForearm.add(buildForearmKit(mat, style, arms.rarity, 1, rig.kitGlows));
  }

  const legs = piece("legs");
  if (legs) {
    const style = armorStyle(legs.name);
    rig.leftThigh.add(buildThighKit(mat, style, legs.rarity, -1, rig.kitGlows));
    rig.rightThigh.add(buildThighKit(mat, style, legs.rarity, 1, rig.kitGlows));
    rig.leftShin.add(buildShinKit(mat, style, legs.rarity, -1, rig.kitGlows));
    rig.rightShin.add(buildShinKit(mat, style, legs.rarity, 1, rig.kitGlows));
  }
}

export function addRarityStripe(gun: THREE.Object3D, mat: Materials, rarity: Rarity) {
  if (rarity === "common") return;
  const tint = kitTint(rarity, 0.4);
  box(tint, 0.018, 0.018, 0.18, 0, 0.1, 0.1, gun);
  box(tint, 0.03, 0.012, 0.04, 0.04, 0.08, -0.08, gun);
}
