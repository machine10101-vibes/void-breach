import * as THREE from "three";
import type { Materials } from "./meshes";
import type { AABB, LevelTheme } from "./types";

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

export function createStreetTree(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.concrete, 0.55, 0.55, 0.18, 0, 0.1, 0, g, 0, 12);
  box(mat.dark, 0.95, 0.08, 0.95, 0, 0.04, 0, g);
  cyl(mat.dark, 0.1, 0.16, 1.35, 0, 0.82, 0, g, 0, 8);
  box(mat.rust, 1.15, 0.22, 0.85, 0, 1.62, 0.08, g, 0.15);
  box(mat.dark, 0.7, 0.55, 0.55, -0.15, 1.95, -0.05, g, 0.25, 0.4);
  box(mat.rust, 0.45, 0.35, 0.4, 0.28, 1.85, 0.18, g, -0.2, -0.3);
  return g;
}

export function createJersey(mat: Materials) {
  const g = new THREE.Group();
  box(mat.concrete, 1.7, 0.72, 0.42, 0, 0.36, 0, g);
  box(mat.concrete, 1.5, 0.28, 0.28, 0, 0.82, 0, g);
  box(mat.warning, 1.55, 0.06, 0.06, 0, 0.55, 0.2, g);
  return g;
}

export function createMeter(mat: Materials) {
  const g = new THREE.Group();
  cyl(mat.dark, 0.03, 0.04, 1.15, 0, 0.58, 0, g);
  box(mat.metal, 0.16, 0.28, 0.12, 0, 1.22, 0.02, g);
  box(mat.ember, 0.08, 0.06, 0.04, 0, 1.28, 0.08, g);
  box(mat.dark, 0.12, 0.04, 0.12, 0, 0.04, 0, g);
  return g;
}

export function createMonument(mat: Materials) {
  const g = new THREE.Group();
  box(mat.concrete, 2.4, 0.22, 2.4, 0, 0.12, 0, g);
  box(mat.dark, 1.1, 2.6, 1.1, 0, 1.45, 0, g);
  box(mat.metal, 1.25, 0.12, 1.25, 0, 2.78, 0, g);
  box(mat.warning, 0.7, 0.08, 0.08, 0, 1.6, 0.58, g);
  cyl(mat.ember, 0.06, 0.06, 0.35, 0, 2.98, 0, g);
  return g;
}

export function createWaterTower(mat: Materials) {
  const g = new THREE.Group();
  for (const [x, z] of [
    [-0.35, -0.35],
    [0.35, -0.35],
    [-0.35, 0.35],
    [0.35, 0.35],
  ] as const) {
    cyl(mat.metal, 0.04, 0.04, 1.4, x, 0.7, z, g);
  }
  cyl(mat.rust, 0.55, 0.48, 0.85, 0, 1.7, 0, g, 0, 12);
  cyl(mat.dark, 0.18, 0.22, 0.22, 0, 2.2, 0, g);
  return g;
}

export function createBillboard(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 0.12, 3.6, 0.12, -1.1, 1.8, 0, g);
  box(mat.metal, 0.12, 3.6, 0.12, 1.1, 1.8, 0, g);
  box(mat.dark, 2.6, 1.35, 0.1, 0, 3.15, 0, g);
  box(mat.ember, 2.4, 1.15, 0.04, 0, 3.15, 0.06, g);
  box(mat.warning, 2.5, 0.08, 0.08, 0, 3.85, 0.04, g);
  return g;
}

export function createNewsbox(mat: Materials) {
  const g = new THREE.Group();
  box(mat.metal, 0.42, 0.7, 0.36, 0, 0.36, 0, g);
  box(mat.dark, 0.36, 0.28, 0.04, 0, 0.48, 0.18, g);
  box(mat.ember, 0.2, 0.05, 0.03, 0, 0.62, 0.2, g);
  return g;
}

function paintCrosswalk(scene: THREE.Object3D, z: number, _mat: Materials) {
  const stripe = new THREE.MeshBasicMaterial({
    color: 0xe8d4a8,
    toneMapped: false,
  });
  for (const x of [-2.15, -1.3, -0.45, 0.45, 1.3, 2.15]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 2.4), stripe);
    bar.position.set(x, 0.055, z);
    scene.add(bar);
  }
  const stop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.03, 0.2), stripe);
  stop.position.set(0, 0.052, z + 1.45);
  scene.add(stop);
}

