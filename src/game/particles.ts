import * as THREE from "three";

const MAX = 520;

type P = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  max: number;
  size: number;
  r: number;
  g: number;
  b: number;
  drag: number;
  gy: number;
};

function glowTex() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.28, "rgba(255,255,255,0.65)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

export class ParticleField {
  object: THREE.Points;
  private pos: Float32Array;
  private col: Float32Array;
  private siz: Float32Array;
  private list: P[] = [];
  private geo: THREE.BufferGeometry;
  private mat: THREE.ShaderMaterial;

  constructor() {
    this.pos = new Float32Array(MAX * 3);
    this.col = new Float32Array(MAX * 3);
    this.siz = new Float32Array(MAX);
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute("color", new THREE.BufferAttribute(this.col, 3));
    this.geo.setAttribute("size", new THREE.BufferAttribute(this.siz, 1));
    this.geo.setDrawRange(0, 0);
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: { value: glowTex() },
        uScale: { value: 280 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vFade;
        uniform float uScale;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = max(1.5, size * uScale / max(0.4, -mv.z));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTex;
        varying vec3 vColor;
        void main() {
          vec4 t = texture2D(uTex, gl_PointCoord);
          float a = t.a;
          if (a < 0.04) discard;
          gl_FragColor = vec4(vColor * a, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    this.object = new THREE.Points(this.geo, this.mat);
    this.object.frustumCulled = false;
  }

  spawn(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    life: number,
    size: number,
    color: number,
    drag = 1.8,
    gy = -4,
  ) {
    if (this.list.length >= MAX) this.list.shift();
    this.list.push({
      x,
      y,
      z,
      vx,
      vy,
      vz,
      life,
      max: life,
      size,
      r: ((color >> 16) & 255) / 255,
      g: ((color >> 8) & 255) / 255,
      b: (color & 255) / 255,
      drag,
      gy,
    });
  }

  burst(
    x: number,
    y: number,
    z: number,
    n: number,
    color: number,
    speed: number,
    life: number,
    size: number,
    gy = -6,
  ) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const e = Math.acos(2 * Math.random() - 1);
      const s = speed * (0.35 + Math.random());
      this.spawn(
        x,
        y,
        z,
        Math.sin(e) * Math.cos(a) * s,
        Math.cos(e) * s,
        Math.sin(e) * Math.sin(a) * s,
        life * (0.55 + Math.random() * 0.7),
        size * (0.6 + Math.random() * 0.8),
        color,
        2.2,
        gy,
      );
    }
  }

  spray(
    x: number,
    y: number,
    z: number,
    dx: number,
    dy: number,
    dz: number,
    n: number,
    color: number,
    speed: number,
    life: number,
    size: number,
  ) {
    for (let i = 0; i < n; i++) {
      this.spawn(
        x,
        y,
        z,
        dx * speed + (Math.random() - 0.5) * speed * 0.5,
        dy * speed + (Math.random() - 0.5) * speed * 0.35,
        dz * speed + (Math.random() - 0.5) * speed * 0.5,
        life * (0.5 + Math.random() * 0.6),
        size,
        color,
        3.2,
        -2,
      );
    }
  }

  mote(x: number, y: number, z: number, color: number) {
    this.spawn(
      x,
      y,
      z,
      (Math.random() - 0.5) * 0.4,
      0.3 + Math.random() * 0.5,
      (Math.random() - 0.5) * 0.4,
      2.4 + Math.random() * 2,
      0.08 + Math.random() * 0.06,
      color,
      0.4,
      0.15,
    );
  }

  update(dt: number) {
    const live: P[] = [];
    let i = 0;
    for (const p of this.list) {
      p.life -= dt;
      if (p.life <= 0) continue;
      p.vx *= Math.max(0, 1 - p.drag * dt);
      p.vy += p.gy * dt;
      p.vz *= Math.max(0, 1 - p.drag * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      live.push(p);
      const k = i * 3;
      this.pos[k] = p.x;
      this.pos[k + 1] = p.y;
      this.pos[k + 2] = p.z;
      const fade = Math.min(1, p.life / Math.min(0.28, p.max));
      this.col[k] = p.r * fade;
      this.col[k + 1] = p.g * fade;
      this.col[k + 2] = p.b * fade;
      this.siz[i] = p.size * (0.55 + 0.45 * fade);
      i++;
    }
    this.list = live;
    this.geo.setDrawRange(0, i);
    (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  }

  clear() {
    this.list.length = 0;
    this.geo.setDrawRange(0, 0);
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
    const tex = this.mat.uniforms.uTex.value as THREE.Texture | undefined;
    tex?.dispose();
  }
}

export class ScorchPool {
  private meshes: THREE.Mesh[] = [];
  private lives: number[] = [];
  private scene: THREE.Scene;
  private geo: THREE.CircleGeometry;
  private mat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.geo = new THREE.CircleGeometry(1, 12);
    this.geo.rotateX(-Math.PI / 2);
    this.mat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0c,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
  }

  stamp(x: number, z: number, r = 1.4) {
    let m = this.meshes.find((_, i) => this.lives[i] <= 0);
    if (!m) {
      if (this.meshes.length >= 18) {
        m = this.meshes[0];
      } else {
        m = new THREE.Mesh(this.geo, this.mat);
        this.scene.add(m);
        this.meshes.push(m);
        this.lives.push(0);
      }
    }
    const i = this.meshes.indexOf(m);
    this.lives[i] = 7;
    m.position.set(x, 0.03, z);
    m.scale.setScalar(r);
    m.visible = true;
  }

  update(dt: number) {
    for (let i = 0; i < this.meshes.length; i++) {
      this.lives[i] -= dt;
      const m = this.meshes[i];
      if (this.lives[i] <= 0) {
        m.visible = false;
      } else {
        (m.material as THREE.MeshBasicMaterial).opacity = Math.min(0.45, this.lives[i] * 0.08);
      }
    }
  }

  clear() {
    for (const m of this.meshes) m.visible = false;
    this.lives.fill(0);
  }

  dispose() {
    for (const m of this.meshes) this.scene.remove(m);
    this.geo.dispose();
    this.mat.dispose();
  }
}
