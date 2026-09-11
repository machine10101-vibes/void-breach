import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createAmmoMesh, createArmorMesh, createWeaponMesh, makeMaterials } from "./meshes";
import type { InvItem } from "./types";

type Job = {
  canvas: HTMLCanvasElement;
  item: InvItem;
  mesh: THREE.Object3D;
};

const jobs = new Set<Job>();
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let mat = makeMaterials({});
let raf = 0;

function ensureHost() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.setSize(160, 128, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x1a2430, 1.7));
  scene.add(new THREE.AmbientLight(0xd8c8b4, 0.85));
  const key = new THREE.DirectionalLight(0xffe8cc, 3.4);
  key.position.set(1.8, 2.6, 2.2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x7eeae0, 1.35);
  fill.position.set(-2.2, 1.2, -1.2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xff8a3a, 0.9);
  rim.position.set(0.2, 1.8, -2.4);
  scene.add(rim);
  camera = new THREE.PerspectiveCamera(28, 160 / 128, 0.08, 20);
  camera.position.set(0.62, 0.38, 1.05);
  camera.lookAt(0, 0.02, 0);
}

function buildMesh(item: InvItem) {
  if (item.kind === "weapon") return createWeaponMesh(item.weaponId ?? "ar", mat, item.rarity);
  if (item.kind === "ammo") return createAmmoMesh(item.ammoId ?? "rifle", mat);
  return createArmorMesh(item.slot ?? "chest", mat, item.rarity, item.name);
}

function tick() {
  raf = 0;
  if (!renderer || !scene || !camera || jobs.size === 0) return;
  const t = performance.now() * 0.001;
  for (const job of jobs) {
    job.mesh.rotation.y = t * 0.7;
    scene.add(job.mesh);
    renderer.render(scene, camera);
    const ctx = job.canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, job.canvas.width, job.canvas.height);
      ctx.drawImage(renderer.domElement, 0, 0, job.canvas.width, job.canvas.height);
    }
    scene.remove(job.mesh);
  }
  raf = requestAnimationFrame(tick);
}

function kick() {
  if (!raf && jobs.size) raf = requestAnimationFrame(tick);
}

export function attachItemPreview(canvas: HTMLCanvasElement, item: InvItem) {
  ensureHost();
  const mesh = buildMesh(item);
  const job: Job = { canvas, item, mesh };
  jobs.add(job);
  kick();
  return () => {
    jobs.delete(job);
    mesh.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    if (!jobs.size && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

export function ItemPreview({ item }: { item: InvItem }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return attachItemPreview(canvas, item);
  }, [item.uid, item.kind, item.weaponId, item.ammoId, item.slot, item.rarity, item.name]);
  return <canvas ref={ref} width={160} height={128} className="h-16 w-20 shrink-0 rounded-md bg-bg/60" aria-hidden />;
}
