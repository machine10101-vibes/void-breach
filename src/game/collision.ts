import type { AABB } from "./types";

export function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}

export function overlapY(feet: number, height: number, b: AABB, slop = 0.08) {
  const top = feet + height;
  return top > b.miny + slop && feet < b.maxy - slop;
}

export function resolveCircleAabb(
  cx: number,
  cz: number,
  r: number,
  b: AABB,
): { x: number; z: number } | null {
  const nx = clamp(cx, b.minx, b.maxx);
  const nz = clamp(cz, b.minz, b.maxz);
  let dx = cx - nx;
  let dz = cz - nz;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r * r) return null;
  if (d2 < 1e-8) {
    const left = cx - b.minx + r;
    const right = b.maxx - cx + r;
    const near = cz - b.minz + r;
    const far = b.maxz - cz + r;
    const m = Math.min(left, right, near, far);
    if (m === left) return { x: b.minx - r, z: cz };
    if (m === right) return { x: b.maxx + r, z: cz };
    if (m === near) return { x: cx, z: b.minz - r };
    return { x: cx, z: b.maxz + r };
  }
  const d = Math.sqrt(d2);
  const push = (r - d) / d;
  return { x: cx + dx * push, z: cz + dz * push };
}

export function collidePlayer(
  boxes: AABB[],
  x: number,
  y: number,
  z: number,
  radius: number,
  height: number,
) {
  let px = x;
  let pz = z;
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    if (!overlapY(y, height, b)) continue;
    const hit = resolveCircleAabb(px, pz, radius, b);
    if (hit) {
      px = hit.x;
      pz = hit.z;
    }
  }
  return { x: px, z: pz };
}

export function groundHeight(boxes: AABB[], x: number, z: number, feet: number, step = 0.55) {
  let y = 0;
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    if (x < b.minx || x > b.maxx || z < b.minz || z > b.maxz) continue;
    if (b.maxy <= feet + step && b.maxy > y) y = b.maxy;
  }
  return y;
}

export function rayAabb(
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  b: AABB,
  maxT: number,
): number | null {
  let tmin = 0;
  let tmax = maxT;
  const orig = [ox, oy, oz];
  const dir = [dx, dy, dz];
  const min = [b.minx, b.miny, b.minz];
  const max = [b.maxx, b.maxy, b.maxz];
  for (let i = 0; i < 3; i++) {
    const d = dir[i];
    if (Math.abs(d) < 1e-8) {
      if (orig[i] < min[i] || orig[i] > max[i]) return null;
      continue;
    }
    const inv = 1 / d;
    let t1 = (min[i] - orig[i]) * inv;
    let t2 = (max[i] - orig[i]) * inv;
    if (t1 > t2) {
      const tmp = t1;
      t1 = t2;
      t2 = tmp;
    }
    tmin = t1 > tmin ? t1 : tmin;
    tmax = t2 < tmax ? t2 : tmax;
    if (tmin > tmax) return null;
  }
  return tmin >= 0 ? tmin : tmax >= 0 ? 0 : null;
}

export function rayWorld(
  boxes: AABB[],
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  maxT: number,
  filter?: (b: AABB) => boolean,
) {
  let best = maxT;
  let hit = false;
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    if (filter && !filter(b)) continue;
    const t = rayAabb(ox, oy, oz, dx, dy, dz, b, best);
    if (t !== null && t < best) {
      best = t;
      hit = true;
    }
  }
  return hit ? best : null;
}
