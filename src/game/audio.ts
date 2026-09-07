export class GameAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  sfx: GainNode | null = null;
  music: GainNode | null = null;
  muted = false;
  private drone: OscillatorNode | null = null;
  private noise: AudioBuffer | null = null;

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.85;
      this.sfx.gain.value = 0.7;
      this.music.gain.value = 0.18;
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
    osc.frequency.value = 46;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 180;
    const g = this.ctx.createGain();
    g.gain.value = 0.35;
    osc.connect(f);
    f.connect(g);
    g.connect(this.music);
    osc.start();
    this.drone = osc;

    const pulse = this.ctx.createOscillator();
    pulse.type = "square";
    pulse.frequency.value = 1.15;
    const pg = this.ctx.createGain();
    pg.gain.value = 40;
    pulse.connect(pg);
    pg.connect(f.frequency);
    pulse.start();
  }

  fire(kind: "ar" | "shotgun" | "smg" | "frag") {
    if (!this.ctx || !this.sfx || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = kind === "shotgun" ? 0.6 : kind === "smg" ? 1.6 : 1.1;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = kind === "shotgun" ? 220 : kind === "smg" ? 1400 : 900;
    bp.Q.value = 0.7;
    const g = this.ctx.createGain();
    const dur = kind === "shotgun" ? 0.22 : kind === "frag" ? 0.5 : 0.07;
    g.gain.setValueAtTime(kind === "shotgun" || kind === "frag" ? 0.9 : 0.45, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + dur + 0.02);

    const click = this.ctx.createOscillator();
    click.type = "triangle";
    click.frequency.setValueAtTime(kind === "frag" ? 80 : 240, t);
    click.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    const cg = this.ctx.createGain();
    cg.gain.setValueAtTime(0.2, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    click.connect(cg);
    cg.connect(this.sfx);
    click.start(t);
    click.stop(t + 0.1);
  }

  hit() {
    if (!this.ctx || !this.sfx || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
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
    src.playbackRate.value = 0.45 + Math.random() * 0.1;
    const f = this.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 320;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + 0.1);
  }
}