export function paintStreetSurfaces(scene: THREE.Object3D, mat: Materials, theme: LevelTheme) {
  const roadCol = theme === "spire" ? 0x14181e : theme === "rail" ? 0x1c1614 : 0x1c1b1a;
  const walkCol = theme === "spire" ? 0x2e343c : 0x322e2a;
  const roadMat = new THREE.MeshBasicMaterial({ color: roadCol });
  const walkLit = new THREE.MeshLambertMaterial({ color: walkCol });
  const road = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.06, 136), roadMat);
  road.position.set(0, 0.025, -48);
  road.receiveShadow = true;
  scene.add(road);

  const cross = new THREE.Mesh(new THREE.BoxGeometry(28, 0.055, 7.2), roadMat);
  cross.position.set(0, 0.022, 8.2);
  cross.receiveShadow = true;
  scene.add(cross);

  for (const x of [-3.28, 3.28]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 136), mat.concrete);
    curb.position.set(x, 0.08, -48);
    curb.castShadow = true;
    curb.receiveShadow = true;
    scene.add(curb);
  }

  for (const x of [-5.05, 5.05]) {
    const walk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 136), walkLit);
    walk.position.set(x, 0.04, -48);
    walk.receiveShadow = true;
    scene.add(walk);
    for (let i = 0; i < 34; i++) {
      const joint = new THREE.Mesh(new THREE.BoxGeometry(3.15, 0.01, 0.04), mat.dark);
      joint.position.set(x, 0.085, 16 - i * 4);
      scene.add(joint);
    }
  }

  const dirtMat = new THREE.MeshBasicMaterial({ color: 0x141210 });
  for (const x of [-7.7, 7.7]) {
    const dirt = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 136), dirtMat);
    dirt.position.set(x, 0.02, -48);
    dirt.receiveShadow = true;
    scene.add(dirt);
  }

  const dashGeo = new THREE.BoxGeometry(0.18, 0.03, 1.8);
  const dashMat = new THREE.MeshBasicMaterial({
    color: 0xd4c090,
    toneMapped: false,
  });
  const dashes = new THREE.InstancedMesh(dashGeo, dashMat, 44);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 44; i++) {
    dummy.position.set(0, 0.055, 14 - i * 3.05);
    dummy.updateMatrix();
    dashes.setMatrixAt(i, dummy.matrix);
  }
  scene.add(dashes);

  for (const z of [8.2, -16.5, -50.5, -96]) paintCrosswalk(scene, z, mat);

  const stainGeo = new THREE.CircleGeometry(0.95, 10);
  stainGeo.rotateX(-Math.PI / 2);
  const stainMat = new THREE.MeshStandardMaterial({
    color: 0x12100e,
    roughness: 0.98,
    metalness: 0.02,
    transparent: true,
    opacity: 0.5,
  });
  const stains = new THREE.InstancedMesh(stainGeo, stainMat, 20);
  for (let i = 0; i < 20; i++) {
    dummy.position.set((irand(i) - 0.5) * 3.4, 0.045, 10 - i * 6.2);
    dummy.scale.setScalar(0.6 + irand(i + 4) * 1.15);
    dummy.updateMatrix();
    stains.setMatrixAt(i, dummy.matrix);
    dummy.scale.setScalar(1);
  }
  scene.add(stains);

  for (let i = 0; i < 12; i++) {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 12), mat.metal);
    hole.position.set(i % 2 ? -1.35 : 1.4, 0.05, 10 - i * 10.5);
    scene.add(hole);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 12), mat.dark);
    lid.position.set(i % 2 ? -1.35 : 1.4, 0.085, 10 - i * 10.5);
    scene.add(lid);
  }
  for (let i = 0; i < 14; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const grate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.85), mat.dark);
    grate.position.set(side * 2.95, 0.06, 12 - i * 9.2);
    scene.add(grate);
    for (let k = 0; k < 4; k++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.02, 0.06), mat.metal);
      slat.position.set(side * 2.95, 0.08, 12 - i * 9.2 - 0.28 + k * 0.18);
      scene.add(slat);
    }
  }

  const slick = new THREE.MeshStandardMaterial({
    color: 0x0c0c0e,
    roughness: 0.18,
    metalness: 0.55,
    transparent: true,
    opacity: 0.42,
  });
  for (let i = 0; i < 10; i++) {
    const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.7 + irand(i + 8) * 1.1, 12), slick);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set((irand(i + 2) - 0.5) * 2.8, 0.048, 8 - i * 11.5);
    scene.add(puddle);
  }

  const tire = new THREE.MeshBasicMaterial({ color: 0x0a0908, transparent: true, opacity: 0.35 });
  for (let i = 0; i < 16; i++) {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.12 + irand(i) * 0.08, 0.01, 2.4 + irand(i + 3) * 1.8), tire);
    skid.position.set((irand(i + 7) - 0.5) * 2.4, 0.046, 12 - i * 8.4);
    skid.rotation.y = (irand(i + 11) - 0.5) * 0.18;
    scene.add(skid);
  }
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
  add(createSignal(mat), -3.15, -50, 0.08);
  add(createSignal(mat), 3.15, -96, Math.PI);

  for (const [x, z] of [
    [-4.8, 9.2],
    [4.9, 6.4],
    [-5.0, -20.5],
    [5.1, -32.2],
    [-4.9, -66.5],
    [5.0, -84.2],
  ] as const) {
    add(createStreetTree(mat), x, z);
  }
  for (const [x, z] of [
    [-3.55, 5.2],
    [3.55, 3.8],
    [-3.5, -18],
    [3.55, -40],
    [-3.5, -72],
  ] as const) {
    add(createMeter(mat), x, z);
  }
  for (const [x, z, ry] of [
    [-2.6, 5.4, 0.08],
    [2.7, 4.8, -0.1],
    [-2.5, -48.5, 0],
    [2.6, -49.2, 0.05],
  ] as const) {
    add(createJersey(mat), x, z, ry);
  }
  add(createNewsbox(mat), -4.4, 1.6, 0.2);
  add(createNewsbox(mat), 4.5, -8.4, -0.15);
  add(createBillboard(mat), -8.4, 16.5, Math.PI / 2);
  add(createBillboard(mat), 8.6, -30, -Math.PI / 2);
  add(createMonument(mat), 0, 10.6);

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
    for (const x of [-6.2, 6.2]) {
      const plaza = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.07, 14), mat.sidewalk);
      plaza.position.set(x, 0.035, 6);
      plaza.receiveShadow = true;
      scene.add(plaza);
    }
    const median = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, 8.5), mat.concrete);
    median.position.set(0, 0.1, 1.6);
    median.receiveShadow = true;
    scene.add(median);
    for (const z of [4.8, -0.4]) {
      const tree = createStreetTree(mat);
      tree.position.set(0, 0, z);
      tree.scale.setScalar(0.68);
      scene.add(tree);
    }
    for (const x of [-6.4, 6.4]) {
      const gateSide = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.07, 16), mat.sidewalk);
      gateSide.position.set(x, 0.035, -104);
      gateSide.receiveShadow = true;
      scene.add(gateSide);
    }
  }
}

