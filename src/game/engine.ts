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
  applyArmorKits,
  createAimReticle,
  createBarrel,
  createBeam,
  createBolt,
  createCar,
  createCrate,
  createExoSuit,
  createGrenade,
  createLamp,
  createMuzzleFlash,
  createRifle,
  createRubble,
  createShade,
  createShipInterior,
  createShotgun,
  createSlash,
  createSmg,
  createSpawnRift,
  createVoidGate,
  createWreck,
  dressWorld,
  makeMaterials,
  mountGunInRightHand,
  type EnemyRig,
  type Materials,
  type PlayerRig,
} from "./meshes";
import { ParticleField, ScorchPool } from "./particles";
import { assetUrl } from "@/lib/asset-url";
import {
  armorBonuses,
  INVENTORY_CAP,
  instantiateRecipe,
  itemToWeapon,
  RECIPES,
  rollLootArmor,
  rollLootWeapon,
} from "./items";
import { isTouchUi } from "./layout";
import { loadSave, recordRun, writeSave, type SaveData } from "./save";
import type {
  ControlsProbe,
  EnemyKind,
  FloatNum,
  HudSnapshot,
  InvItem,
  Phase,
  Rarity,
  WeaponId,
} from "./types";

const PLAYER_R = 0.38;
const PLAYER_H = 1.72;
const GRAVITY = 22;
const WALK = 5.6;
const SPRINT = 8.8;
const DODGE_SPEED = 14.5;
const BASE_SENS = 0.00215;
const CAM_DIST = 11.6;
const CAM_DIST_ADS = 8.6;
const CAM_HEIGHT = 10.4;
const CAM_HEIGHT_ADS = 7.8;
const CAM_LOOK_Y = 0.62;
const CAM_LOOK_AHEAD = 2.4;
const CAM_MIN_BOOM = 7.2;
const CAM_FOV = 46;
const CAM_FOV_ADS = 38;

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
  alive: boolean;
  dying: number;
  flash: number;
  rig: EnemyRig;
  radius: number;
  speed: number;
  state: "chase" | "windup" | "attack";
  stateT: number;
  kbX: number;
  kbZ: number;
  summoned: number;
};

type BulletFx = { mesh: THREE.Line; life: number };
type Drop = {
  mesh: THREE.Group;
  x: number;
  z: number;
  kind: "gold" | "health" | "weapon" | "ammo" | "armor";
  weapon?: Weapon;
  item?: InvItem;
  amount: number;
  rarity: Rarity;
};
type Proj = {
  kind: "frag" | "bolt";
  mesh: THREE.Object3D;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  dmg: number;
  r: number;
};

function defaultWeapons(): Weapon[] {
  return [
    { id: "ar", name: "Vanguard ARX", rarity: "common", dmg: 21, pellets: 1, rpm: 580, mag: 32, reserve: 160, spread: 0.016, range: 82, reload: 1.4 },
    { id: "shotgun", name: "Spartan 12G", rarity: "magic", dmg: 12, pellets: 8, rpm: 78, mag: 6, reserve: 36, spread: 0.105, range: 17, reload: 1.85 },
    { id: "smg", name: "Cinder SMG", rarity: "common", dmg: 13, pellets: 1, rpm: 920, mag: 40, reserve: 200, spread: 0.038, range: 40, reload: 1.2 },
  ];
}

function rarityColor(r: Rarity) {
  return r === "legendary" ? 0xfb923c : r === "rare" ? 0xc4b5fd : r === "magic" ? 0x60a5fa : 0xd6d3d1;
}

function enemyStats(kind: EnemyKind) {
  if (kind === "harbinger") return { hp: 1680, radius: 1.2, speed: 2.5, dmg: 26 };
  if (kind === "brute") return { hp: 390, radius: 0.78, speed: 2.7, dmg: 24 };
  if (kind === "stalker") return { hp: 125, radius: 0.46, speed: 4.5, dmg: 16 };
  return { hp: 78, radius: 0.42, speed: 5.0, dmg: 13 };
}

