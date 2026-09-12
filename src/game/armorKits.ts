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
  segs = 14,
) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, segs, segs), mat);
  m.position.set(x, y, z);
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
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 16), mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function ring(
  mat: THREE.Material,
  r: number,
  tube: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  rx = Math.PI / 2,
) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 20), mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.castShadow = true;
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
    plate.color.setHex(0x6a7078);
    plate.metalness = 0.78;
    plate.roughness = 0.28;
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

function glowSph(
  mat: THREE.Material,
  r: number,
  x: number,
  y: number,
  z: number,
  parent: THREE.Object3D,
  glows: THREE.Mesh[],
) {
  const m = sph(mat, r, x, y, z, parent, 12);
  m.userData.kitGlow = true;
  glows.push(m);
  return m;
}

function helmVisor(mat: THREE.Material, parent: THREE.Object3D, glows: THREE.Mesh[], r = 0.2) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12, 0, Math.PI * 2, 0.82, 0.55), mat);
  mesh.position.set(0, 0.12, 0.02);
  mesh.castShadow = true;
  mesh.userData.kitGlow = true;
  parent.add(mesh);
  glows.push(mesh);
  return mesh;
}

export function buildHelmKit(mat: Materials, style: ArmorStyle, rarity: Rarity, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  sph(p.plate, 0.2, 0, 0.14, 0.0, g, 18);
  sph(p.dark, 0.17, 0, 0.13, 0.02, g, 16);
  cap(p.plate, 0.09, 0.08, 0, 0.0, 0.06, g);
  ring(p.metal, 0.12, 0.018, 0, -0.02, 0.02, g);
  sph(p.plate, 0.07, 0.16, 0.12, 0.0, g, 12);
  sph(p.plate, 0.07, -0.16, 0.12, 0.0, g, 12);
  sph(p.dark, 0.05, 0, 0.26, -0.04, g, 10);
  cap(p.metal, 0.03, 0.08, 0, 0.08, -0.16, g, 0.4);
  helmVisor(p.visor, g, glows, 0.205);
  glowSph(p.glow, 0.018, 0, 0.1, 0.18, g, glows);

  if (style === "ember") {
    cap(p.accent, 0.035, 0.2, 0, 0.36, -0.02, g);
    glowSph(p.accent, 0.028, 0.14, 0.2, 0.1, g, glows);
    glowSph(p.accent, 0.028, -0.14, 0.2, 0.1, g, glows);
    sph(p.dark, 0.06, 0.18, 0.16, -0.04, g, 10);
  } else if (style === "sealed") {
    cap(p.dark, 0.05, 0.08, 0, 0.06, 0.16, g);
    cyl(p.metal, 0.03, 0.03, 0.1, 0.1, 0.02, 0.14, g, Math.PI / 2);
    cyl(p.metal, 0.03, 0.03, 0.1, -0.1, 0.02, 0.14, g, Math.PI / 2);
    ring(p.metal, 0.08, 0.012, 0, 0.08, 0.14, g, 0);
  } else if (style === "void") {
    cyl(p.accent, 0.01, 0.006, 0.2, 0.12, 0.32, 0.0, g, 0.28);
    glowSph(p.light, 0.02, 0.12, 0.44, 0.04, g, glows);
    cap(p.accent, 0.025, 0.06, 0, 0.08, 0.18, g);
  } else if (style === "assault") {
    cap(p.metal, 0.08, 0.1, 0, 0.26, 0.02, g);
    sph(p.plate, 0.08, 0.18, 0.18, 0.04, g, 12);
    sph(p.plate, 0.08, -0.18, 0.18, 0.04, g, 12);
    box(p.accent, 0.08, 0.025, 0.1, 0.14, 0.2, 0.1, g);
    box(p.accent, 0.08, 0.025, 0.1, -0.14, 0.2, 0.1, g);
  } else if (style === "salvaged") {
    cap(p.rust, 0.04, 0.08, 0.12, 0.16, 0.06, g, 0.3);
    sph(p.dark, 0.045, -0.1, 0.06, 0.12, g, 8);
    cap(p.metal, 0.025, 0.06, 0.16, 0.04, 0.1, g);
  } else if (style === "rail") {
    cyl(p.accent, 0.012, 0.012, 0.16, 0.14, 0.16, 0.1, g);
    cyl(p.accent, 0.012, 0.012, 0.16, -0.14, 0.16, 0.1, g);
    glowBox(p.light, 0.012, 0.12, 0.012, 0.14, 0.16, 0.12, g, glows);
  } else {
    cyl(p.dark, 0.01, 0.008, 0.14, 0.1, 0.3, -0.02, g, 0.3);
    sph(p.metal, 0.035, 0.14, 0.18, 0.04, g, 8);
    cap(p.plate, 0.055, 0.06, 0, -0.02, 0.1, g);
    ring(p.light, 0.09, 0.008, 0, 0.1, 0.16, g, 0.2);
  }
  return g;
}