function hazeTex(theme: LevelTheme) {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 256);
  if (theme === "spire") {
    grd.addColorStop(0, "rgba(18, 36, 52, 0)");
    grd.addColorStop(0.42, "rgba(34, 70, 92, 0.42)");
    grd.addColorStop(0.78, "rgba(12, 18, 28, 0.7)");
    grd.addColorStop(1, "rgba(8, 10, 16, 0.88)");
  } else if (theme === "rail") {
    grd.addColorStop(0, "rgba(80, 22, 8, 0)");
    grd.addColorStop(0.38, "rgba(180, 62, 18, 0.48)");
    grd.addColorStop(0.72, "rgba(40, 14, 8, 0.72)");
    grd.addColorStop(1, "rgba(12, 8, 6, 0.9)");
  } else {
    grd.addColorStop(0, "rgba(70, 28, 10, 0)");
    grd.addColorStop(0.36, "rgba(210, 88, 28, 0.4)");
    grd.addColorStop(0.7, "rgba(36, 18, 10, 0.68)");
    grd.addColorStop(1, "rgba(10, 8, 6, 0.9)");
  }
  g.fillStyle = grd;
  g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export function paintAtmosphere(scene: THREE.Object3D, mat: Materials, theme: LevelTheme) {
  const haze = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 70),
    new THREE.MeshBasicMaterial({
      map: hazeTex(theme),
      transparent: true,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    }),
  );
  haze.position.set(0, 16, -128);
  scene.add(haze);

  const shaftCol = theme === "spire" ? 0x4aa8bc : 0xff7a28;
  for (let i = 0; i < 5; i++) {
    const shaft = new THREE.Mesh(
      new THREE.PlaneGeometry(7 + i * 2.2, 52),
      new THREE.MeshBasicMaterial({
        color: shaftCol,
        transparent: true,
        opacity: 0.045 + i * 0.008,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        fog: false,
      }),
    );
    shaft.position.set(theme === "spire" ? 28 - i * 8 : -38 + i * 9, 18, -70 - i * 6);
    shaft.rotation.z = theme === "spire" ? 0.42 : -0.55;
    shaft.rotation.y = theme === "spire" ? -0.35 : 0.4;
    scene.add(shaft);
  }

  const fogSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 140),
    new THREE.MeshBasicMaterial({
      color: theme === "spire" ? 0x1a2834 : 0x2a1c14,
      transparent: true,
      opacity: 0.07,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  fogSheet.rotation.x = -Math.PI / 2;
  fogSheet.position.set(0, 0.22, -48);
  scene.add(fogSheet);

  const ridgeMat = new THREE.MeshBasicMaterial({ color: theme === "spire" ? 0x0c1016 : 0x0e0a08 });
  for (const [x, z, w, h, d] of [
    [-48, -40, 22, 18, 14],
    [-52, -78, 18, 24, 12],
    [50, -36, 20, 20, 13],
    [54, -88, 24, 28, 15],
    [0, -148, 80, 16, 18],
  ] as const) {
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ridgeMat);
    ridge.position.set(x, h * 0.28, z);
    scene.add(ridge);
  }

  const bannerCols = theme === "spire" ? [0x22d3ee, 0x5eead4] : [0xe85d04, 0xc45a20];
  for (let i = 0; i < 6; i++) {
    const z = 6 - i * 22;
    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 0.85),
      new THREE.MeshBasicMaterial({
        color: bannerCols[i % 2],
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false,
      }),
    );
    cloth.position.set(0, 4.35, z);
    cloth.rotation.y = 0.08 * (i % 2 ? -1 : 1);
    scene.add(cloth);
    box(mat.dark, 0.06, 0.06, 5.8, 0, 4.8, z, scene);
  }
}

