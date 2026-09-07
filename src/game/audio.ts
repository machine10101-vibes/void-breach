export class GameAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  sfx: GainNode | null = null;
  music: GainNode | null = null;
  muted = false;
  private drone: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;

  unlock() {
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.85;
      this.sfx.gain.value = 0.72;
      this.music.gain.value = 0.2;
      this.sfx.connect(this.master);
      this.music.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.noise = this.makeNoise();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.startDrone();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.02);
    }
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  combat(level: number) {
    if (!this.droneFilter || !this.ctx) return;
    const f = 160 + Math.min(1, level) * 420;
    this.droneFilter.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.4);
  }

  private makeNoise() {
    if (!this.ctx) return null;
    const len = this.ctx.sampleRate * 1.2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  private startDrone() {
    if (!this.ctx || !this.music || this.drone) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 44;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 170;
    const g = this.ctx.createGain();
    g.gain.value = 0.32;
    osc.connect(f);
    f.connect(g);
    g.connect(this.music);
    osc.start();
    this.drone = osc;
    this.droneFilter = f;

    const pulse = this.ctx.createOscillator();
    pulse.type = "square";
    pulse.frequency.value = 1.05;
    const pg = this.ctx.createGain();
    pg.gain.value = 36;
    pulse.connect(pg);
    pg.connect(f.frequency);
    pulse.start();

    const high = this.ctx.createOscillator();
    high.type = "triangle";
    high.frequency.value = 110;
    const hg = this.ctx.createGain();
    hg.gain.value = 0.04;
    high.connect(hg);
    hg.connect(this.music);
    high.start();
  }

  private noiseBurst(rate: number, freq: number, q: number, gain: number, dur: number) {
    if (!this.ctx || !this.sfx || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = rate;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  fire(kind: "ar" | "shotgun" | "smg" | "frag") {
    if (!this.ctx || !this.sfx || !this.noise) return;
    const t = this.ctx.currentTime;
    const rate = kind === "shotgun" ? 0.55 + Math.random() * 0.08 : kind === "smg" ? 1.5 + Math.random() * 0.2 : 1.05 + Math.random() * 0.12;
    this.noiseBurst(
      rate,
      kind === "shotgun" ? 210 : kind === "smg" ? 1450 : 880,
      0.7,
      kind === "shotgun" || kind === "frag" ? 0.92 : 0.42,
      kind === "shotgun" ? 0.24 : kind === "frag" ? 0.5 : 0.07,
    );
    const click = this.ctx.createOscillator();
    click.type = "triangle";
    click.frequency.setValueAtTime(kind === "frag" ? 80 : 220 + Math.random() * 40, t);
    click.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    const cg = this.ctx.createGain();
    cg.gain.setValueAtTime(0.18, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    click.connect(cg);
    cg.connect(this.sfx);
    click.start(t);
    click.stop(t + 0.1);
  }

  empty() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "square";
    o.frequency.value = 90;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.07);
  }

  reload() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.2);
  }

  explode() {
    this.noiseBurst(0.35, 140, 0.5, 1.0, 0.55);
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.44);
  }

  beam() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(90, t);
    o.frequency.linearRampToValueAtTime(240, t + 0.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    const f = this.ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 700;
    o.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.56);
  }

  spawn() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(80, t + 0.35);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.38);
  }

  kill() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.16);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.2);
  }

  dodge() {
    this.noiseBurst(1.8, 1800, 0.4, 0.16, 0.12);
  }

  hit() {
    if (!this.ctx || !this.sfx || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    const f = this.ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 600;
    src.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + 0.1);
  }

  hurt() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.25);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.26);
  }

  shieldBreak() {
    this.noiseBurst(0.9, 900, 0.8, 0.4, 0.2);
  }

  pickup() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(660, t);
    o.frequency.exponentialRampToValueAtTime(1320, t + 0.12);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g);
    g.connect(this.sfx);
    o.start(t);
    o.stop(t + 0.18);
  }

  foot() {
    if (!this.ctx || !this.sfx || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.45 + Math.random() * 0.12;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 320;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.11, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + 0.1);
  }
}