export function buildChestKit(mat: Materials, style: ArmorStyle, rarity: Rarity, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  cap(p.plate, 0.16, 0.28, 0, 0.14, 0.06, g);
  sph(p.plate, 0.14, 0.12, 0.22, 0.1, g, 16);
  sph(p.plate, 0.14, -0.12, 0.22, 0.1, g, 16);
  sph(p.plate, 0.13, 0.3, 0.28, 0.06, g, 14);
  sph(p.plate, 0.13, -0.3, 0.28, 0.06, g, 14);
  cap(p.plate, 0.1, 0.1, 0, 0.42, 0.02, g);
  ring(p.metal, 0.14, 0.02, 0, 0.44, 0.02, g);
  cap(p.dark, 0.08, 0.14, 0, 0.16, 0.18, g);
  for (let i = 0; i < 3; i++) cyl(p.dark, 0.12, 0.12, 0.016, 0, 0.02 + i * 0.07, 0.16, g, 0, 0, 14);
  glowSph(p.glow, 0.03, 0, 0.28, 0.2, g, glows);
  cap(p.metal, 0.04, 0.1, 0.22, 0.08, -0.08, g);
  cap(p.metal, 0.04, 0.1, -0.22, 0.08, -0.08, g);

  if (style === "assault") {
    sph(p.plate, 0.16, 0.38, 0.32, 0.06, g, 14);
    sph(p.plate, 0.16, -0.38, 0.32, 0.06, g, 14);
    cap(p.metal, 0.1, 0.12, 0, 0.48, 0.06, g);
    box(p.accent, 0.14, 0.04, 0.14, 0.2, 0.44, 0.16, g);
    box(p.accent, 0.14, 0.04, 0.14, -0.2, 0.44, 0.16, g);
    glowSph(p.glow, 0.04, 0, 0.16, 0.22, g, glows);
  } else if (style === "ember") {
    glowSph(p.accent, 0.04, 0, 0.18, 0.22, g, glows);
    cap(p.dark, 0.035, 0.1, 0.26, 0.08, 0.14, g);
    cap(p.dark, 0.035, 0.1, -0.26, 0.08, 0.14, g);
  } else if (style === "void") {
    cap(p.accent, 0.05, 0.1, 0, 0.16, 0.2, g);
    ring(p.light, 0.12, 0.01, 0, 0.1, 0.18, g);
    glowSph(p.light, 0.028, 0, 0.2, 0.24, g, glows);
  } else if (style === "sealed") {
    cap(p.dark, 0.09, 0.14, 0, 0.14, 0.16, g);
    cyl(p.metal, 0.028, 0.028, 0.1, 0.16, 0.1, 0.18, g, Math.PI / 2);
    cyl(p.metal, 0.028, 0.028, 0.1, -0.16, 0.1, 0.18, g, Math.PI / 2);
  } else if (style === "salvaged") {
    cap(p.rust, 0.05, 0.1, 0.16, 0.18, 0.14, g, 0.25);
    sph(p.dark, 0.05, -0.16, 0.08, 0.14, g, 8);
    cap(p.metal, 0.03, 0.08, 0.06, 0.26, 0.16, g, 0.2);
  } else if (style === "rail") {
    cyl(p.accent, 0.016, 0.016, 0.24, 0.16, 0.16, 0.18, g);
    cyl(p.accent, 0.016, 0.016, 0.24, -0.16, 0.16, 0.18, g);
    glowBox(p.light, 0.012, 0.2, 0.012, 0.16, 0.16, 0.2, g, glows);
  } else {
    ring(p.metal, 0.16, 0.014, 0, 0.36, 0.1, g);
    cyl(p.light, 0.01, 0.01, 0.2, 0.14, 0.16, 0.2, g);
    cyl(p.light, 0.01, 0.01, 0.2, -0.14, 0.16, 0.2, g);
    glowSph(p.glow, 0.022, 0, 0.22, 0.22, g, glows);
  }
  return g;
}

export function buildUpperArmKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  sph(p.plate, 0.1, 0.12 * side, 0.16, 0.02, g, 14);
  cap(p.plate, 0.07, 0.16, 0.08 * side, 0.02, 0.04, g);
  ring(p.metal, 0.072, 0.012, 0.08 * side, 0.06, 0.04, g);
  cap(p.dark, 0.035, 0.08, 0.14 * side, 0.04, 0.12, g);
  glowSph(p.glow, 0.016, 0.12 * side, 0.16, 0.12, g, glows);

  if (style === "servo") {
    cyl(p.metal, 0.016, 0.016, 0.16, 0.16 * side, -0.02, 0.12, g, 1.1);
    sph(p.metal, 0.03, 0.16 * side, -0.08, 0.12, g, 8);
    sph(p.accent, 0.02, 0.16 * side, 0.08, 0.14, g, 8);
  } else if (style === "ember") {
    glowSph(p.accent, 0.02, 0.16 * side, 0.1, 0.14, g, glows);
  } else if (style === "assault") {
    sph(p.plate, 0.09, 0.16 * side, 0.14, 0.08, g, 12);
    box(p.accent, 0.04, 0.03, 0.08, 0.18 * side, 0.18, 0.12, g);
  } else if (style === "void") {
    cap(p.accent, 0.025, 0.08, 0.14 * side, 0.08, 0.14, g);
    glowSph(p.light, 0.014, 0.16 * side, 0.08, 0.16, g, glows);
  } else if (style === "salvaged") {
    cap(p.rust, 0.03, 0.08, 0.14 * side, 0.1, 0.1, g, 0.2);
    sph(p.metal, 0.025, 0.12 * side, -0.02, 0.1, g, 8);
  } else {
    cap(p.metal, 0.03, 0.08, 0.12 * side, 0.16, 0.06, g);
    cyl(p.light, 0.008, 0.008, 0.1, 0.14 * side, 0.04, 0.14, g);
  }
  return g;
}

