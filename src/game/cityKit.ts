import * as THREE from "three";
import type { Materials } from "./meshes";
import type { LevelTheme } from "./types";

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
  segs = 10,
) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
  m.position.set(x, y, z);
  m.rotation.x = rx;
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function irand(i: number) {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function createHydrant(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.ember, 0.09, 0.11, 0.42, 0, 0.26, 0, g);
  cyl(mat.metal, 0.12, 0.12, 0.06, 0, 0.5, 0, g);
  box(mat.metal, 0.22, 0.08, 0.08, 0, 0.34, 0, g);
  cyl(mat.dark, 0.03, 0.03, 0.1, 0.12, 0.34, 0, g, Math.PI / 2);
  return g;
}

export function createPlanter(mat: Materials) {
  const g = new THREE.Group();
  box(mat.concrete, 1.15, 0.42, 0.7, 0, 0.22, 0, g);
  box(mat.dark, 1.0, 0.12, 0.56, 0, 0.44, 0, g);
  box(mat.rust, 0.22, 0.28, 0.16, -0.28, 0.58, 0.06, g);
  box(mat.rust, 0.18, 0.22, 0.14, 0.22, 0.54, -0.08, g);
  box(mat.dark, 0.12, 0.16, 0.1, 0.02, 0.52, 0.12, g);
  return g;
}

export function createDumpster(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 1.35, 0.95, 0.78, 0, 0.5, 0, g);
  box(mat.dark, 1.4, 0.08, 0.82, 0, 1.0, 0, g);
  box(mat.rust, 0.55, 0.06, 0.78, 0.38, 1.06, 0, g, 0.15);
  box(mat.warning, 1.3, 0.05, 0.05, 0, 0.72, 0.4, g);
  box(mat.dark, 0.12, 0.18, 0.12, 0.62, 0.16, 0.28, g);
  box(mat.dark, 0.12, 0.18, 0.12, -0.62, 0.16, -0.28, g);
  return g;
}

export function createBench(mat: Materials) {
  const g = new THREE.Group();
  box(mat.dark, 1.35, 0.08, 0.42, 0, 0.48, 0, g);
  box(mat.metal, 1.3, 0.36, 0.06, 0, 0.72, -0.18, g);
  box(mat.metal, 0.08, 0.46, 0.4, -0.6, 0.26, 0, g);
  box(mat.metal, 0.08, 0.46, 0.4, 0.6, 0.26, 0, g);
  return g;
}

export function createShelter(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 0.08, 2.2, 0.08, -1.1, 1.1, -0.4, g);
  box(mat.metal, 0.08, 2.2, 0.08, 1.1, 1.1, -0.4, g);
  box(mat.metal, 0.08, 2.2, 0.08, -1.1, 1.1, 0.4, g);
  box(mat.metal, 0.08, 2.2, 0.08, 1.1, 1.1, 0.4, g);
  box(mat.dark, 2.4, 0.08, 1.1, 0, 2.24, 0, g);
  box(mat.glass, 2.2, 1.2, 0.04, 0, 1.4, -0.42, g);
  box(mat.warning, 2.2, 0.05, 0.05, 0, 2.18, 0.5, g);
  box(mat.metal, 1.4, 0.08, 0.4, 0, 0.48, 0.05, g);
  return g;
}

export function createSignal(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.dark, 0.06, 0.07, 3.4, 0, 1.7, 0, g);
  box(mat.dark, 0.28, 0.7, 0.22, 0.22, 3.15, 0, g);
  box(mat.ember, 0.1, 0.1, 0.06, 0.34, 3.32, 0, g);
  box(mat.warning, 0.1, 0.1, 0.06, 0.34, 3.16, 0, g);
  box(mat.neon, 0.1, 0.1, 0.06, 0.34, 3.0, 0, g);
  box(mat.metal, 0.8, 0.08, 0.08, 0.4, 3.05, 0, g);
  return g;
}

export function createFence(mat: Materials) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    box(mat.metal, 0.05, 1.15, 0.05, -0.9 + i * 0.45, 0.6, 0, g);
  }
  box(mat.metal, 2.0, 0.05, 0.05, 0, 1.05, 0, g);
  box(mat.metal, 2.0, 0.05, 0.05, 0, 0.45, 0, g);
  box(mat.warning, 2.0, 0.04, 0.04, 0, 0.78, 0, g);
  return g;
}

export function createKiosk(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 0.85, 1.35, 0.7, 0, 0.7, 0, g);
  box(mat.dark, 0.78, 0.55, 0.08, 0, 0.95, 0.38, g);
  box(mat.ember, 0.5, 0.08, 0.04, 0, 1.15, 0.42, g);
  box(mat.warning, 0.8, 0.05, 0.05, 0, 1.38, 0.2, g);
  return g;
}

export function createRailSegment(mat: Materials) {
  const g = new THREE.Group();
  box(mat.rust, 0.12, 0.1, 8.2, -0.72, 0.08, 0, g);
  box(mat.rust, 0.12, 0.1, 8.2, 0.72, 0.08, 0, g);
  for (let i = 0; i < 6; i++) box(mat.dark, 1.7, 0.06, 0.16, 0, 0.05, -3.2 + i * 1.3, g);
  box(mat.voidCore, 0.06, 0.05, 8.2, 0.95, 0.1, 0, g);
  return g;
}

