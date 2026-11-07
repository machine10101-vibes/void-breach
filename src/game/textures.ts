import * as THREE from "three";

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0);
  const b = hash(x0 + 1, y0);
  const c = hash(x0, y0 + 1);
  const d = hash(x0 + 1, y0 + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number, oct = 5) {
  let a = 0.5;
  let f = 1;
  let s = 0;
  for (let i = 0; i < oct; i++) {
    s += valueNoise(x * f, y * f) * a;
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}

export function makeSeamlessNoise(size = 256, scale = 6, seed = 1.7) {
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n =
        fbm(u * scale + seed, v * scale + seed) * (1 - u) * (1 - v) +
        fbm((u - 1) * scale + seed, v * scale + seed) * u * (1 - v) +
        fbm(u * scale + seed, (v - 1) * scale + seed) * (1 - u) * v +
        fbm((u - 1) * scale + seed, (v - 1) * scale + seed) * u * v;
      data[y * size + x] = Math.max(0, Math.min(255, n * 255));
    }
  }
  return data;
}

export function makeNormalFromHeight(height: Uint8Array, size: number, strength = 2.4) {
  const rgba = new Uint8Array(size * size * 4);
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)] / 255;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      let nx = -dx;
      let ny = -dy;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;
      const i = (y * size + x) * 4;
      rgba[i] = (nx * 0.5 + 0.5) * 255;
      rgba[i + 1] = (ny * 0.5 + 0.5) * 255;
      rgba[i + 2] = (nz * 0.5 + 0.5) * 255;
      rgba[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(rgba, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export type SurfaceProfile = "noise" | "panel" | "weave" | "stone" | "course";

function clampByte(n: number) {
  return Math.max(0, Math.min(255, n));
}

function makePanelHeight(size: number) {
  const data = new Uint8Array(size * size);
  const cell = Math.floor(size / 8);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x % cell) / cell;
      const fy = (y % cell) / cell;
      const edge = fx < 0.07 || fy < 0.07 || fx > 0.93 || fy > 0.93;
      const rivet =
        (fx > 0.12 && fx < 0.18 && fy > 0.12 && fy < 0.18) ||
        (fx > 0.82 && fx < 0.88 && fy > 0.12 && fy < 0.18) ||
        (fx > 0.12 && fx < 0.18 && fy > 0.82 && fy < 0.88);
      const scratch = Math.abs(Math.sin(x * 0.71 + y * 0.17)) > 0.992;
      let h = edge ? 78 : 148;
      if (rivet) h = 214;
      if (scratch) h = 64;
      data[y * size + x] = h;
    }
  }
  return data;
}

function makeWeaveHeight(size: number) {
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const warp = 0.5 + 0.5 * Math.sin((x / size) * Math.PI * 64);
      const weft = 0.5 + 0.5 * Math.sin((y / size) * Math.PI * 64);
      const fiber = warp * 0.65 + weft * 0.35;
      data[y * size + x] = clampByte(90 + fiber * 110);
    }
  }
  return data;
}

function makeStoneHeight(size: number) {
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const grit = valueNoise(u * 28 + 2.2, v * 28 + 1.4);
      const pit = valueNoise(u * 9 + 6, v * 9 + 3);
      const crack = Math.abs(Math.sin(u * 40 + v * 6)) > 0.985 ? 0.35 : 0;
      data[y * size + x] = clampByte((grit * 0.72 + pit * 0.28 - crack) * 255);
    }
  }
  return data;
}

function makeCourseHeight(size: number) {
  const data = new Uint8Array(size * size);
  const row = Math.floor(size / 10);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fy = (y % row) / row;
      const brick = fy < 0.08 || fy > 0.94;
      const mortar = ((x + (Math.floor(y / row) % 2) * (row / 2)) % row) / row < 0.06;
      const grit = hash(x * 0.15, y * 0.15);
      let h = brick || mortar ? 70 : 150 + grit * 40;
      data[y * size + x] = clampByte(h);
    }
  }
  return data;
}

function heightFor(profile: SurfaceProfile, size: number, metal: boolean) {
  if (profile === "panel") return makePanelHeight(size);
  if (profile === "weave") return makeWeaveHeight(size);
  if (profile === "stone") return makeStoneHeight(size);
  if (profile === "course") return makeCourseHeight(size);
  return makeSeamlessNoise(size, metal ? 14 : 7, metal ? 2.2 : 1.4);
}

export function makeRoughnessMap(size = 256, base = 0.62, variation = 0.28, height?: Uint8Array) {
  const src = height ?? makeSeamlessNoise(size, 9, 4.2);
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const n = src[i] / 255;
    const r = Math.max(0, Math.min(1, base + (n - 0.5) * variation * 2));
    const o = i * 4;
    const v = r * 255;
    data[o] = v;
    data[o + 1] = v;
    data[o + 2] = v;
    data[o + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function makeEmissiveCrackMap(size = 256) {
  const height = makeSeamlessNoise(size, 5, 8.1);
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const n = height[i] / 255;
    const crack = n > 0.58 && n < 0.64 ? 1 : n > 0.42 && n < 0.45 ? 0.55 : 0;
    const o = i * 4;
    data[o] = 40 * crack;
    data[o + 1] = 220 * crack;
    data[o + 2] = 200 * crack;
    data[o + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function bindPbr(
  mat: THREE.MeshStandardMaterial,
  map: THREE.Texture | undefined,
  opts?: { repeat?: number; metal?: boolean; glow?: boolean; bump?: number; profile?: SurfaceProfile },
) {
  const size = 256;
  const profile = opts?.profile ?? "noise";
  const height = heightFor(profile, size, Boolean(opts?.metal));
  const bump = opts?.bump ?? (opts?.metal ? 0.72 : 0.95);
  const machined = profile === "panel" || profile === "course";
  mat.normalMap = makeNormalFromHeight(height, size, opts?.metal || machined ? 2.4 : 3.2);
  mat.normalScale = new THREE.Vector2(bump, bump);
  mat.roughnessMap = makeRoughnessMap(size, opts?.metal ? 0.28 : 0.72, profile === "weave" ? 0.16 : 0.3, height);
  mat.envMapIntensity = opts?.metal ? 1.28 : 0.78;
  if (map) {
    mat.map = map;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    const r = opts?.repeat ?? 1;
    map.repeat.set(r, r);
  }
  if (opts?.glow) {
    mat.emissiveMap = makeEmissiveCrackMap(size);
    if (!mat.emissive.getHex()) mat.emissive = new THREE.Color(0x2dd4bf);
  }
  mat.needsUpdate = true;
}