export function buildForearmKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  cap(p.plate, 0.055, 0.16, 0.04 * side, -0.22, 0.06, g);
  ring(p.metal, 0.058, 0.01, 0.04 * side, -0.18, 0.08, g);
  sph(p.dark, 0.04, 0.04 * side, -0.34, 0.1, g, 10);

  if (style === "servo") {
    sph(p.metal, 0.035, 0.05 * side, -0.4, 0.14, g, 8);
    for (let i = 0; i < 3; i++) cap(p.dark, 0.01, 0.04, (0.02 + i * 0.02) * side, -0.46, 0.16, g);
    cyl(p.metal, 0.012, 0.012, 0.1, 0.08 * side, -0.22, 0.14, g, 1.1);
  } else if (style === "ember") {
    glowSph(p.accent, 0.016, 0.07 * side, -0.24, 0.16, g, glows);
  } else if (style === "void") {
    glowSph(p.light, 0.016, 0.08 * side, -0.24, 0.16, g, glows);
  } else if (style === "salvaged") {
    cap(p.rust, 0.025, 0.06, 0.07 * side, -0.3, 0.12, g, 0.2);
  } else {
    cyl(p.light, 0.007, 0.007, 0.1, 0.08 * side, -0.22, 0.14, g);
    cap(p.plate, 0.04, 0.06, 0.04 * side, -0.36, 0.1, g);
  }
  return g;
}

export function buildThighKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  cap(p.plate, 0.085, 0.16, 0, -0.16, 0.08, g);
  ring(p.metal, 0.088, 0.012, 0, -0.26, 0.08, g);
  cap(p.dark, 0.03, 0.08, 0.08 * side, -0.2, 0.1, g);
  glowSph(p.glow, 0.016, 0, -0.1, 0.14, g, glows);
  if (style === "strider") {
    cap(p.metal, 0.04, 0.1, 0, -0.08, 0.12, g, 0.3);
    cyl(p.accent, 0.016, 0.016, 0.1, 0.08 * side, -0.18, 0.14, g);
  } else if (style === "salvaged") {
    cap(p.rust, 0.03, 0.07, 0.07 * side, -0.14, 0.12, g, 0.25);
  }
  return g;
}

export function buildShinKit(mat: Materials, style: ArmorStyle, rarity: Rarity, side: number, glows: THREE.Mesh[] = []) {
  const p = stylePalette(mat, style, rarity);
  const g = kitGroup();
  sph(p.plate, 0.06, 0, -0.04, 0.08, g, 12);
  cap(p.plate, 0.065, 0.14, 0, -0.16, 0.08, g);
  cap(p.rubber, 0.07, 0.08, 0, -0.36, 0.08, g);
  sph(p.rubber, 0.055, 0, -0.4, 0.12, g, 10);
  cap(p.metal, 0.03, 0.08, 0.08 * side, -0.16, -0.04, g);
  ring(p.dark, 0.068, 0.01, 0, -0.26, 0.08, g);

  if (style === "rail") {
    cyl(p.accent, 0.016, 0.016, 0.2, 0.08 * side, -0.16, 0.14, g);
    glowBox(p.light, 0.012, 0.16, 0.012, 0.08 * side, -0.16, 0.16, g, glows);
    cyl(p.accent, 0.016, 0.016, 0.2, -0.06 * side, -0.16, 0.14, g);
  } else if (style === "strider") {
    cap(p.metal, 0.04, 0.1, 0, -0.08, 0.12, g, 0.25);
    cyl(p.accent, 0.014, 0.014, 0.1, 0.08 * side, -0.2, 0.14, g);
  } else if (style === "void") {
    glowSph(p.light, 0.018, 0.06 * side, -0.16, 0.14, g, glows);
  } else if (style === "ember") {
    glowSph(p.accent, 0.016, 0, -0.16, 0.16, g, glows);
  } else if (style === "salvaged") {
    cap(p.rust, 0.03, 0.07, 0.07 * side, -0.18, 0.12, g, 0.2);
  } else {
    cap(p.accent, 0.016, 0.06, 0.08 * side, -0.16, 0.14, g);
    cap(p.metal, 0.035, 0.06, 0, -0.28, 0.14, g);
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