export function createAntennaDish(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.metal, 0.08, 0.1, 2.4, 0, 1.2, 0, g);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), mat.dark);
  dish.position.set(0.15, 2.35, 0);
  dish.rotation.z = 1.1;
  dish.castShadow = true;
  g.add(dish);
  box(mat.voidCore, 0.08, 0.08, 0.08, 0.35, 2.2, 0, g);
  return g;
}

export function placeStreetFurniture(scene: THREE.Object3D, mat: Materials, theme: LevelTheme) {
  const add = (mesh: THREE.Object3D, x: number, z: number, ry = 0) => {
    mesh.position.set(x, 0, z);
    mesh.rotation.y = ry;
    scene.add(mesh);
  };

  const hydrants: [number, number][] = [
    [-3.4, 6],
    [3.35, -8],
    [-3.3, -28],
    [3.4, -52],
    [-3.35, -76],
    [3.3, -98],
  ];
  for (const [x, z] of hydrants) add(createHydrant(mat), x, z);

  const planters: [number, number, number][] = [
    [-4.6, 4, 0],
    [4.6, 2, 0],
    [-4.7, -18, 0.2],
    [4.8, -34, -0.1],
    [-4.6, -58, 0],
    [4.7, -82, 0.15],
  ];
  for (const [x, z, ry] of planters) add(createPlanter(mat), x, z, ry);

  const dumps: [number, number, number][] = [
    [-5.4, -6, 0.2],
    [5.5, -22, -0.3],
    [-5.6, -48, 0.1],
    [5.4, -88, -0.2],
  ];
  for (const [x, z, ry] of dumps) add(createDumpster(mat), x, z, ry);

  for (const [x, z, ry] of [
    [-4.9, 0, 0] as const,
    [4.9, -14, Math.PI] as const,
    [-5.0, -40, 0] as const,
    [5.0, -70, Math.PI] as const,
  ]) {
    add(createBench(mat), x, z, ry);
  }

  add(createShelter(mat), -5.2, -12, 0.05);
  add(createShelter(mat), 5.2, -44, Math.PI);
  add(createKiosk(mat), -5.1, 7, 0.2);
  add(createKiosk(mat), 5.15, -62, -0.15);
  add(createSignal(mat), -3.2, 7.4, 0.1);
  add(createSignal(mat), 3.2, -15, Math.PI);

  for (const [x, z, ry] of [
    [-6.2, -2, 0.08] as const,
    [6.2, -16, -0.1] as const,
    [-6.3, -36, 0] as const,
    [6.1, -64, 0.12] as const,
    [-6.2, -94, -0.08] as const,
  ]) {
    add(createFence(mat), x, z, ry);
  }

  if (theme === "rail") {
    for (let z = 8; z > -118; z -= 8.2) {
      const rail = createRailSegment(mat);
      rail.position.set(0, 0.01, z);
      scene.add(rail);
    }
    add(createBench(mat), -4.4, 5, 0);
    add(createBench(mat), 4.4, 5, Math.PI);
  }

  if (theme === "spire") {
    add(createAntennaDish(mat), -7.4, 6, 0.4);
    add(createAntennaDish(mat), 7.6, -20, -0.6);
    add(createAntennaDish(mat), -7.2, -56, 0.2);
    add(createAntennaDish(mat), 7.4, -96, -0.3);
  }

  for (let i = 0; i < 8; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 3 - i * 15.5;
    const bag = new THREE.Group();
    box(mat.dark, 0.28, 0.22, 0.2, 0, 0.12, 0, bag);
    box(mat.rust, 0.18, 0.14, 0.16, 0.12, 0.1, 0.08, bag, 0.3);
    add(bag, side * 4.35, z, irand(i) * 1.4);
  }
}

export function dressThemeGround(scene: THREE.Object3D, mat: Materials, theme: LevelTheme) {
  if (theme === "rail") {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 132), mat.dark);
    bed.position.set(0, 0.01, -48);
    bed.receiveShadow = true;
    scene.add(bed);
    const platL = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.28, 22), mat.concrete);
    platL.position.set(-4.4, 0.16, 2);
    platL.receiveShadow = true;
    scene.add(platL);
    const platR = platL.clone();
    platR.position.set(4.4, 0.16, 2);
    scene.add(platR);
    const end = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.28, 16), mat.concrete);
    end.position.set(0, 0.16, -108);
    end.receiveShadow = true;
    scene.add(end);
  }

  if (theme === "spire") {
    const tile = new THREE.MeshStandardMaterial({
      color: 0x3a424c,
      metalness: 0.18,
      roughness: 0.62,
    });
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(14, 0.05, 18), tile);
    plaza.position.set(0, 0.03, 2);
    plaza.receiveShadow = true;
    scene.add(plaza);
    for (const x of [-3.2, 3.2]) {
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 0.35), mat.dark);
      pylon.position.set(x, 1.3, 6);
      pylon.castShadow = true;
      scene.add(pylon);
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), mat.voidCore);
      core.position.set(x, 1.4, 6);
      scene.add(core);
    }
  }

  if (theme === "ash") {
    const median = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 18), mat.concrete);
    median.position.set(0, 0.08, 4);
    median.receiveShadow = true;
    scene.add(median);
    for (const z of [8, 2, -2]) {
      const tree = new THREE.Group();
      cyl(mat.dark, 0.08, 0.12, 0.7, 0, 0.4, 0, tree);
      box(mat.rust, 0.7, 0.16, 0.7, 0, 0.82, 0, tree);
      box(mat.dark, 0.45, 0.35, 0.45, 0, 1.05, 0, tree);
      tree.position.set(0, 0, z);
      scene.add(tree);
    }
  }
}