export function dressBuildingMass(
  scene: THREE.Object3D,
  b: AABB,
  mat: Materials,
  facade: THREE.Material,
  building: number,
) {
  const w = b.maxx - b.minx;
  const h = b.maxy - b.miny;
  const d = b.maxz - b.minz;
  const cx = (b.minx + b.maxx) / 2;
  const cz = (b.minz + b.maxz) / 2;
  const face = cx < 0 ? 1 : -1;
  const fx = cx < 0 ? b.maxx + 0.05 : b.minx - 0.05;
  const block = w > 16 || d > 16;

  const parapetH = 0.42;
  box(mat.dark, w + 0.18, parapetH, 0.12, cx, b.maxy + parapetH * 0.5, b.minz - 0.02, scene);
  box(mat.dark, w + 0.18, parapetH, 0.12, cx, b.maxy + parapetH * 0.5, b.maxz + 0.02, scene);
  box(mat.dark, 0.12, parapetH, d + 0.18, b.minx - 0.02, b.maxy + parapetH * 0.5, cz, scene);
  box(mat.dark, 0.12, parapetH, d + 0.18, b.maxx + 0.02, b.maxy + parapetH * 0.5, cz, scene);

  const pentW = Math.max(1.6, w * (block ? 0.22 : 0.48 + (building % 3) * 0.06));
  const pentD = Math.max(1.4, d * (0.38 + (building % 2) * 0.1));
  const pentH = 1.35 + (building % 4) * 0.55;
  const pentX = cx + face * (block ? w * 0.18 : w * 0.08);
  const pentZ = cz + (building % 2 ? d * 0.08 : -d * 0.1);
  box(facade, pentW, pentH, pentD, pentX, b.maxy + pentH * 0.5, pentZ, scene);
  box(mat.metal, pentW + 0.16, 0.1, pentD + 0.16, pentX, b.maxy + pentH + 0.04, pentZ, scene);

  if (h > 7.4 || block) {
    const towerW = Math.max(1.1, pentW * 0.42);
    const towerH = 1.8 + (building % 3) * 0.7;
    box(mat.dark, towerW, towerH, towerW, pentX - face * 0.4, b.maxy + pentH + towerH * 0.5, pentZ, scene);
    cyl(mat.metal, 0.04, 0.04, 1.4, pentX - face * 0.4, b.maxy + pentH + towerH + 0.7, pentZ, scene);
    box(mat.ember, 0.08, 0.08, 0.08, pentX - face * 0.4, b.maxy + pentH + towerH + 1.35, pentZ, scene);
  }

  cyl(mat.rust, 0.16, 0.2, 1.15, cx - face * (w * 0.22), b.maxy + 0.7, cz + d * 0.18, scene, 0, 8);
  box(mat.dark, 0.22, 0.1, 0.22, cx - face * (w * 0.22), b.maxy + 1.3, cz + d * 0.18, scene);

  const hvac = 1 + (building % 3);
  for (let i = 0; i < hvac; i++) {
    box(
      mat.metal,
      0.7,
      0.32,
      0.52,
      cx + face * (w * 0.12) + i * 0.55,
      b.maxy + 0.28,
      cz - d * 0.22 + i * 0.15,
      scene,
    );
  }

  if (!block) {
    const pilW = 0.22;
    const pilD = 0.28;
    for (const zOff of [-d * 0.42, 0, d * 0.42]) {
      box(mat.dark, pilW, h * 0.92, pilD, fx + face * 0.06, b.miny + h * 0.48, cz + zOff, scene);
    }
    box(mat.rust, 0.07, h * 0.7, 0.07, fx + face * 0.1, b.miny + h * 0.42, cz + d * 0.18, scene);
    box(mat.dark, 0.08, h * 0.85, 0.08, fx + face * 0.12, b.miny + h * 0.48, cz - d * 0.36, scene);
  } else {
    const bays = Math.max(4, Math.floor(w / 6.2));
    for (let i = 0; i < bays; i++) {
      const bx = b.minx + 3.2 + i * ((w - 6.4) / Math.max(bays - 1, 1));
      box(mat.dark, 0.28, h * 0.95, 0.32, bx, b.miny + h * 0.5, cz + (cx < 0 ? d * 0.48 : -d * 0.48), scene);
    }
  }

  const endRows = Math.max(1, Math.floor((h - 2.4) / 1.6));
  const endCols = Math.max(2, Math.floor(w / 2.2));
  for (const ez of [b.minz - 0.05, b.maxz + 0.05]) {
    for (let row = 0; row < endRows; row++) {
      for (let col = 0; col < endCols; col++) {
        if ((row + col + building) % 3 === 0) continue;
        const wy = b.miny + 2.6 + row * 1.55;
        if (wy > b.maxy - 0.55) continue;
        const wx = b.minx + 1.1 + col * ((w - 2.2) / Math.max(endCols - 1, 1));
        const lit = (row + col + building) % 5 !== 0;
        box(lit ? ((row + building) % 2 ? mat.ember : mat.neon) : mat.dark, 0.72, 0.95, 0.08, wx, wy, ez, scene);
      }
    }
  }

  if (building % 2) {
    const tag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 0.7),
      new THREE.MeshBasicMaterial({
        color: building % 4 ? 0x5eead4 : 0xe85d04,
        transparent: true,
        opacity: 0.22,
        toneMapped: false,
        depthWrite: false,
      }),
    );
    tag.position.set(fx + face * 0.08, b.miny + 1.55, cz + d * 0.28);
    tag.rotation.y = face > 0 ? -Math.PI / 2 : Math.PI / 2;
    scene.add(tag);
  }

  if (!block && d > 6.4) {
    const landings = Math.min(4, Math.max(2, Math.floor((h - 2.4) / 1.7)));
    const ez = cz + d * 0.38;
    box(mat.dark, 0.08, h * 0.72, 0.08, fx + face * 0.62, b.miny + h * 0.42, ez, scene);
    for (let r = 0; r < landings; r++) {
      box(mat.metal, 0.95, 0.06, 1.15, fx + face * 0.55, b.miny + 2.5 + r * 1.55, ez, scene);
      box(mat.dark, 0.04, 0.7, 1.15, fx + face * 0.98, b.miny + 2.85 + r * 1.55, ez, scene);
    }
  }
}