function radialDeadzone(x: number, y: number, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export type GameHandle = {
  destroy: () => void;
  startMission: () => void;
  pause: () => void;
  resume: () => void;
  setMuted: (m: boolean) => void;
  setSensitivity: (s: number) => void;
  setInvertLookX: (v: boolean) => void;
  setInvertLookY: (v: boolean) => void;
  setTouchMove: (x: number, y: number) => void;
  setTouchLook: (dx: number, dy: number) => void;
  setAction: (name: string, down: boolean) => void;
  pulse: (name: string) => void;
  enterShip: () => void;
  recallToShip: () => void;
  equipItem: (uid: string) => void;
  craftRecipe: (id: string) => void;
};

export function mountGame(canvas: HTMLCanvasElement, onHud: (h: HudSnapshot) => void): GameHandle {
  const level = buildLevel();
  const audio = new GameAudio();
  const keys = new Set<string>();
  const prevKeys = new Set<string>();
  const qaKeys = { active: false, codes: [] as string[] };
  const touch = { mx: 0, my: 0, lookX: 0, lookY: 0 };
  const held = {
    fire: false,
    sprint: false,
    dodge: false,
    frag: false,
    overdrive: false,
    cleave: false,
    reload: false,
    ads: false,
  };

  let save: SaveData = loadSave();
  let phase: Phase = "title";
  let destroyed = false;
  let yaw = 0;
  let pitch = 0.08;
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
  let weapons = defaultWeapons();
  let mag = weapons[0].mag;
  let fireCd = 0;
  let reloadT = 0;
  let overdriveT = 0;
  let skillCd = { frag: 0, overdrive: 0, cleave: 0 };
  let trauma = 0;
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
  let combo = 0;
  let comboT = 0;
  let missionTime = 0;
  let hitMarker = 0;
  let freeze = 0;
  let adsT = 0;
  let shots = 0;
  let hits = 0;
  let damageDealt = 0;
  let floaters: FloatNum[] = [];
  let floatId = 0;
  let velX = 0;
  let velZ = 0;
  let lockLost = false;
  let emptyCd = 0;
  let recorded = false;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.38;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a120c);
  scene.fog = new THREE.FogExp2(0x2a1c12, 0.0085);
  const missionGroup = new THREE.Group();
  missionGroup.name = "mission";
  scene.add(missionGroup);
  const shipRoot = new THREE.Group();
  shipRoot.visible = false;
  scene.add(shipRoot);
  let nearCnc = false;

  const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.22, 280);
  scene.add(new THREE.HemisphereLight(0xffd2a8, 0x1c1610, 0.92));
  const sun = new THREE.DirectionalLight(0xffd0a0, 2.55);
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
  const fill = new THREE.DirectionalLight(0x6ee7e0, 0.62);
  fill.position.set(22, 16, -28);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0x3a3228, 0.55));
  const playerKey = new THREE.PointLight(0xffc89a, 5.2, 16, 1.6);
  scene.add(playerKey);
  const playerRim = new THREE.PointLight(0x5eead4, 2.4, 10, 2);
  scene.add(playerRim);

  const textures: {
    ground?: THREE.Texture;
    wall?: THREE.Texture;
    metal?: THREE.Texture;
    sky?: THREE.Texture;
    armor?: THREE.Texture;
    shade?: THREE.Texture;
  } = {};
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
  const projs: Proj[] = [];
  const rifts: { mesh: THREE.Group; life: number }[] = [];
  const muzzleLight = new THREE.PointLight(0xffaa55, 0, 9, 2);
  scene.add(muzzleLight);
  const overLight = new THREE.PointLight(0xe85d04, 0, 6, 2);
  scene.add(overLight);
  const drone = new THREE.Group();
  let composer: EffectComposer | null = null;
  let isMobile = isTouchUi();
  let worldBuilt = false;
  let prevSlot = 0;
  let camSnap = true;
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2(0.15, -0.1);
  const aimPoint = new THREE.Vector3(0, 0, -8);
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let mouseAim = true;
  let touchAimYaw = 0;
  let touchAimSR = 0;
  let touchAimSF = 8;
  let aimReticle: THREE.Group | null = null;
  const particles = new ParticleField();
  const scorch = new ScorchPool(scene);
  scene.add(particles.object);
  let gateGroup: THREE.Group | null = null;
  let muzzleFlash: THREE.Group | null = null;
  let beamMesh: THREE.Mesh | null = null;
  let slashMesh: THREE.Mesh | null = null;
  let slashT = 0;
  const tracerMat = new THREE.LineBasicMaterial({
    color: 0xffc58a,
    transparent: true,
    opacity: 0.85,
    toneMapped: false,
  });

  const groundGeo = new THREE.PlaneGeometry(160, 180, 1, 1);
  groundGeo.rotateX(-Math.PI / 2);

  function setupWorld() {
    if (worldBuilt) return;
    worldBuilt = true;
    mat = makeMaterials(textures);
    const ground = new THREE.Mesh(groundGeo, mat.concrete);
    ground.receiveShadow = true;
    ground.position.set(0, 0, -48);
    missionGroup.add(ground);
    if (textures.ground) {
      const g = textures.ground.clone();
      g.repeat.set(28, 32);
      g.needsUpdate = true;
      mat.concrete.map = g;
      mat.concrete.needsUpdate = true;
    }
    addWorldFromBoxes(missionGroup, level.boxes, mat);
    dressWorld(missionGroup, mat);
    for (const [x, z] of level.lamps) {
      const lamp = createLamp(mat);
      lamp.position.set(x, 0, z);
      missionGroup.add(lamp);
    }
    for (const [x, z] of level.rubble) {
      const r = createRubble(mat);
      r.position.set(x, 0, z);
      missionGroup.add(r);
    }
    for (const [x, z, rot] of level.cars) {
      const c = createCar(mat);
      c.position.set(x, 0, z);
      c.rotation.y = rot;
      missionGroup.add(c);
    }
    for (const [x, z] of level.barrels) {
      const b = createBarrel(mat);
      b.position.set(x, 0, z);
      missionGroup.add(b);
    }
    for (const [x, z] of level.crates) {
      const c = createCrate(mat);
      c.position.set(x, 0, z);
      missionGroup.add(c);
    }
    const wreck = createWreck(mat);
    wreck.position.set(level.wreck.x, 0, level.wreck.z);
    missionGroup.add(wreck);
    gateGroup = createVoidGate(mat);
    gateGroup.position.set(level.gate.x, 2.4, level.gate.z);
    missionGroup.add(gateGroup);
    const riftLight = new THREE.PointLight(0x22d3ee, 7.5, 32, 1.5);
    riftLight.position.set(level.gate.x, 3.2, level.gate.z);
    missionGroup.add(riftLight);
    shipRoot.add(createShipInterior(mat));

    if (textures.sky) {
      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(170, 24, 16),
        new THREE.MeshBasicMaterial({ map: textures.sky, side: THREE.BackSide, fog: false, depthWrite: false }),
      );
      sky.position.set(0, 20, -20);
      missionGroup.add(sky);
    }

    playerRig = createExoSuit(mat);
    scene.add(playerRig.group);
    const dCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), mat.ember);
    drone.add(dCore);
    const dRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 12), mat.voidCore);
    drone.add(dRing);
    scene.add(drone);
    muzzleFlash = createMuzzleFlash();
    scene.add(muzzleFlash);
    beamMesh = createBeam();
    scene.add(beamMesh);
    slashMesh = createSlash();
    scene.add(slashMesh);
    aimReticle = createAimReticle();
    scene.add(aimReticle);

    if (!isMobile) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.65, 0.78));
      composer.addPass(new OutputPass());
    }
    resize();
  }

  setupWorld();

  void Promise.allSettled([
    loadTex(assetUrl("art/ground.jpg"), 18).then((t) => (textures.ground = t)),
    loadTex(assetUrl("art/wall.jpg"), 4).then((t) => (textures.wall = t)),
    loadTex(assetUrl("art/metal.jpg"), 3).then((t) => (textures.metal = t)),
    loadTex(assetUrl("art/armor.png"), 1.6).then((t) => (textures.armor = t)),
    loadTex(assetUrl("art/shade.png"), 1.4).then((t) => (textures.shade = t)),
    loadTex(assetUrl("art/sky.jpg"), 1).then((t) => {
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      textures.sky = t;
    }),
  ]).then(() => {
    if (!mat) return;
    if (textures.ground) {
      mat.concrete.map = textures.ground;
      mat.concrete.needsUpdate = true;
      mat.asphalt.map = textures.ground;
      mat.asphalt.needsUpdate = true;
    }
    if (textures.wall) {
      mat.wall.map = textures.wall;
      mat.wall.needsUpdate = true;
    }
    if (textures.metal) {
      mat.metal.map = textures.metal;
      mat.metal.needsUpdate = true;
    }
    if (textures.armor) {
      mat.armor.map = textures.armor;
      mat.armor.needsUpdate = true;
    }
    if (textures.shade) {
      mat.shade.map = textures.shade;
      mat.shade.needsUpdate = true;
    }
    if (textures.sky && !scene.children.some((c) => c.userData.sky)) {
      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(170, 24, 16),
        new THREE.MeshBasicMaterial({ map: textures.sky, side: THREE.BackSide, fog: false, depthWrite: false }),
      );
      sky.position.set(0, 20, -20);
      sky.userData.sky = true;
      missionGroup.add(sky);
    }
  });

  function forward() {
    return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
  }
  function placeFollowCam(dt: number, snap = false) {
    if (phase === "ship") {
      camPos.set(px + 7.4, py + 8.6, pz + 7.4);
      camLook.set(px, py + 1.05, pz);
      if (snap || camSnap) {
        camera.position.copy(camPos);
        camSnap = false;
      } else {
        camera.position.lerp(camPos, 1 - Math.exp(-8 * dt));
      }
      camera.lookAt(camLook);
      camera.fov = 42;
      camera.updateProjectionMatrix();
      return;
    }
    const f = forward();
    const boom = THREE.MathUtils.lerp(CAM_DIST, CAM_DIST_ADS, adsT);
    const height = THREE.MathUtils.lerp(CAM_HEIGHT, CAM_HEIGHT_ADS, adsT);
    let camX = px - f.x * boom * 0.22;
    let camY = py + height;
    let camZ = pz + boom * 0.78 - f.z * boom * 0.16;
    if (camY < py + 4.2) camY = py + 4.2;
    const rdx = camX - px;
    const rdy = camY - (py + 1.2);
    const rdz = camZ - pz;
    const rlen = Math.hypot(rdx, rdy, rdz) || 1;
    const occl = rayWorld(
      level.boxes,
      px,
      py + 1.4,
      pz,
      rdx / rlen,
      rdy / rlen,
      rdz / rlen,
      rlen,
      (b) => b.maxy > 2.4 && !b.cover,
    );
    if (occl !== null && occl < rlen - 0.6) {
      const pull = Math.max(CAM_MIN_BOOM, occl - 0.7);
      camX = px + (rdx / rlen) * pull;
      camY = py + 1.2 + (rdy / rlen) * pull;
      camZ = pz + (rdz / rlen) * pull;
      if (camY < py + 5.5) camY = py + 5.5;
    }
    if (playerRig) playerRig.group.visible = true;
    camPos.set(camX, camY, camZ);
    const ahead = THREE.MathUtils.lerp(CAM_LOOK_AHEAD, 1.6, adsT);
    camLook.set(px + f.x * ahead, py + CAM_LOOK_Y, pz + f.z * ahead);
    if (snap || camSnap) {
      camera.position.copy(camPos);
      camSnap = false;
    } else {
      camera.position.lerp(camPos, 1 - Math.pow(0.0002, dt));
    }
    camera.lookAt(camLook);
    const shake = trauma * trauma;
    const nt = performance.now() * 0.06;
    camera.position.x += Math.sin(nt * 23.1) * shake * 0.32;
    camera.position.y += Math.cos(nt * 19.4) * shake * 0.26;
    camera.rotation.z += Math.sin(nt * 11) * shake * 0.02;
    const targetFov = THREE.MathUtils.lerp(CAM_FOV, CAM_FOV_ADS, adsT);
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov += (targetFov - camera.fov) * Math.min(1, 10 * dt);
      camera.updateProjectionMatrix();
    }
  }
  function persistLoadout() {
    writeSave(save);
  }

  function syncWeaponsFromSave() {
    const list = save.inventory.filter((i) => i.kind === "weapon");
    if (!list.length) {
      const fresh = itemToWeapon({
        uid: "fallback",
        kind: "weapon",
        name: "Vanguard ARX",
        rarity: "common",
        weaponId: "ar",
        dmg: 21,
        pellets: 1,
        rpm: 580,
        mag: 32,
        reserve: 160,
        spread: 0.016,
        range: 82,
        reload: 1.4,
      });
      weapons = [fresh];
      weaponIdx = 0;
      return;
    }
    weapons = list.map(itemToWeapon);
    let idx = list.findIndex((i) => i.uid === save.equippedWeapon);
    if (idx < 0) idx = 0;
    weaponIdx = idx;
    save.equippedWeapon = list[idx].uid;
  }

  function applyLoadoutVisuals() {
    syncWeaponsFromSave();
    const b = armorBonuses(save.inventory, save.equippedArmor);
    maxHp = 200 + b.hp;
    maxShield = 110 + b.shield;
    hp = Math.min(hp, maxHp);
    shield = Math.min(shield, maxShield);
    mag = Math.min(mag, currentWeapon().mag);
    swapGunMesh();
    if (playerRig && mat) applyArmorKits(playerRig, mat, save.inventory, save.equippedArmor);
  }

  function addToInventory(item: InvItem) {
    if (save.inventory.length >= INVENTORY_CAP) {
      save.inventory.shift();
    }
    save.inventory.push(item);
    persistLoadout();
  }

  function currentWeapon() {
    return weapons[weaponIdx] ?? weapons[0];
  }
  function keySet() {
    return qaKeys.active ? new Set(qaKeys.codes) : keys;
  }
  function justPressed(code: string) {
    const k = keySet();
    return k.has(code) && !prevKeys.has(code);
  }

  function pushLoot(name: string, rarity: Rarity) {
    loot = [{ id: lootId++, name, rarity }, ...loot].slice(0, 5);
    audio.pickup();
  }

  function pushFloat(text: string, x: number, y: number, z: number, color: FloatNum["color"]) {
    tmpV.set(x, y, z).project(camera);
    floaters.push({
      id: floatId++,
      text,
      x: (tmpV.x * 0.5 + 0.5) * 100,
      y: (-tmpV.y * 0.5 + 0.5) * 100,
      color,
      life: 0.85,
    });
    if (floaters.length > 14) floaters.shift();
  }

  function rumble(ms: number, strong = 0.5) {
    const pads = navigator.getGamepads?.() ?? [];
    const p = pads[0] as Gamepad & { vibrationActuator?: { playEffect: (t: string, o: object) => void } } | null;
    void p?.vibrationActuator?.playEffect("dual-rumble", {
      duration: ms,
      strongMagnitude: strong,
      weakMagnitude: strong * 0.6,
    });
  }

  function spawnRift(x: number, z: number) {
    if (!mat) return;
    const mesh = createSpawnRift(mat);
    mesh.position.set(x, 0.05, z);
    scene.add(mesh);
    rifts.push({ mesh, life: 0.9 });
    audio.spawn();
    particles.burst(x, 0.4, z, 16, 0x22d3ee, 3.2, 0.5, 0.12, 1);
  }

  function spawnEnemy(kind: EnemyKind, x: number, z: number, rift = true) {
    if (!mat) return;
    const st = enemyStats(kind);
    const rig = createShade(kind, mat);
    rig.group.position.set(x, 0, z);
    scene.add(rig.group);
    enemies.push({
      id: enemyId++,
      kind,
      x,
      y: kind === "harbinger" ? 0.4 : 0,
      z,
      hp: st.hp,
      max: st.hp,
      yaw: 0,
      attackCd: 0.5 + Math.random() * 0.4,
      alive: true,
      dying: 0,
      flash: 0,
      rig,
      radius: st.radius,
      speed: st.speed,
      state: "chase",
      stateT: 0,
      kbX: 0,
      kbZ: 0,
      summoned: 0,
    });
    if (kind === "harbinger") bossAlive = true;
    if (rift) spawnRift(x, z);
  }

  function rollDrop(x: number, z: number, kind: EnemyKind) {
    if (!mat) return;
    const roll = Math.random();
    if (!(kind === "harbinger" || roll > 0.32)) return;
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
        toneMapped: false,
      }),
    );
    g.add(gem);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6),
      new THREE.MeshBasicMaterial({ color: rarityColor(rarity), transparent: true, opacity: 0.45, toneMapped: false }),
    );
    beam.position.y = 1.2;
    g.add(beam);
    g.position.set(x, 0.2, z);
    scene.add(g);
    const gearRoll = Math.random();
    const item =
      rarity === "common" && gearRoll < 0.42
        ? undefined
        : gearRoll > 0.55
          ? rollLootArmor(rarity)
          : rollLootWeapon(rarity);
    const kindDrop: Drop["kind"] = item
      ? item.kind === "armor"
        ? "armor"
        : "weapon"
      : Math.random() > 0.55
        ? Math.random() > 0.5
          ? "health"
          : "ammo"
        : "gold";
    drops.push({
      mesh: g,
      x,
      z,
      kind: kindDrop,
      item,
      amount: item ? 0 : 40 + Math.floor(Math.random() * 80),
      rarity,
    });
  }

  function killEnemy(e: Enemy) {
    if (e.dying > 0 || !e.alive) return;
    e.alive = false;
    e.hp = 0;
    e.dying = 0.55;
    kills++;
    comboT = 2.4;
    combo++;
    const xpGain = (e.kind === "harbinger" ? 800 : e.kind === "brute" ? 120 : 40) * (1 + Math.min(combo, 8) * 0.05);
    xp += xpGain;
    while (xp >= pLevel * 200) {
      xp -= pLevel * 200;
      pLevel++;
      maxHp += 12;
      hp = Math.min(maxHp, hp + 22);
      pushLoot(`Op ${pLevel}`, "rare");
    }
    gold += 12 + Math.floor(Math.random() * 24);
    audio.kill();
    freeze = Math.max(freeze, e.kind === "harbinger" ? 0.12 : 0.045);
    trauma = Math.min(1, trauma + (e.kind === "harbinger" ? 0.55 : 0.18));
    particles.burst(e.x, 1.1, e.z, e.kind === "harbinger" ? 48 : 22, 0x2dd4bf, 5.5, 0.7, 0.16, -2);
    particles.burst(e.x, 1.0, e.z, 10, 0xe85d04, 3.2, 0.45, 0.1, -3);
    pushFloat(`${combo > 1 ? combo + "x " : ""}DOWN`, e.x, 2.1, e.z, "void");
    rollDrop(e.x, e.z, e.kind);
    if (e.kind === "harbinger") {
      bossAlive = false;
      phase = "victory";
      objective = "Harbinger down — Void Gate sealed";
      hint = "Ashfall Gate is yours";
      finishRun(true);
    }
  }

  function damageEnemy(e: Enemy, dmg: number, hx: number, hz: number) {
    if (!e.alive) return;
    e.hp -= dmg;
    e.flash = 0.14;
    e.kbX += hx * 2.8;
    e.kbZ += hz * 2.8;
    damageDealt += dmg;
    hits++;
    hitMarker = 0.14;
    audio.hit();
    particles.spray(e.x, 1.15, e.z, hx, 0.2, hz, 6, 0x5eead4, 4, 0.22, 0.08);
    pushFloat(`${Math.round(dmg)}`, e.x, 1.9, e.z, e.hp <= 0 ? "legendary" : "void");
    if (e.hp <= 0) killEnemy(e);
  }

  function hurtPlayer(dmg: number) {
    if (invuln > 0 || phase !== "playing") return;
    let rest = dmg;
    const hadShield = shield > 0;
    if (shield > 0) {
      const s = Math.min(shield, rest);
      shield -= s;
      rest -= s;
      if (shield <= 0 && hadShield) audio.shieldBreak();
    }
    if (rest > 0) hp -= rest;
    shieldCd = 3.2;
    hitFlash = 0.38;
    trauma = Math.min(1, trauma + 0.42);
    audio.hurt();
    rumble(90, 0.7);
    combo = 0;
    if (hp <= 0) {
      hp = 0;
      phase = "dead";
      hint = "Deploy again";
      finishRun(false);
    }
  }

  function finishRun(won: boolean) {
    if (recorded) return;
    recorded = true;
    bankScrap(won ? 1 : 0.45);
    save = recordRun(save, kills, missionTime, gold, won);
  }

  function bankScrap(factor: number) {
    save.scrapBank += Math.floor(gold * factor);
    persistLoadout();
  }

  function selectWeaponSlot(idx: number) {
    const list = save.inventory.filter((i) => i.kind === "weapon");
    if (!list[idx]) return;
    save.equippedWeapon = list[idx].uid;
    persistLoadout();
    syncWeaponsFromSave();
    mag = Math.min(mag, currentWeapon().mag);
    swapGunMesh();
    emitHud(true);
  }

  function showShip() {
    if (!worldBuilt) setupWorld();
    missionGroup.visible = false;
    shipRoot.visible = true;
    scene.fog = new THREE.FogExp2(0x08080b, 0.012);
    scene.background = new THREE.Color(0x07080c);
    px = 0;
    pz = 0;
    py = 0.12;
    velX = 0;
    velZ = 0;
    yaw = 0;
    nearCnc = false;
    phase = "ship";
    objective = "Chimera hull — ready deck";
    hint = "Walk to the CNC printer · I inventory · Deploy from the pad";
    if (playerRig) playerRig.group.visible = true;
    drone.visible = false;
    if (aimReticle) aimReticle.visible = false;
    applyLoadoutVisuals();
    camSnap = true;
    placeFollowCam(1 / 60, true);
    emitHud(true);
  }

  function showMission() {
    missionGroup.visible = true;
    shipRoot.visible = false;
    scene.fog = new THREE.FogExp2(0x2a1c12, 0.0085);
    scene.background = new THREE.Color(0x1a120c);
    nearCnc = false;
  }

  function equipItem(uid: string) {
    const it = save.inventory.find((i) => i.uid === uid);
    if (!it) return;
    if (it.kind === "weapon") {
      save.equippedWeapon = it.uid;
      persistLoadout();
      applyLoadoutVisuals();
      mag = currentWeapon().mag;
    } else if (it.slot) {
      save.equippedArmor[it.slot] = it.uid;
      persistLoadout();
      applyLoadoutVisuals();
      hp = maxHp;
      shield = maxShield;
    }
    emitHud(true);
  }

  function craftRecipe(id: string) {
    const recipe = RECIPES.find((r) => r.id === id);
    if (!recipe || save.scrapBank < recipe.cost) return;
    if (save.inventory.length >= INVENTORY_CAP) return;
    save.scrapBank -= recipe.cost;
    const made = instantiateRecipe(recipe);
    save.inventory.push(made);
    persistLoadout();
    pushLoot(`Printed ${made.name}`, made.rarity);
    emitHud(true);
  }

  function aimRay() {
    const dx = aimPoint.x - px;
    const dz = aimPoint.z - pz;
    const dy = 0.12;
    const len = Math.hypot(dx, dy, dz) || 1;
    tmpV.set(px + (dx / len) * 0.55, py + 1.32, pz + (dz / len) * 0.55);
    tmpV2.set(dx / len, dy / len, dz / len);
    return { origin: tmpV.clone(), dir: tmpV2.clone() };
  }

  function camBasis() {
    camera.getWorldDirection(tmpV);
    let fx = tmpV.x;
    let fz = tmpV.z;
    const m = Math.hypot(fx, fz) || 1;
    fx /= m;
    fz /= m;
    return { f: { x: fx, z: fz }, r: { x: -fz, z: fx } };
  }

  function lookSign() {
    return {
      x: save.invertLookX ? -1 : 1,
      y: save.invertLookY ? -1 : 1,
    };
  }

  function updateAim() {
    const pad = pollPad();
    const inv = lookSign();
    const lx = pad.lx * inv.x;
    const ly = pad.ly * inv.y;
    const stick = Math.hypot(lx, ly);
    if (stick > 0.22) {
      mouseAim = false;
      const b = camBasis();
      const reach = 11;
      aimPoint.x = px + (b.f.x * -ly + b.r.x * lx) * reach;
      aimPoint.z = pz + (b.f.z * -ly + b.r.z * lx) * reach;
    } else if (isMobile) {
      const b = camBasis();
      aimPoint.x = px + b.r.x * touchAimSR + b.f.x * touchAimSF;
      aimPoint.z = pz + b.r.z * touchAimSR + b.f.z * touchAimSF;
    } else if (mouseAim) {
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(groundPlane, tmpV)) {
        aimPoint.copy(tmpV);
      }
    }
    const adx = aimPoint.x - px;
    const adz = aimPoint.z - pz;
    const ad = Math.hypot(adx, adz);
    if (ad < 1.5) {
      aimPoint.x = px + (adx / (ad || 1)) * 1.5;
      aimPoint.z = pz + (adz / (ad || 1)) * 1.5;
    }
    yaw = Math.atan2(-(aimPoint.x - px), -(aimPoint.z - pz));
    if (aimReticle) {
      aimReticle.visible = phase === "playing";
      aimReticle.position.set(aimPoint.x, 0.07, aimPoint.z);
      aimReticle.rotation.y += 0.02;
    }
  }

  function fireWeapon() {
    const w = currentWeapon();
    if (reloadT > 0) return;
    if (mag <= 0) {
      if (emptyCd <= 0) {
        audio.empty();
        emptyCd = 0.18;
      }
      if (reloadT <= 0) startReload();
      return;
    }
    const interval = 60 / (w.rpm * (overdriveT > 0 ? 1.35 : 1));
    if (fireCd > 0) return;
    fireCd = interval;
    mag -= 1;
    shots += w.pellets;
    audio.fire(w.id);
    trauma = Math.min(1, trauma + (w.id === "shotgun" ? 0.22 : 0.07));
    pitch += w.id === "shotgun" ? 0.028 : 0.01;
    yaw += (Math.random() - 0.5) * (w.id === "shotgun" ? 0.02 : 0.006);
    muzzleLight.intensity = 7;
    const { origin, dir } = aimRay();
    const f = forward();
    if (muzzleFlash) {
      muzzleFlash.position.set(px + f.x * 0.9, py + 1.38, pz + f.z * 0.9);
      muzzleFlash.visible = true;
      muzzleFlash.scale.setScalar(0.8 + Math.random() * 0.5);
    }
    particles.spray(px + f.x * 0.85, py + 1.38, pz + f.z * 0.85, f.x, 0.05, f.z, 4, 0xffc58a, 8, 0.08, 0.06);
    const ads = 1 - adsT * 0.55;
    for (let p = 0; p < w.pellets; p++) {
      const spread = w.spread * (1 + (1 - mag / w.mag) * 0.4) * ads;
      tmpV2.copy(dir);
      tmpV2.x += (Math.random() - 0.5) * spread;
      tmpV2.y += (Math.random() - 0.5) * spread * 0.55;
      tmpV2.z += (Math.random() - 0.5) * spread;
      tmpV2.normalize();
      const worldT = rayWorld(level.boxes, origin.x, origin.y, origin.z, tmpV2.x, tmpV2.y, tmpV2.z, w.range);
      let bestT = worldT ?? w.range;
      let hit: Enemy | null = null;
      for (const e of enemies) {
        if (!e.alive) continue;
        const toE = tmpV.set(e.x - origin.x, 1.15 + e.y - origin.y + (e.kind === "harbinger" ? 1.1 : 0), e.z - origin.z);
        const t = toE.dot(tmpV2);
        if (t < 0 || t > bestT) continue;
        const closest = origin.clone().addScaledVector(tmpV2, t);
        const dist = Math.hypot(closest.x - e.x, closest.z - e.z);
        if (dist < e.radius + 0.18) {
          bestT = t;
          hit = e;
        }
      }
      if (hit) {
        const kit = 1 + armorBonuses(save.inventory, save.equippedArmor).dmg / 100;
        damageEnemy(hit, w.dmg * kit * (overdriveT > 0 ? 1.28 : 1) * (0.85 + Math.random() * 0.3), tmpV2.x, tmpV2.z);
      }
      else if (worldT !== null) {
        const end = origin.clone().addScaledVector(tmpV2, worldT);
        particles.burst(end.x, end.y, end.z, 5, 0xffc58a, 2.4, 0.18, 0.05, -1);
      }
      const end = origin.clone().addScaledVector(tmpV2, Math.min(bestT, 46));
      const geo = new THREE.BufferGeometry().setFromPoints([origin.clone().addScaledVector(tmpV2, 0.55), end]);
      const line = new THREE.Line(geo, tracerMat);
      scene.add(line);
      fx.push({ mesh: line, life: 0.07 });
    }
    if (mag <= 0) startReload();
  }

  function startReload() {
    const w = currentWeapon();
    if (reloadT > 0 || mag >= w.mag || w.reserve <= 0) return;
    reloadT = w.reload;
    audio.reload();
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
    if (skillCd.frag > 0 || !mat) return;
    skillCd.frag = 8;
    audio.fire("frag");
    const f = forward();
    const mesh = createGrenade(mat);
    mesh.position.set(px + f.x * 0.5, py + 1.35, pz + f.z * 0.5);
    scene.add(mesh);
    projs.push({
      kind: "frag",
      mesh,
      x: px + f.x * 0.5,
      y: py + 1.35,
      z: pz + f.z * 0.5,
      vx: f.x * 17,
      vy: 7.2,
      vz: f.z * 17,
      life: 1.15,
      dmg: 140,
      r: 5.4,
    });
  }

  function explode(x: number, y: number, z: number, dmg: number, r: number) {
    trauma = Math.min(1, trauma + 0.7);
    freeze = Math.max(freeze, 0.07);
    audio.explode();
    rumble(140, 0.85);
    particles.burst(x, y, z, 36, 0xe85d04, 7, 0.55, 0.16, -4);
    particles.burst(x, y, z, 18, 0xffc58a, 4, 0.4, 0.1, -2);
    scorch.stamp(x, z, r * 0.45);
    for (const e of enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - x, e.z - z);
      if (d < r) damageEnemy(e, dmg * (1 - d / r), (e.x - x) / (d || 1), (e.z - z) / (d || 1));
    }
    if (Math.hypot(px - x, pz - z) < r * 0.55) hurtPlayer(28);
  }

  function cleave() {
    if (skillCd.cleave > 0) return;
    skillCd.cleave = 7;
    audio.fire("shotgun");
    invuln = 0.28;
    const f = forward();
    dodgeT = 0.18;
    dodgeDirX = f.x;
    dodgeDirZ = f.z;
    slashT = 0.22;
    if (slashMesh) {
      slashMesh.visible = true;
      slashMesh.position.set(px + f.x * 1.1, py + 1.2, pz + f.z * 1.1);
      slashMesh.rotation.set(0.4, yaw, 0.2);
    }
    particles.spray(px + f.x, py + 1.2, pz + f.z, f.x, 0.1, f.z, 14, 0xe85d04, 6, 0.28, 0.1);
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.x - px;
      const dz = e.z - pz;
      const dist = Math.hypot(dx, dz);
      if (dist < 3.4 && dx * f.x + dz * f.z > 0) damageEnemy(e, 90, f.x, f.z);
    }
  }

  function swapGunMesh() {
    if (!playerRig || !mat) return;
    playerRig.gunGrip.remove(playerRig.gun);
    const id = currentWeapon().id;
    const g = id === "shotgun" ? createShotgun(mat) : id === "smg" ? createSmg(mat) : createRifle(mat);
    mountGunInRightHand(g);
    playerRig.gunGrip.add(g);
    playerRig.gun = g;
  }

  function inputMove() {
    const k = keySet();
    let x = touch.mx;
    let y = touch.my;
    if (k.has("KeyW") || k.has("ArrowUp")) y += 1;
    if (k.has("KeyS") || k.has("ArrowDown")) y -= 1;
    if (k.has("KeyA") || k.has("ArrowLeft")) x -= 1;
    if (k.has("KeyD") || k.has("ArrowRight")) x += 1;
    const pad = pollPad();
    x += pad.mx;
    y += pad.my;
    const m = Math.hypot(x, y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    return { x, y };
  }

  function pollPad() {
    const pads = navigator.getGamepads?.() ?? [];
    const p = pads[0];
    if (!p) return { mx: 0, my: 0, lx: 0, ly: 0, fire: false, ads: false, sprint: false };
    const l = radialDeadzone(p.axes[0] || 0, p.axes[1] || 0);
    const r = radialDeadzone(p.axes[2] || 0, p.axes[3] || 0);
    return {
      mx: l.x,
      my: -l.y,
      lx: r.x,
      ly: r.y,
      fire: (p.buttons[7]?.value ?? 0) > 0.4,
      ads: (p.buttons[6]?.value ?? 0) > 0.4,
      sprint: Boolean(p.buttons[10]?.pressed || p.buttons[4]?.pressed),
    };
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
    if (beamMesh) beamMesh.visible = false;
    let nearby = 0;
    for (const e of enemies) {
      if (e.dying > 0) {
        e.dying -= dt;
        const s = Math.max(0.05, e.dying / 0.55);
        e.rig.group.scale.multiplyScalar(0.92);
        e.rig.group.position.y += dt * 0.6;
        e.rig.group.rotation.y += dt * 2;
        if (e.dying <= 0) scene.remove(e.rig.group);
        continue;
      }
      if (!e.alive) continue;
      nearby++;
      e.attackCd -= dt;
      e.flash = Math.max(0, e.flash - dt);
      e.kbX *= Math.pow(0.08, dt);
      e.kbZ *= Math.pow(0.08, dt);
      e.x += e.kbX * dt;
      e.z += e.kbZ * dt;
      const dx = px - e.x;
      const dz = pz - e.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      const nx = dx / dist;
      const nz = dz / dist;
      e.yaw = Math.atan2(-dx, -dz);
      const st = enemyStats(e.kind);
      const stop = e.kind === "stalker" ? 8.5 : e.kind === "harbinger" ? 3.4 : e.radius + 1.15;

      if (e.state === "windup") {
        e.stateT -= dt;
        if (e.kind === "harbinger" && beamMesh) {
          alignBeam(e.x, e.y + 2.4, e.z, px, py + 1.2, pz, 0.04);
          beamMesh.visible = true;
          (beamMesh.material as THREE.MeshBasicMaterial).opacity = 0.35;
        }
        if (e.stateT <= 0) {
          e.state = "attack";
          e.stateT = e.kind === "harbinger" ? 0.7 : 0.28;
          if (e.kind === "harbinger") audio.beam();
          if (e.kind === "brute") {
            particles.burst(e.x, 0.2, e.z, 22, 0x2dd4bf, 5, 0.35, 0.12, 2);
            scorch.stamp(e.x, e.z, 2.2);
            if (dist < 3.3) hurtPlayer(st.dmg);
            trauma = Math.min(1, trauma + 0.28);
          } else if (e.kind !== "harbinger" && dist < e.radius + 1.15) {
            hurtPlayer(st.dmg);
          }
        }
      } else if (e.state === "attack") {
        e.stateT -= dt;
        if (e.kind === "harbinger" && beamMesh) {
          alignBeam(e.x, e.y + 2.4, e.z, px, py + 1.2, pz, 0.16);
          beamMesh.visible = true;
          (beamMesh.material as THREE.MeshBasicMaterial).opacity = 0.9;
          const los = rayWorld(level.boxes, e.x, e.y + 2.2, e.z, nx, 0, nz, dist);
          if (los === null || los > dist - 0.45) {
            const t = (px - e.x) * nx + (pz - e.z) * nz;
            const closestX = e.x + nx * Math.max(0, t);
            const closestZ = e.z + nz * Math.max(0, t);
            if (Math.hypot(px - closestX, pz - closestZ) < 0.9 && t > 0) hurtPlayer(18 * dt * 2.8);
          }
        }
        if (e.stateT <= 0) {
          e.state = "chase";
          e.attackCd = e.kind === "harbinger" ? 2.2 : e.kind === "brute" ? 1.5 : 1.05;
        }
      } else {
        if (dist > stop) {
          const sp = e.speed * dt;
          e.x += nx * sp;
          e.z += nz * sp;
          const c = collidePlayer(level.boxes, e.x, 0, e.z, e.radius, 1.8);
          e.x = c.x;
          e.z = c.z;
        }
        if (e.kind === "stalker" && dist < 16 && e.attackCd <= 0) {
          e.attackCd = 1.35;
          const mesh = createBolt();
          mesh.position.set(e.x, 1.5, e.z);
          scene.add(mesh);
          const lead = 0.12;
          const bx = nx + velX * lead;
          const bz = nz + velZ * lead;
          const bm = Math.hypot(bx, bz) || 1;
          projs.push({
            kind: "bolt",
            mesh,
            x: e.x,
            y: 1.5,
            z: e.z,
            vx: (bx / bm) * 22,
            vy: 0.4,
            vz: (bz / bm) * 22,
            life: 1.6,
            dmg: st.dmg,
            r: 0.35,
          });
        }
        if (e.kind === "husk" && dist < 3.6 && e.attackCd <= 0) {
          e.state = "windup";
          e.stateT = 0.22;
          e.kbX += nx * 8;
          e.kbZ += nz * 8;
        }
        if (e.kind === "brute" && dist < 3.0 && e.attackCd <= 0) {
          e.state = "windup";
          e.stateT = 0.48;
        }
        if (e.kind === "harbinger" && dist < 18 && e.attackCd <= 0) {
          if (dist < 3.6) {
            e.state = "windup";
            e.stateT = 0.35;
          } else {
            e.state = "windup";
            e.stateT = 1.05;
          }
        }
      }

      if (e.kind === "harbinger") {
        if (e.hp < e.max * 0.6 && e.summoned < 1) {
          e.summoned = 1;
          spawnEnemy("husk", e.x + 3.2, e.z + 1);
          spawnEnemy("husk", e.x - 3.2, e.z + 1);
        }
        if (e.hp < e.max * 0.3 && e.summoned < 2) {
          e.summoned = 2;
          spawnEnemy("stalker", e.x + 4, e.z);
          spawnEnemy("stalker", e.x - 4, e.z);
          spawnEnemy("husk", e.x, e.z + 3);
        }
        e.y = 0.45 + Math.sin(performance.now() * 0.002 + e.id) * 0.18;
        if (e.rig.ring) e.rig.ring.rotation.z += dt * 1.4;
        if (e.rig.core) e.rig.core.rotation.y += dt * 2.2;
      }

      const bob = e.kind === "harbinger" ? 0 : Math.sin(performance.now() * 0.008 + e.id) * 0.35;
      e.rig.leftArm.rotation.x = bob;
      e.rig.rightArm.rotation.x = -bob;
      e.rig.group.position.set(e.x, e.y, e.z);
      e.rig.group.lookAt(px, e.y, pz);
      const pulse = 1 + Math.sin(performance.now() * 0.008 + e.id) * 0.18;
      for (const g of e.rig.glow) {
        const m = g.material as THREE.MeshStandardMaterial;
        if (m.emissiveIntensity !== undefined) m.emissiveIntensity = (e.flash > 0 ? 9 : 3.1) * pulse;
      }
    }

    for (let i = 0; i < enemies.length; i++) {
      const a = enemies[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < enemies.length; j++) {
        const b = enemies[j];
        if (!b.alive) continue;
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz) || 0.001;
        const min = a.radius + b.radius;
        if (d < min) {
          const push = (min - d) * 0.5;
          a.x -= (dx / d) * push;
          a.z -= (dz / d) * push;
          b.x += (dx / d) * push;
          b.z += (dz / d) * push;
        }
      }
    }
    audio.combat(nearby / 8);
  }

  function alignBeam(ax: number, ay: number, az: number, bx: number, by: number, bz: number, radius: number) {
    if (!beamMesh) return;
    tmpV.set(ax, ay, az);
    tmpV2.set(bx, by, bz);
    const len = tmpV.distanceTo(tmpV2);
    beamMesh.position.copy(tmpV).lerp(tmpV2, 0.5);
    beamMesh.lookAt(tmpV2);
    beamMesh.scale.set(radius / 0.1, radius / 0.1, len);
  }

  function updateProjs(dt: number) {
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i];
      p.life -= dt;
      p.vy -= (p.kind === "frag" ? 18 : 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.mesh.position.set(p.x, p.y, p.z);
      p.mesh.rotation.x += dt * 8;
      const wall = rayWorld(level.boxes, p.x - p.vx * dt, p.y, p.z - p.vz * dt, p.vx, p.vy, p.vz, Math.hypot(p.vx, p.vy, p.vz) * dt + 0.2);
      const hitWall = wall !== null && wall < 0.35;
      if (p.kind === "frag" && (p.life <= 0 || p.y < 0.12 || hitWall)) {
        explode(p.x, Math.max(0.3, p.y), p.z, p.dmg, p.r);
        scene.remove(p.mesh);
        projs.splice(i, 1);
        continue;
      }
      if (p.kind === "bolt") {
        particles.spawn(p.x, p.y, p.z, 0, 0, 0, 0.12, 0.07, 0x5eead4, 4, 0);
        if (Math.hypot(p.x - px, p.z - pz) < 0.55 && Math.abs(p.y - (py + 1.1)) < 1.1) {
          hurtPlayer(p.dmg);
          particles.burst(p.x, p.y, p.z, 8, 0x5eead4, 3, 0.2, 0.07, 0);
          scene.remove(p.mesh);
          projs.splice(i, 1);
          continue;
        }
        if (p.life <= 0 || hitWall) {
          particles.burst(p.x, p.y, p.z, 6, 0x5eead4, 2, 0.15, 0.05, 0);
          scene.remove(p.mesh);
          projs.splice(i, 1);
        }
      }
    }
  }

  function updateDrops(dt: number) {
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.mesh.rotation.y += dt * 1.8;
      d.mesh.position.y = 0.28 + Math.sin(performance.now() * 0.004 + i) * 0.1;
      if (Math.hypot(d.x - px, d.z - pz) < 1.35) {
        if (d.kind === "health") {
          hp = Math.min(maxHp, hp + 48);
          pushLoot("Health orb", "magic");
        } else if (d.kind === "gold") {
          gold += d.amount;
          pushLoot(`${d.amount} scrap`, "common");
        } else if (d.kind === "ammo") {
          currentWeapon().reserve += 28;
          pushLoot("Ammo pack", "common");
        } else if (d.item) {
          addToInventory(d.item);
          pushLoot(d.item.name, d.item.rarity);
          if (d.item.kind === "weapon" && !save.equippedWeapon) {
            save.equippedWeapon = d.item.uid;
            persistLoadout();
            applyLoadoutVisuals();
            mag = currentWeapon().mag;
          }
        }
        scene.remove(d.mesh);
        drops.splice(i, 1);
      }
    }
  }

  function snapshot(): HudSnapshot {
    const w = currentWeapon();
    const boss = enemies.find((e) => e.kind === "harbinger" && (e.alive || e.dying > 0));
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
      ads: adsT > 0.4,
      boss: boss ? { name: "Void Harbinger", hp: Math.max(0, boss.hp), max: boss.max } : bossAlive ? { name: "Void Harbinger", hp: 0, max: 1 } : null,
      hitFlash,
      xp,
      xpNeed: pLevel * 200,
      level: pLevel,
      combo,
      missionTime,
      hitMarker,
      floating: floaters,
      slots: weapons.map((wp, i) => ({ id: wp.id, name: wp.name, rarity: wp.rarity, active: i === weaponIdx })),
      lockLost: lockLost && phase === "playing" && !isMobile,
      compass: yaw,
      muted: save.mute,
      lowAmmo: mag <= Math.ceil(w.mag * 0.25),
      wave: objective,
      stats: { time: missionTime, kills, gold, xp, shots, hits, damageDealt },
      best: save.runs ? { kills: save.bestKills, time: save.bestTime, gold: save.bestGold, runs: save.runs } : null,
      sensitivity: save.sensitivity,
      invertLookX: save.invertLookX,
      invertLookY: save.invertLookY,
      scrapBank: save.scrapBank,
      inventory: save.inventory,
      equippedWeapon: save.equippedWeapon,
      equippedArmor: save.equippedArmor,
      nearCnc,
    };
  }

  function emitHud(force = false) {
    hudAcc += 1;
    if (force || hudAcc > 1) {
      hudAcc = 0;
      onHud(snapshot());
    }
  }

  function clearCombat() {
    for (const e of enemies) scene.remove(e.rig.group);
    enemies.length = 0;
    for (const d of drops) scene.remove(d.mesh);
    drops.length = 0;
    for (const p of projs) scene.remove(p.mesh);
    projs.length = 0;
    for (const r of rifts) scene.remove(r.mesh);
    rifts.length = 0;
    for (const f of fx) {
      scene.remove(f.mesh);
      f.mesh.geometry.dispose();
    }
    fx.length = 0;
    particles.clear();
    scorch.clear();
    if (beamMesh) beamMesh.visible = false;
    if (slashMesh) slashMesh.visible = false;
  }

  function resetRun() {
    clearCombat();
    yaw = 0;
    pitch = 0.08;
    px = level.spawn.x;
    py = 0;
    pz = level.spawn.z;
    vy = 0;
    velX = 0;
    velZ = 0;
    grounded = true;
    dodgeT = 0;
    invuln = 0;
    hp = 200;
    maxHp = 200;
    shield = 110;
    maxShield = 110;
    shieldCd = 0;
    gold = 0;
    kills = 0;
    xp = 0;
    pLevel = 1;
    syncWeaponsFromSave();
    mag = currentWeapon().mag;
    fireCd = 0;
    reloadT = 0;
    overdriveT = 0;
    skillCd = { frag: 0, overdrive: 0, cleave: 0 };
    trauma = 0;
    hitFlash = 0;
    combo = 0;
    comboT = 0;
    missionTime = 0;
    hitMarker = 0;
    freeze = 0;
    adsT = 0;
    camSnap = true;
    shots = 0;
    hits = 0;
    damageDealt = 0;
    floaters = [];
    spawned = new Set();
    bossAlive = false;
    recorded = false;
    loot = [];
    if (playerRig) {
      playerRig.group.visible = true;
      playerRig.group.scale.setScalar(1);
    }
    applyLoadoutVisuals();
    hp = maxHp;
    shield = maxShield;
  }

  function step(dt: number) {
    const now = performance.now();
    if (gateGroup) {
      const pm = gateGroup.userData.portalMat as THREE.ShaderMaterial | undefined;
      if (pm) pm.uniforms.uTime.value = now * 0.001;
      const ring2 = gateGroup.userData.ring2 as THREE.Object3D | undefined;
      if (ring2) ring2.rotation.z += dt * 0.8;
      particles.mote(level.gate.x + (Math.random() - 0.5) * 3, 2 + Math.random() * 3, level.gate.z + (Math.random() - 0.5) * 2, 0x22d3ee);
    }
    particles.mote(px + (Math.random() - 0.5) * 18, 1 + Math.random() * 4, pz - 4 + (Math.random() - 0.5) * 18, Math.random() > 0.6 ? 0xe85d04 : 0x5eead4);
    particles.update(dt);
    scorch.update(dt);
    for (let i = rifts.length - 1; i >= 0; i--) {
      rifts[i].life -= dt;
      rifts[i].mesh.rotation.y += dt * 4;
      rifts[i].mesh.scale.setScalar(Math.max(0.1, rifts[i].life / 0.9));
      if (rifts[i].life <= 0) {
        scene.remove(rifts[i].mesh);
        rifts.splice(i, 1);
      }
    }
    for (let i = fx.length - 1; i >= 0; i--) {
      fx[i].life -= dt;
      if (fx[i].life <= 0) {
        scene.remove(fx[i].mesh);
        fx[i].mesh.geometry.dispose();
        fx.splice(i, 1);
      }
    }
    if (muzzleFlash && muzzleFlash.visible) {
      muzzleFlash.rotateY(dt * 20);
      if (muzzleLight.intensity < 0.4) muzzleFlash.visible = false;
    }
    if (slashT > 0) {
      slashT -= dt;
      if (slashMesh) {
        slashMesh.rotateY(dt * 8);
        (slashMesh.material as THREE.MeshBasicMaterial).opacity = slashT / 0.22;
        if (slashT <= 0) slashMesh.visible = false;
      }
    }
    for (const f of floaters) f.life -= dt;
    floaters = floaters.filter((f) => f.life > 0);

    if (phase === "title" || phase === "boot") {
      if (playerRig) playerRig.group.visible = false;
      drone.visible = false;
      if (aimReticle) aimReticle.visible = false;
      const t = now * 0.00008;
      camera.position.set(2.4 + Math.sin(t) * 2.2, 9.4, 14.5 + Math.cos(t * 0.7) * 1.6);
      camera.lookAt(0.2, 0.4, -16);
      camera.fov = 42;
      camera.updateProjectionMatrix();
      emitHud();
      prevKeys.clear();
      for (const c of keySet()) prevKeys.add(c);
      return;
    }
    if (phase === "ship") {
      if (aimReticle) aimReticle.visible = false;
      drone.visible = false;
      if (playerRig) playerRig.group.visible = true;
      const mv = inputMove();
      const basis = camBasis();
      let wishX = basis.f.x * mv.y + basis.r.x * mv.x;
      let wishZ = basis.f.z * mv.y + basis.r.z * mv.x;
      const wm = Math.hypot(wishX, wishZ);
      if (wm > 1) {
        wishX /= wm;
        wishZ /= wm;
      }
      px = THREE.MathUtils.clamp(px + wishX * 4.6 * dt, -8.4, 8.4);
      pz = THREE.MathUtils.clamp(pz + wishZ * 4.6 * dt, -6.8, 7.2);
      py = 0.12;
      if (wm > 0.12) yaw = Math.atan2(-wishX, -wishZ);
      const cnc = { x: 5.4, z: -4.4 };
      nearCnc = Math.hypot(px - cnc.x, pz - cnc.z) < 2.35;
      if (justPressed("KeyE") && nearCnc) {
        /* UI listens to nearCnc + I / CNC button */
      }
      const hol = shipRoot.getObjectByName("cncHolo");
      if (hol) hol.rotation.y += dt * 1.6;
      if (playerRig) {
        const moving = wm > 0.12;
        const bob = moving ? Math.sin(now * 0.01) : 0;
        playerRig.leftThigh.rotation.x = bob * 0.55;
        playerRig.rightThigh.rotation.x = -bob * 0.55;
        playerRig.leftArm.rotation.x = -0.55 - bob * 0.12;
        playerRig.leftArm.rotation.z = 0.28;
        playerRig.rightArm.rotation.x = -0.72 + bob * 0.08;
        playerRig.rightArm.rotation.y = -0.12;
        playerRig.group.position.set(px, py, pz);
        playerRig.group.rotation.y = yaw + Math.PI;
      }
      placeFollowCam(dt);
      emitHud();
      prevKeys.clear();
      for (const c of keySet()) prevKeys.add(c);
      return;
    }
    if (phase !== "playing") {
      if (aimReticle) aimReticle.visible = false;
      emitHud();
      prevKeys.clear();
      for (const c of keySet()) prevKeys.add(c);
      return;
    }

    const sim = freeze > 0 ? 0 : dt;
    freeze = Math.max(0, freeze - dt);
    missionTime += sim;
    comboT = Math.max(0, comboT - dt);
    if (comboT <= 0) combo = 0;
    hitMarker = Math.max(0, hitMarker - dt);
    emptyCd = Math.max(0, emptyCd - dt);

    const k = keySet();
    const pad = pollPad();
    touch.lookX = 0;
    touch.lookY = 0;
    pitch = 0.08;
    updateAim();

    if (justPressed("Digit1") || justPressed("Digit2") || justPressed("Digit3")) {
      const slot = k.has("Digit1") ? 1 : k.has("Digit2") ? 2 : 3;
      if (slot !== prevSlot) selectWeaponSlot(slot - 1);
      prevSlot = slot;
    } else prevSlot = 0;

    if (justPressed("KeyR")) startReload();
    if (justPressed("KeyQ") || (held.frag && skillCd.frag <= 0)) throwFrag();
    if ((justPressed("KeyE") || held.overdrive) && skillCd.overdrive <= 0) {
      skillCd.overdrive = 16;
      overdriveT = 6;
      particles.burst(px, py + 1.2, pz, 16, 0xe85d04, 3, 0.4, 0.1, 1);
    }
    if (justPressed("KeyF") || (held.cleave && skillCd.cleave <= 0)) cleave();
    const wantAds = held.ads || k.has("ControlLeft") || pad.ads;
    adsT = THREE.MathUtils.damp(adsT, wantAds ? 1 : 0, 12, dt);

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
    trauma = Math.max(0, trauma - dt * 1.7);
    hitFlash = Math.max(0, hitFlash - dt);
    dodgeT = Math.max(0, dodgeT - dt);
    muzzleLight.intensity *= Math.pow(0.001, dt);

    if (sim > 0) {
      const mv = inputMove();
      const sprint = held.sprint || k.has("ShiftLeft") || k.has("ShiftRight") || pad.sprint;
      const speed = (sprint ? SPRINT : WALK) * (overdriveT > 0 ? 1.22 : 1) * (wantAds ? 0.72 : 1);
      const basis = camBasis();
      let wishX = basis.f.x * mv.y + basis.r.x * mv.x;
      let wishZ = basis.f.z * mv.y + basis.r.z * mv.x;
      const wm = Math.hypot(wishX, wishZ);
      if (wm > 1) {
        wishX /= wm;
        wishZ /= wm;
      }
      if ((justPressed("Space") || held.dodge) && dodgeT <= 0) {
        dodgeT = 0.32;
        invuln = 0.32;
        audio.dodge();
        const magw = Math.hypot(wishX, wishZ) || 1;
        dodgeDirX = wishX / magw || basis.f.x;
        dodgeDirZ = wishZ / magw || basis.f.z;
        particles.spray(px, py + 0.4, pz, -dodgeDirX, 0.2, -dodgeDirZ, 10, 0xece8e1, 5, 0.25, 0.08);
        held.dodge = false;
      }
      if (dodgeT > 0) {
        wishX = dodgeDirX;
        wishZ = dodgeDirZ;
      }
      const targetSp = dodgeT > 0 ? DODGE_SPEED : speed;
      const accel = dodgeT > 0 ? 28 : 18;
      velX += (wishX * targetSp - velX) * Math.min(1, accel * sim);
      velZ += (wishZ * targetSp - velZ) * Math.min(1, accel * sim);
      if (wm < 0.08 && dodgeT <= 0) {
        velX *= Math.pow(0.04, sim);
        velZ *= Math.pow(0.04, sim);
      }
      px += velX * sim;
      pz += velZ * sim;
      const col = collidePlayer(level.boxes, px, py, pz, PLAYER_R, PLAYER_H);
      px = col.x;
      pz = col.z;
      const gh = groundHeight(level.boxes, px, pz, py);
      vy -= GRAVITY * sim;
      py += vy * sim;
      if (py <= gh) {
        py = gh;
        vy = 0;
        grounded = true;
      } else grounded = false;

      const moving = Math.hypot(velX, velZ) > 0.6 && grounded;
      if (moving) {
        footT += sim * (sprint ? 2.4 : 1.7);
        if (footT > 1) {
          footT = 0;
          audio.foot();
          particles.spawn(px, 0.08, pz, 0, 0.4, 0, 0.25, 0.07, 0x8a847c, 3, -1);
        }
      }

      if (held.fire || k.has("Mouse0") || pad.fire) fireWeapon();

      shieldCd -= sim;
      if (shieldCd <= 0 && shield < maxShield) shield = Math.min(maxShield, shield + 28 * sim);

      maybeSpawn();
      updateEnemies(sim);
      updateProjs(sim);
      updateDrops(sim);
    }

    const f = forward();
    if (playerRig) {
      const t = now * 0.001;
      const moving = Math.hypot(velX, velZ) > 0.6 && grounded;
      const sprint = held.sprint || k.has("ShiftLeft") || k.has("ShiftRight");
      const bob = moving ? Math.sin(t * (sprint ? 12 : 8)) : 0;
      playerRig.leftThigh.rotation.x = bob * 0.7;
      playerRig.rightThigh.rotation.x = -bob * 0.7;
      playerRig.leftArm.rotation.x = -0.55 - bob * 0.12;
      playerRig.leftArm.rotation.z = 0.28;
      playerRig.rightArm.rotation.x = -0.72 + bob * 0.08 - (fireCd > 0 ? 0.16 : 0) - (reloadT > 0 ? 0.35 : 0);
      playerRig.rightArm.rotation.y = -0.12;
      playerRig.group.position.set(px, py, pz);
      playerRig.group.rotation.y = yaw + Math.PI;
      playerRig.torso.rotation.x = pitch * 0.22;
      playerRig.head.rotation.x = pitch * 0.35;
      if (overdriveT > 0) {
        (playerRig.visor.material as THREE.MeshStandardMaterial).emissiveIntensity = 5;
        overLight.intensity = 2.2;
      } else {
        (playerRig.visor.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.6;
        overLight.intensity = 0;
      }
    }
    const ang = now * 0.0018;
    drone.position.set(px + Math.cos(ang) * 1.15, py + 1.75, pz + Math.sin(ang) * 1.15);
    drone.lookAt(px, py + 1.4, pz);
    muzzleLight.position.set(px + f.x * 0.85, py + 1.4, pz + f.z * 0.85);
    overLight.position.set(px, py + 1.4, pz);
    playerKey.position.set(px + 1.2, py + 4.2, pz + 1.8);
    playerRim.position.set(px - 1.4, py + 2.2, pz - 1.2);

    placeFollowCam(dt);

    prevKeys.clear();
    for (const c of keySet()) prevKeys.add(c);
    if (held.reload) prevKeys.add("Rel");
    emitHud();
  }

  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;

  function frame(now: number) {
    if (destroyed) return;
    requestAnimationFrame(frame);
    let dlt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dlt;
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
    isMobile = isTouchUi();
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
      emitHud(true);
    }
    if (e.code === "KeyM") {
      save.mute = !save.mute;
      audio.setMuted(save.mute);
      writeSave(save);
      emitHud(true);
    }
  };
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code);
  const onBlur = () => keys.clear();
  const onMouse = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    ndc.x = ((e.clientX - rect.left) / w) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / h) * 2 + 1;
    mouseAim = true;
  };
  const onDown = (e: MouseEvent) => {
    if (e.button === 0) held.fire = true;
    if (e.button === 2) held.ads = true;
  };
  const onUp = (e: MouseEvent) => {
    if (e.button === 0) held.fire = false;
    if (e.button === 2) held.ads = false;
  };
  const onWheel = (e: WheelEvent) => {
    if (phase !== "playing") return;
    e.preventDefault();
    weaponIdx = (weaponIdx + (e.deltaY > 0 ? 1 : -1) + weapons.length) % weapons.length;
    mag = Math.min(mag, currentWeapon().mag);
    swapGunMesh();
  };
  const onContext = (e: Event) => e.preventDefault();
  const onVis = () => {
    if (document.visibilityState === "visible") audio.resume();
    else keys.clear();
  };
  const onLock = () => {
    lockLost = false;
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  window.addEventListener("mousemove", onMouse);
  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("contextmenu", onContext);
  document.addEventListener("visibilitychange", onVis);
  document.addEventListener("pointerlockchange", onLock);
  window.addEventListener("resize", resize);
  canvas.style.touchAction = "none";
  canvas.style.cursor = "crosshair";

  const probe: ControlsProbe = {
    getYaw: () => yaw,
    getSpeed: () => Math.hypot(velX, velZ) || Math.hypot(inputMove().x, inputMove().y),
    setKeys: (codes: string[]) => {
      qaKeys.active = codes.length > 0;
      qaKeys.codes = codes;
      if (codes.length === 0) qaKeys.active = false;
    },
    setSteer: () => {},
    getPos: () => ({ x: px, z: pz, y: py }),
    getCam: () => {
      const dx = camera.position.x - px;
      const dy = camera.position.y - py;
      const dz = camera.position.z - pz;
      return {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        fov: camera.fov,
        dist: Math.hypot(dx, dy, dz),
      };
    },
  };
  window.__controlsTest = probe;

  audio.setMuted(save.mute);
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
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContext);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("pointerlockchange", onLock);
      window.removeEventListener("resize", resize);
      particles.dispose();
      scorch.dispose();
      renderer.dispose();
      if (window.__controlsTest === probe) delete window.__controlsTest;
    },
    startMission() {
      audio.unlock();
      if (!worldBuilt) setupWorld();
      showMission();
      resetRun();
      phase = "playing";
      if (playerRig) playerRig.group.visible = true;
      drone.visible = true;
      objective = "Advance to the Void Gate";
      hint = isMobile ? "Left stick move · right drag aim" : "WASD move · mouse aim · click fire · Q/E/F skills";
      aimPoint.set(px, 0, pz - 8);
      touchAimYaw = 0;
      touchAimSR = 0;
      touchAimSF = 8;
      placeFollowCam(1 / 60, true);
      emitHud(true);
    },
    enterShip() {
      audio.unlock();
      showShip();
    },
    recallToShip() {
      if (phase === "playing" || phase === "paused" || phase === "dead" || phase === "victory") {
        if (phase === "playing" || phase === "paused") bankScrap(1);
        gold = 0;
        showShip();
      }
    },
    equipItem,
    craftRecipe,
    pause() {
      if (phase === "playing") {
        phase = "paused";
        emitHud(true);
      }
    },
    resume() {
      if (phase === "paused") {
        phase = "playing";
        emitHud(true);
      }
    },
    setMuted(m) {
      save.mute = m;
      audio.setMuted(m);
      writeSave(save);
      emitHud(true);
    },
    setSensitivity(s) {
      save.sensitivity = Math.min(2, Math.max(0.4, s));
      writeSave(save);
      emitHud(true);
    },
    setInvertLookX(v) {
      save.invertLookX = v;
      writeSave(save);
      emitHud(true);
    },
    setInvertLookY(v) {
      save.invertLookY = v;
      writeSave(save);
      emitHud(true);
    },
    setTouchMove(x, y) {
      touch.mx = x;
      touch.my = y;
    },
    setTouchLook(dx, dy) {
      const inv = lookSign();
      const s = BASE_SENS * 26 * save.sensitivity;
      touchAimSR += dx * s * inv.x;
      touchAimSF += -dy * s * inv.y;
      const max = 14;
      touchAimSR = THREE.MathUtils.clamp(touchAimSR, -max, max);
      touchAimSF = THREE.MathUtils.clamp(touchAimSF, 2.2, max);
      touchAimYaw = Math.atan2(-touchAimSR, -touchAimSF);
      touch.lookX = 0;
      touch.lookY = 0;
    },
    setAction(name, down) {
      if (name === "fire") held.fire = down;
      if (name === "sprint") held.sprint = down;
      if (name === "reload") held.reload = down;
      if (name === "frag") held.frag = down;
      if (name === "overdrive") held.overdrive = down;
      if (name === "cleave") held.cleave = down;
      if (name === "ads") held.ads = down;
    },
    pulse(name) {
      if (name === "dodge") {
        held.dodge = true;
      }
      if (name === "frag") throwFrag();
      if (name === "cleave") cleave();
      if (name === "overdrive" && skillCd.overdrive <= 0) {
        skillCd.overdrive = 16;
        overdriveT = 6;
      }
      if (name === "reload") startReload();
      if (name === "w1") selectWeaponSlot(0);
      if (name === "w2") selectWeaponSlot(1);
      if (name === "w3") selectWeaponSlot(2);
    },
  };
}
