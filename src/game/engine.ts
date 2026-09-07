import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GameAudio } from "./audio";
import { collidePlayer, groundHeight, rayWorld, clamp } from "./collision";
import { buildLevel } from "./level";
import {
  addWorldFromBoxes,
  createCar,
  createExoSuit,
  createLamp,
  createRifle,
  createRubble,
  createShade,
  createShotgun,
  createSmg,
  createVoidGate,
  makeMaterials,
  type EnemyRig,
  type Materials,
  type PlayerRig,
} from "./meshes";
import type {
  ControlsProbe,
  EnemyKind,
  HudSnapshot,
  Phase,
  Rarity,
  WeaponId,
} from "./types";

const PLAYER_R = 0.38;
const PLAYER_H = 1.72;
const GRAVITY = 22;
const WALK = 5.4;
const SPRINT = 8.6;
const DODGE_SPEED = 14;
const SENS = 0.00215;

type Weapon = {
  id: WeaponId;
  name: string;
  rarity: Rarity;
  dmg: number;
  pellets: number;
  rpm: number;
  mag: number;
  reserve: number;
  spread: number;
  range: number;
  reload: number;
};

type Enemy = {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  z: number;
  hp: number;
  max: number;
  yaw: number;
  attackCd: number;
  alive: true | false;
  flash: number;
  rig: EnemyRig;
  radius: number;
  speed: number;
  aggro: boolean;
  phase: number;
};

type BulletFx = { mesh: THREE.Line; life: number };
type Drop = {
  mesh: THREE.Group;
  x: number;
  z: number;
  kind: "gold" | "health" | "weapon";
  weapon?: Weapon;
  amount: number;
  rarity: Rarity;
};

function defaultWeapons(): Weapon[] {
  return [
    { id: "ar", name: "Vanguard ARX", rarity: "common", dmg: 19, pellets: 1, rpm: 560, mag: 32, reserve: 160, spread: 0.018, range: 78, reload: 1.45 },
    { id: "shotgun", name: "Spartan 12G", rarity: "magic", dmg: 11, pellets: 8, rpm: 78, mag: 6, reserve: 36, spread: 0.11, range: 16, reload: 1.9 },
    { id: "smg", name: "Cinder SMG", rarity: "common", dmg: 12, pellets: 1, rpm: 880, mag: 40, reserve: 200, spread: 0.04, range: 38, reload: 1.25 },
  ];
}

function rarityColor(r: Rarity) {
  return r === "legendary" ? 0xfb923c : r === "rare" ? 0xc4b5fd : r === "magic" ? 0x60a5fa : 0xd6d3d1;
}

function enemyStats(kind: EnemyKind) {
  if (kind === "harbinger") return { hp: 2200, radius: 1.15, speed: 2.4, dmg: 28 };
  if (kind === "brute") return { hp: 420, radius: 0.7, speed: 2.8, dmg: 22 };
  if (kind === "stalker") return { hp: 140, radius: 0.45, speed: 4.4, dmg: 12 };
  return { hp: 90, radius: 0.42, speed: 4.8, dmg: 14 };
}

export type GameHandle = {
  destroy: () => void;
  startMission: () => void;
  pause: () => void;
  resume: () => void;
  setMuted: (m: boolean) => void;
  setTouchMove: (x: number, y: number) => void;
  setTouchLook: (dx: number, dy: number) => void;
  setAction: (name: string, down: boolean) => void;
  pulse: (name: string) => void;
};

export function mountGame(
  canvas: HTMLCanvasElement,
  onHud: (h: HudSnapshot) => void,
): GameHandle {
  const level = buildLevel();
  const audio = new GameAudio();
  const keys = new Set<string>();
  const qaKeys = { active: false, codes: [] as string[] };
  const touch = { mx: 0, my: 0, lookX: 0, lookY: 0 };
  const held = { fire: false, sprint: false, dodge: false, frag: false, overdrive: false, cleave: false, reload: false };

  let phase: Phase = "title";
  let destroyed = false;
  let yaw = 0;
  let pitch = 0.12;
  let px = level.spawn.x;
  let py = 0;
  let pz = level.spawn.z;
  let vy = 0;
  let grounded = true;
  let dodgeT = 0;
  let dodgeDirX = 0;
  let dodgeDirZ = 0;
  let invuln = 0;
  let hp = 200;
  let maxHp = 200;
  let shield = 110;
  let maxShield = 110;
  let shieldCd = 0;
  let gold = 0;
  let kills = 0;
  let xp = 0;
  let pLevel = 1;
  let weaponIdx = 0;
  const weapons = defaultWeapons();
  let mag = weapons[0].mag;
  let fireCd = 0;
  let reloadT = 0;
  let overdriveT = 0;
  let skillCd = { frag: 0, overdrive: 0, cleave: 0 };
  let shake = 0;
  let hitFlash = 0;
  let footT = 0;
  let objective = "Push through Ashfall Gate";
  let hint = "WASD move · Mouse aim · Click fire";
  let loot: HudSnapshot["loot"] = [];
  let lootId = 0;
  let enemyId = 0;
  let hudAcc = 0;
  let spawned = new Set<string>();
  let bossAlive = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a120c);
  scene.fog = new THREE.FogExp2(0x1a120c, 0.022);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.12, 220);
  const hemi = new THREE.HemisphereLight(0xc4a070, 0x1a140f, 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffc58a, 2.15);
  sun.position.set(-28, 34, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 2;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const amb = new THREE.AmbientLight(0x2a241c, 0.35);
  scene.add(amb);

  const textures: { ground?: THREE.Texture; wall?: THREE.Texture; metal?: THREE.Texture; sky?: THREE.Texture } = {};
  const loader = new THREE.TextureLoader();
  const loadTex = (url: string, repeat: number) =>
    new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
        url,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(repeat, repeat);
          t.anisotropy = 8;
          resolve(t);
        },
        undefined,
        reject,
      );
    });

  let mat!: Materials;
  let playerRig!: PlayerRig;
  const enemies: Enemy[] = [];
  const fx: BulletFx[] = [];
  const drops: Drop[] = [];
  const muzzleLight = new THREE.PointLight(0xffaa55, 0, 8, 2);
  scene.add(muzzleLight);
  const drone = new THREE.Group();
  let composer: EffectComposer | null = null;
  const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820;
  let worldBuilt = false;
  let prevSlot = 0;
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const tmpV = new THREE.Vector3();

  const groundGeo = new THREE.PlaneGeometry(160, 180, 1, 1);
  groundGeo.rotateX(-Math.PI / 2);

  function setupWorld() {
    if (worldBuilt) return;
    worldBuilt = true;
    mat = makeMaterials(textures);
    const ground = new THREE.Mesh(groundGeo, mat.concrete);
    ground.receiveShadow = true;
    ground.position.set(0, 0, -48);
    scene.add(ground);
    if (textures.ground) {
      const g = textures.ground.clone();
      g.repeat.set(28, 32);
      g.needsUpdate = true;
      mat.concrete.map = g;
      mat.concrete.needsUpdate = true;
    }
    addWorldFromBoxes(scene, level.boxes, mat);
    for (const [x, z] of level.lamps) {
      const lamp = createLamp(mat);
      lamp.position.set(x, 0, z);
      scene.add(lamp);
    }
    for (const [x, z] of level.rubble) {
      const r = createRubble(mat);
      r.position.set(x, 0, z);
      scene.add(r);
    }
    for (const [x, z, rot] of level.cars) {
      const c = createCar(mat);
      c.position.set(x, 0, z);
      c.rotation.y = rot;
      scene.add(c);
    }
    const gate = createVoidGate(mat);
    gate.position.set(level.gate.x, 2.4, level.gate.z);
    scene.add(gate);
    const riftLight = new THREE.PointLight(0x22d3ee, 6, 28, 1.6);
    riftLight.position.set(level.gate.x, 3.2, level.gate.z);
    scene.add(riftLight);

    if (textures.sky) {
      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(160, 24, 16),
        new THREE.MeshBasicMaterial({ map: textures.sky, side: THREE.BackSide, fog: false, depthWrite: false }),
      );
      sky.position.set(0, 20, -20);
      scene.add(sky);
    }

    playerRig = createExoSuit(mat);
    scene.add(playerRig.group);
    const dCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), mat.ember);
    drone.add(dCore);
    scene.add(drone);

    if (!isMobile) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.28, 0.7, 0.82);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
    }
    resize();
  }

  void Promise.allSettled([
    loadTex("/art/ground.jpg", 18).then((t) => (textures.ground = t)),
    loadTex("/art/wall.jpg", 4).then((t) => (textures.wall = t)),
    loadTex("/art/metal.jpg", 3).then((t) => (textures.metal = t)),
    loadTex("/art/sky.jpg", 1).then((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      textures.sky = t;
    }),
  ]).then(() => {
    if (!worldBuilt) setupWorld();
    else if (mat) {
      if (textures.ground) {
        mat.concrete.map = textures.ground;
        mat.concrete.needsUpdate = true;
      }
      if (textures.wall) {
        mat.wall.map = textures.wall;
        mat.wall.needsUpdate = true;
      }
      if (textures.metal) {
        mat.metal.map = textures.metal;
        mat.metal.needsUpdate = true;
      }
    }
  });

  const tracerGeo = new THREE.BufferGeometry();
  const tracerMat = new THREE.LineBasicMaterial({ color: 0xffc58a, transparent: true, opacity: 0.85 });

  function forward() {
    return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  }
  function rightV() {
    return { x: Math.cos(yaw), z: -Math.sin(yaw) };
  }

  function currentWeapon() {
    return weapons[weaponIdx];
  }

  function pushLoot(name: string, rarity: Rarity) {
    loot = [{ id: lootId++, name, rarity }, ...loot].slice(0, 5);
    audio.pickup();
  }

  function spawnEnemy(kind: EnemyKind, x: number, z: number) {
    if (!mat) return;
    const st = enemyStats(kind);
    const rig = createShade(kind, mat);
    rig.group.position.set(x, 0, z);
    scene.add(rig.group);
    enemies.push({
      id: enemyId++,
      kind,
      x,
      y: 0,
      z,
      hp: st.hp,
      max: st.hp,
      yaw: 0,
      attackCd: 0.6,
      alive: true,
      flash: 0,
      rig,
      radius: st.radius,
      speed: st.speed,
      aggro: true,
      phase: 0,
    });
    if (kind === "harbinger") bossAlive = true;
  }

  function rollDrop(x: number, z: number, kind: EnemyKind) {
    if (!mat) return;
    const roll = Math.random();
    if (kind === "harbinger" || roll > 0.35) {
      const g = new THREE.Group();
      const rarity: Rarity =
        kind === "harbinger" ? "legendary" : roll > 0.92 ? "legendary" : roll > 0.78 ? "rare" : roll > 0.5 ? "magic" : "common";
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        new THREE.MeshStandardMaterial({
          color: rarityColor(rarity),
          emissive: rarityColor(rarity),
          emissiveIntensity: 1.8,
          roughness: 0.3,
        }),
      );
      g.add(gem);
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6),
        new THREE.MeshBasicMaterial({ color: rarityColor(rarity), transparent: true, opacity: 0.45 }),
      );
      beam.position.y = 1.2;
      g.add(beam);
      g.position.set(x, 0.2, z);
      scene.add(g);
      const w: Weapon | undefined =
        rarity === "common" && Math.random() < 0.55
          ? undefined
          : {
              ...currentWeapon(),
              name:
                (rarity === "legendary" ? "Mythic " : rarity === "rare" ? "Rare " : rarity === "magic" ? "Tuned " : "") +
                (Math.random() > 0.5 ? "ARX-Void" : "Spartan Edge"),
              id: Math.random() > 0.5 ? "ar" : "shotgun",
              rarity,
              dmg: currentWeapon().dmg * (rarity === "legendary" ? 1.7 : rarity === "rare" ? 1.35 : 1.15),
            };
      drops.push({
        mesh: g,
        x,
        z,
        kind: w ? "weapon" : Math.random() > 0.45 ? "health" : "gold",
        weapon: w,
        amount: w ? 0 : 40 + Math.floor(Math.random() * 80),
        rarity,
      });
    }
  }

  function killEnemy(e: Enemy) {
    e.alive = false;
    e.hp = 0;
    scene.remove(e.rig.group);
    kills++;
    xp += e.kind === "harbinger" ? 800 : e.kind === "brute" ? 120 : 40;
    while (xp >= pLevel * 200) {
      xp -= pLevel * 200;
      pLevel++;
      maxHp += 12;
      hp = Math.min(maxHp, hp + 20);
    }
    gold += 12 + Math.floor(Math.random() * 24);
    rollDrop(e.x, e.z, e.kind);
    if (e.kind === "harbinger") {
      bossAlive = false;
      phase = "victory";
      objective = "Harbinger down — Void Gate sealed";
      hint = "Ashfall Gate is yours";
    }
  }

  function damageEnemy(e: Enemy, dmg: number) {
    e.hp -= dmg;
    e.flash = 0.12;
    audio.hit();
    if (e.hp <= 0) killEnemy(e);
  }

  function hurtPlayer(dmg: number) {
    if (invuln > 0 || phase !== "playing") return;
    let rest = dmg;
    if (shield > 0) {
      const s = Math.min(shield, rest);
      shield -= s;
      rest -= s;
    }
    if (rest > 0) hp -= rest;
    shieldCd = 3.2;
    hitFlash = 0.35;
    shake = 0.28;
    audio.hurt();
    if (hp <= 0) {
      hp = 0;
      phase = "dead";
      hint = "Deploy again";
    }
  }

  function aimRay() {
    const ndc = new THREE.Vector2(0, 0);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    return { origin: ray.ray.origin.clone(), dir: ray.ray.direction.clone() };
  }

  function fireWeapon() {
    const w = currentWeapon();
    if (reloadT > 0 || mag <= 0) {
      if (mag <= 0 && reloadT <= 0) startReload();
      return;
    }
    const interval = 60 / (w.rpm * (overdriveT > 0 ? 1.35 : 1));
    if (fireCd > 0) return;
    fireCd = interval;
    mag -= 1;
    audio.fire(w.id);
    shake = Math.max(shake, w.id === "shotgun" ? 0.22 : 0.08);
    pitch += w.id === "shotgun" ? 0.03 : 0.01;
    muzzleLight.intensity = 6;
    const { origin, dir } = aimRay();
    const pellets = w.pellets;
    for (let p = 0; p < pellets; p++) {
      const spread = w.spread * (1 + (1 - mag / w.mag) * 0.4);
      const d = dir.clone();
      d.x += (Math.random() - 0.5) * spread;
      d.y += (Math.random() - 0.5) * spread * 0.6;
      d.z += (Math.random() - 0.5) * spread;
      d.normalize();
      const worldT = rayWorld(level.boxes, origin.x, origin.y, origin.z, d.x, d.y, d.z, w.range);
      let bestT = worldT ?? w.range;
      let hit: Enemy | null = null;
      for (const e of enemies) {
        if (!e.alive) continue;
        const toE = new THREE.Vector3(e.x - origin.x, 1.1 - origin.y + (e.kind === "harbinger" ? 1.2 : 0), e.z - origin.z);
        const t = toE.dot(d);
        if (t < 0 || t > bestT) continue;
        const closest = tmpV.copy(origin).addScaledVector(d, t);
        const dist = Math.hypot(closest.x - e.x, closest.z - e.z);
        if (dist < e.radius + 0.15) {
          bestT = t;
          hit = e;
        }
      }
      if (hit) damageEnemy(hit, w.dmg * (overdriveT > 0 ? 1.25 : 1) * (0.85 + Math.random() * 0.3));
      const end = origin.clone().addScaledVector(d, Math.min(bestT, 42));
      const geo = tracerGeo.clone();
      geo.setFromPoints([origin.clone().addScaledVector(d, 0.6), end]);
      const line = new THREE.Line(geo, tracerMat.clone());
      scene.add(line);
      fx.push({ mesh: line, life: 0.06 });
    }
    if (mag <= 0) startReload();
  }

  function startReload() {
    const w = currentWeapon();
    if (reloadT > 0 || mag >= w.mag || w.reserve <= 0) return;
    reloadT = w.reload;
  }

  function finishReload() {
    const w = currentWeapon();
    const need = w.mag - mag;
    const take = Math.min(need, w.reserve);
    mag += take;
    w.reserve -= take;
    reloadT = 0;
  }

  function throwFrag() {
    if (skillCd.frag > 0) return;
    skillCd.frag = 8;
    audio.fire("frag");
    const f = forward();
    const cx = px + f.x * 7;
    const cz = pz + f.z * 7;
    shake = 0.4;
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - cx, e.z - cz);
      if (d < 5.2) damageEnemy(e, 110 * (1 - d / 5.2));
    }
  }

  function cleave() {
    if (skillCd.cleave > 0) return;
    skillCd.cleave = 7;
    audio.fire("shotgun");
    invuln = 0.25;
    const f = forward();
    dodgeT = 0.18;
    dodgeDirX = f.x;
    dodgeDirZ = f.z;
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.x - px;
      const dz = e.z - pz;
      const dist = Math.hypot(dx, dz);
      if (dist < 3.2 && dx * f.x + dz * f.z > 0) damageEnemy(e, 85);
    }
  }

  function swapGunMesh() {
    if (!playerRig || !mat) return;
    playerRig.rightArm.remove(playerRig.gun);
    const id = currentWeapon().id;
    const g = id === "shotgun" ? createShotgun(mat) : id === "smg" ? createSmg(mat) : createRifle(mat);
    g.position.set(0.22, -0.52, 0.28);
    g.rotation.set(-0.12, 0.12, 0.08);
    playerRig.rightArm.add(g);
    playerRig.gun = g;
  }

  function keySet() {
    return qaKeys.active ? new Set(qaKeys.codes) : keys;
  }

  function inputMove() {
    const k = keySet();
    let x = touch.mx;
    let y = touch.my;
    if (k.has("KeyW") || k.has("ArrowUp")) y += 1;
    if (k.has("KeyS") || k.has("ArrowDown")) y -= 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) x -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) x += 1;
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    return { x, y };
  }

  function maybeSpawn() {
    for (const s of level.spawners) {
      if (spawned.has(s.id)) continue;
      if (pz > s.zTrigger) continue;
      spawned.add(s.id);
      objective = s.message;
      hint = s.id === "gate" ? "Burn the Harbinger" : "Clear the pack, then push";
      for (const e of s.enemies) spawnEnemy(e.kind, e.x, e.z);
    }
  }

  function updateEnemies(dt: number) {
    for (const e of enemies) {
      if (!e.alive) continue;
      e.attackCd -= dt;
      e.flash = Math.max(0, e.flash - dt);
      const dx = px - e.x;
      const dz = pz - e.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      e.yaw = Math.atan2(-dx, -dz);
      const st = enemyStats(e.kind);
      const stop = e.kind === "stalker" ? 9 : e.radius + 1.15;
      if (dist > stop) {
        const sp = e.speed * dt;
        e.x += (dx / dist) * sp;
        e.z += (dz / dist) * sp;
        const c = collidePlayer(level.boxes, e.x, 0, e.z, e.radius, 1.8);
        e.x = c.x;
        e.z = c.z;
      }
      if (e.kind === "stalker" && dist < 16 && e.attackCd <= 0) {
        e.attackCd = 1.35;
        const los = rayWorld(level.boxes, e.x, 1.2, e.z, dx / dist, 0, dz / dist, dist);
        if (los === null || los > dist - 0.4) hurtPlayer(st.dmg);
      }
      if (e.kind !== "stalker" && dist < e.radius + 1.05 && e.attackCd <= 0) {
        e.attackCd = e.kind === "harbinger" ? 1.6 : 1.1;
        hurtPlayer(st.dmg);
      }
      if (e.kind === "harbinger") {
        e.phase += dt;
        if (e.hp < e.max * 0.6 && e.phase > 6) {
          e.phase = 0;
          spawnEnemy("husk", e.x + 3, e.z);
          spawnEnemy("husk", e.x - 3, e.z);
        }
        if (e.attackCd <= 0.01 && dist < 18 && Math.random() < 0.02) {
          const beam = dx / dist * 0 + dz / dist;
          void beam;
          if (dist < 14) hurtPlayer(18);
        }
      }
      e.rig.group.position.set(e.x, 0, e.z);
      e.rig.group.lookAt(px, 0, pz);
      const pulse = 1 + Math.sin(performance.now() * 0.008 + e.id) * 0.15;
      for (const g of e.rig.glow) {
        const m = g.material as THREE.MeshStandardMaterial;
        if (m.emissiveIntensity !== undefined) m.emissiveIntensity = (e.flash > 0 ? 8 : 3.2) * pulse;
      }
    }
  }

  function updateDrops(dt: number) {
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.mesh.rotation.y += dt * 1.6;
      d.mesh.position.y = 0.25 + Math.sin(performance.now() * 0.004 + i) * 0.08;
      if (Math.hypot(d.x - px, d.z - pz) < 1.3) {
        if (d.kind === "health") {
          hp = Math.min(maxHp, hp + 45);
          pushLoot("Health orb", "magic");
        } else if (d.kind === "gold") {
          gold += d.amount;
          pushLoot(`${d.amount} scrap`, "common");
        } else if (d.weapon) {
          weapons[weaponIdx] = { ...d.weapon, mag: d.weapon.mag, reserve: d.weapon.reserve };
          mag = d.weapon.mag;
          pushLoot(d.weapon.name, d.weapon.rarity);
          swapGunMesh();
        }
        scene.remove(d.mesh);
        drops.splice(i, 1);
      }
    }
  }

  function snapshot(): HudSnapshot {
    const w = currentWeapon();
    const boss = enemies.find((e) => e.kind === "harbinger" && e.alive);
    return {
      phase,
      health: hp,
      maxHealth: maxHp,
      shield,
      maxShield,
      ammo: mag,
      magSize: w.mag,
      reserve: w.reserve,
      weapon: w.id,
      weaponName: w.name,
      rarity: w.rarity,
      gold,
      kills,
      objective,
      hint,
      skills: [
        { id: "frag", key: "Q", name: "Frag", cd: skillCd.frag, max: 8, ready: skillCd.frag <= 0 },
        { id: "overdrive", key: "E", name: "Overdrive", cd: skillCd.overdrive, max: 16, ready: skillCd.overdrive <= 0 },
        { id: "cleave", key: "F", name: "Cleave", cd: skillCd.cleave, max: 7, ready: skillCd.cleave <= 0 },
      ],
      loot,
      reloading: reloadT > 0,
      overdrive: overdriveT > 0,
      sprinting: held.sprint || keySet().has("ShiftLeft") || keySet().has("ShiftRight"),
      boss: boss ? { name: "Void Harbinger", hp: boss.hp, max: boss.max } : bossAlive ? { name: "Void Harbinger", hp: 0, max: 1 } : null,
      hitFlash,
      xp,
      level: pLevel,
    };
  }

  function emitHud(force = false) {
    hudAcc += 1;
    if (force || hudAcc > 3) {
      hudAcc = 0;
      onHud(snapshot());
    }
  }

  function step(dt: number) {
    if (phase !== "playing" && phase !== "title") return;
    if (phase === "title") return;

    const k = keySet();
    yaw -= touch.lookX;
    pitch -= touch.lookY;
    touch.lookX = 0;
    touch.lookY = 0;
    pitch = clamp(pitch, -0.55, 0.42);

    if (k.has("Digit1") || k.has("Digit2") || k.has("Digit3")) {
      const slot = k.has("Digit1") ? 1 : k.has("Digit2") ? 2 : 3;
      if (slot !== prevSlot) {
        weaponIdx = slot - 1;
        mag = Math.min(mag, currentWeapon().mag);
        swapGunMesh();
      }
      prevSlot = slot;
    } else {
      prevSlot = 0;
    }
    if (k.has("KeyR") || held.reload) startReload();
    if ((k.has("KeyQ") || held.frag) && skillCd.frag <= 0) throwFrag();
    if ((k.has("KeyE") || held.overdrive) && skillCd.overdrive <= 0) {
      skillCd.overdrive = 16;
      overdriveT = 6;
    }
    if ((k.has("KeyF") || held.cleave) && skillCd.cleave <= 0) cleave();

    fireCd = Math.max(0, fireCd - dt);
    if (reloadT > 0) {
      reloadT -= dt;
      if (reloadT <= 0) finishReload();
    }
    skillCd.frag = Math.max(0, skillCd.frag - dt);
    skillCd.overdrive = Math.max(0, skillCd.overdrive - dt);
    skillCd.cleave = Math.max(0, skillCd.cleave - dt);
    overdriveT = Math.max(0, overdriveT - dt);
    invuln = Math.max(0, invuln - dt);
    shake *= Math.pow(0.04, dt);
    hitFlash = Math.max(0, hitFlash - dt);
    dodgeT = Math.max(0, dodgeT - dt);
    muzzleLight.intensity *= Math.pow(0.001, dt);

    const mv = inputMove();
    const sprint = held.sprint || k.has("ShiftLeft") || k.has("ShiftRight");
    const speed = (sprint ? SPRINT : WALK) * (overdriveT > 0 ? 1.2 : 1);
    const f = forward();
    const r = rightV();
    let wishX = f.x * mv.y + r.x * mv.x;
    let wishZ = f.z * mv.y + r.z * mv.x;
    if (k.has("Space") && dodgeT <= 0) {
      dodgeT = 0.32;
      invuln = 0.32;
      const magw = Math.hypot(wishX, wishZ) || 1;
      dodgeDirX = wishX / magw || f.x;
      dodgeDirZ = wishZ / magw || f.z;
    }
    if (dodgeT > 0) {
      wishX = dodgeDirX;
      wishZ = dodgeDirZ;
    }
    const sp = dodgeT > 0 ? DODGE_SPEED : speed;
    px += wishX * sp * dt;
    pz += wishZ * sp * dt;
    const col = collidePlayer(level.boxes, px, py, pz, PLAYER_R, PLAYER_H);
    px = col.x;
    pz = col.z;
    const gh = groundHeight(level.boxes, px, pz, py);
    vy -= GRAVITY * dt;
    py += vy * dt;
    if (py <= gh) {
      py = gh;
      vy = 0;
      grounded = true;
    } else grounded = false;

    const moving = Math.hypot(wishX, wishZ) > 0.1 && grounded;
    if (moving) {
      footT += dt * (sprint ? 2.4 : 1.7);
      if (footT > 1) {
        footT = 0;
        audio.foot();
      }
    }

    if (held.fire || k.has("Mouse0")) fireWeapon();

    shieldCd -= dt;
    if (shieldCd <= 0 && shield < maxShield) shield = Math.min(maxShield, shield + 28 * dt);

    maybeSpawn();
    updateEnemies(dt);
    updateDrops(dt);

    if (playerRig) {
      const t = performance.now() * 0.001;
      const bob = moving ? Math.sin(t * (sprint ? 12 : 8)) : 0;
      playerRig.leftThigh.rotation.x = bob * 0.7;
      playerRig.rightThigh.rotation.x = -bob * 0.7;
      playerRig.leftArm.rotation.x = -bob * 0.25;
      playerRig.rightArm.rotation.x = bob * 0.15 - (fireCd > 0 ? 0.12 : 0);
      playerRig.group.position.set(px, py, pz);
      playerRig.group.rotation.y = yaw + Math.PI;
      playerRig.torso.rotation.x = pitch * 0.25;
    }
    const ang = performance.now() * 0.0018;
    drone.position.set(px + Math.cos(ang) * 1.1, py + 1.7, pz + Math.sin(ang) * 1.1);
    muzzleLight.position.set(px + f.x * 0.8, py + 1.4, pz + f.z * 0.8);

    if (!bossAlive && spawned.has("gate") && !enemies.some((e) => e.alive && e.kind === "harbinger") && phase === "playing") {
      // victory handled in kill
    }

    const lookY = py + 1.55;
    const dist = 5.6;
    const behindX = Math.sin(yaw);
    const behindZ = Math.cos(yaw);
    const camX = px + behindX * dist * Math.cos(pitch) + r.x * 0.72;
    const camY = lookY + Math.sin(pitch) * dist + 0.55;
    const camZ = pz + behindZ * dist * Math.cos(pitch) + r.z * 0.62;
    camPos.set(camX, camY, camZ);
    camera.position.lerp(camPos, 1 - Math.pow(0.0008, dt));
    camLook.set(px + f.x * 1.4, lookY - pitch * 0.4, pz + f.z * 1.4);
    camera.lookAt(camLook);
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;

    emitHud();
  }

  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;

  function frame(now: number) {
    if (destroyed) return;
    requestAnimationFrame(frame);
    let dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      step(STEP);
      acc -= STEP;
    }
    if (!mat) return;
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
  }

  const onKeyDown = (e: KeyboardEvent) => {
    keys.add(e.code);
    if (["Space", "KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === "Escape" && phase === "playing") {
      phase = "paused";
      document.exitPointerLock?.();
      emitHud(true);
    }
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
  const onBlur = () => keys.clear();
  const onMouse = (e: MouseEvent) => {
    if (document.pointerLockElement !== canvas) return;
    yaw -= e.movementX * SENS;
    pitch -= e.movementY * SENS;
  };
  const onDown = (e: MouseEvent) => {
    if (e.button === 0) held.fire = true;
    if (phase === "playing" && document.pointerLockElement !== canvas) lockPointer();
  };
  const onUp = (e: MouseEvent) => {
    if (e.button === 0) held.fire = false;
  };
  const onContext = (e: Event) => e.preventDefault();
  const onVis = () => {
    if (document.visibilityState === "visible") audio.resume();
    else keys.clear();
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  window.addEventListener("mousemove", onMouse);
  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("contextmenu", onContext);
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("resize", resize);
  canvas.style.touchAction = "none";

  const probe: ControlsProbe = {
    getYaw: () => yaw,
    getSpeed: () => {
      const mv = inputMove();
      return Math.hypot(mv.x, mv.y);
    },
    setKeys: (codes: string[]) => {
      qaKeys.active = codes.length > 0;
      qaKeys.codes = codes;
      if (codes.length === 0) qaKeys.active = false;
    },
    setSteer: () => {},
  };
  Object.assign(probe, {
    getPos: () => ({ x: px, z: pz, y: py }),
  });
  window.__controlsTest = probe;

  function lockPointer() {
    if (isMobile) return;
    const p = canvas.requestPointerLock?.({ unadjustedMovement: true } as PointerLockOptions);
    if (p && typeof (p as Promise<void>).catch === "function") {
      (p as Promise<void>).catch(() => canvas.requestPointerLock());
    }
  }

  emitHud(true);

  return {
    destroy() {
      destroyed = true;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("contextmenu", onContext);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      if (window.__controlsTest === probe) delete window.__controlsTest;
    },
    startMission() {
      audio.unlock();
      if (!worldBuilt) setupWorld();
      phase = "playing";
      hp = maxHp;
      shield = maxShield;
      mag = currentWeapon().mag;
      objective = "Advance to the Void Gate";
      hint = isMobile ? "Left stick move · right drag look" : "WASD move · mouse aim · click fire";
      lockPointer();
      emitHud(true);
    },
    pause() {
      if (phase === "playing") {
        phase = "paused";
        document.exitPointerLock?.();
        emitHud(true);
      }
    },
    resume() {
      if (phase === "paused") {
        phase = "playing";
        lockPointer();
        emitHud(true);
      }
    },
    setMuted(m) {
      audio.setMuted(m);
    },
    setTouchMove(x, y) {
      touch.mx = x;
      touch.my = y;
    },
    setTouchLook(dx, dy) {
      touch.lookX += dx * SENS * 1.15;
      touch.lookY += dy * SENS * 1.15;
    },
    setAction(name, down) {
      if (name === "fire") held.fire = down;
      if (name === "sprint") held.sprint = down;
      if (name === "reload") held.reload = down;
      if (name === "frag") held.frag = down;
      if (name === "overdrive") held.overdrive = down;
      if (name === "cleave") held.cleave = down;
    },
    pulse(name) {
      if (name === "dodge") {
        keys.add("Space");
        setTimeout(() => keys.delete("Space"), 80);
      }
      if (name === "frag") throwFrag();
      if (name === "cleave") cleave();
      if (name === "overdrive" && skillCd.overdrive <= 0) {
        skillCd.overdrive = 16;
        overdriveT = 6;
      }
      if (name === "reload") startReload();
      if (name === "w1") {
        weaponIdx = 0;
        swapGunMesh();
      }
      if (name === "w2") {
        weaponIdx = 1;
        swapGunMesh();
      }
      if (name === "w3") {
        weaponIdx = 2;
        swapGunMesh();
      }
    },
  };
}
