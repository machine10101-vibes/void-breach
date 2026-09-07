import { Pause, Volume2, VolumeX } from "lucide-react";
import type { HudSnapshot, Rarity } from "./types";

function Bar({
  value,
  max,
  color,
  height = "h-2",
}: {
  value: number;
  max: number;
  color: string;
  height?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`w-full overflow-hidden rounded-sm bg-elevated ${height}`}>
      <div className={`h-full ${color} transition-[width] duration-150`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const rarityClass: Record<Rarity, string> = {
  common: "text-fg",
  magic: "text-magic",
  rare: "text-rare",
  legendary: "text-legendary",
};

const floatClass = {
  health: "text-health",
  void: "text-void",
  legendary: "text-legendary",
  fg: "text-fg",
};

function formatTime(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Hud({
  hud,
  onPause,
  onMute,
}: {
  hud: HudSnapshot;
  onPause?: () => void;
  onMute?: () => void;
}) {
  if (hud.phase === "title" || hud.phase === "boot") return null;
  const heading = ((-hud.compass * 180) / Math.PI + 36000) % 360;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      {hud.hitFlash > 0 ? (
        <div className="absolute inset-0 bg-health/30" style={{ opacity: Math.min(0.5, hud.hitFlash) }} />
      ) : null}

      <div className="absolute left-0 right-0 top-0 flex flex-col items-center gap-2 px-4 pt-3 sm:pt-4">
        <div className="relative h-5 w-48 overflow-hidden sm:w-64">
          <div
            className="absolute top-0 flex h-5 items-center gap-6 font-mono text-[10px] uppercase tracking-[0.3em] text-faint"
            style={{ transform: `translateX(calc(50% - ${heading * 0.7}px))` }}
          >
            {["N", "E", "S", "W", "N", "E", "S", "W", "N"].map((d, i) => (
              <span key={i} className={d === "N" ? "text-accent" : ""}>
                {d}
              </span>
            ))}
          </div>
          <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-accent" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">{hud.objective}</p>
        {hud.boss ? (
          <div className="w-full max-w-md">
            <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
              <span>{hud.boss.name}</span>
              <span>
                {Math.ceil(hud.boss.hp)} / {hud.boss.max}
              </span>
            </div>
            <Bar value={hud.boss.hp} max={hud.boss.max} color="bg-void" height="h-2.5" />
          </div>
        ) : null}
      </div>

      <div className="absolute left-4 top-16 hidden w-44 flex-col gap-1 sm:flex">
        {(hud.loot ?? []).map((l) => (
          <p key={l.id} className={`font-display text-lg leading-tight ${rarityClass[l.rarity] ?? "text-fg"}`}>
            {l.name}
          </p>
        ))}
      </div>

      <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
        <div className="text-right font-mono text-[10px] uppercase tracking-widest text-muted">
          <p>Op {hud.level}</p>
          <p className="text-fg">{hud.gold} scrap</p>
          <p>{hud.kills} kills</p>
          <p>{formatTime(hud.missionTime)}</p>
        </div>
        <button
          type="button"
          onClick={onMute}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface/80 text-fg"
          aria-label={hud.muted ? "Unmute" : "Mute"}
        >
          {hud.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        <button
          type="button"
          onClick={onPause}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface/80 text-fg"
          aria-label="Pause"
        >
          <Pause className="size-4" />
        </button>
      </div>

      <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-3 sm:bottom-8 sm:left-6 sm:right-auto sm:w-[22rem]">
        <div>
          <div className="mb-1 flex items-end justify-between">
            <span className="font-display text-3xl font-semibold leading-none tabular-nums">
              {Math.ceil(hud.health)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-shield">
              Shield {Math.ceil(hud.shield)}
            </span>
          </div>
          <Bar value={hud.health} max={hud.maxHealth} color="bg-health" height="h-2.5" />
          <div className="mt-1">
            <Bar value={hud.shield} max={hud.maxShield} color="bg-shield" />
          </div>
          <div className="mt-1">
            <Bar value={hud.xp} max={hud.xpNeed} color="bg-accent" height="h-1" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={`font-display text-xl font-semibold ${rarityClass[hud.rarity]}`}>{hud.weaponName}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {hud.reloading ? "Reloading" : hud.overdrive ? "Overdrive" : hud.ads ? "Aimed" : "Primary"}
            </p>
          </div>
          <p
            className={`font-display text-4xl font-semibold tabular-nums leading-none ${hud.lowAmmo ? "text-health" : ""}`}
          >
            {hud.ammo}
            <span className="ml-1 font-mono text-sm text-muted">/{hud.reserve}</span>
          </p>
        </div>

        <div className="hidden gap-1 sm:flex">
          {(hud.slots ?? []).map((s, i) => (
            <div
              key={s.id + i}
              className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${
                s.active ? "border-accent text-fg" : "border-border text-faint"
              }`}
            >
              {i + 1} {s.id}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-28 left-1/2 hidden -translate-x-1/2 gap-2 sm:flex">
        {(hud.skills ?? []).map((s) => {
          const pct = s.ready ? 100 : ((s.max - s.cd) / s.max) * 100;
          return (
            <div
              key={s.id}
              className="relative flex h-14 w-16 flex-col items-center justify-center overflow-hidden rounded-md border border-border bg-surface/80"
            >
              <div className="absolute inset-x-0 bottom-0 bg-accent/30" style={{ height: `${pct}%` }} />
              <span className="relative font-mono text-[10px] text-faint">{s.key}</span>
              <span className="relative font-display text-sm font-semibold">
                {s.ready ? s.name : s.cd.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className={`relative ${hud.ads ? "h-4 w-4" : "h-5 w-5"}`}>
          <span
            className={`absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 ${hud.hitMarker > 0 ? "bg-void" : "bg-fg/80"}`}
          />
          <span
            className={`absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 ${hud.hitMarker > 0 ? "bg-void" : "bg-fg/80"}`}
          />
          <span
            className={`absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 ${hud.hitMarker > 0 ? "bg-void" : "bg-fg/80"}`}
          />
          <span
            className={`absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 ${hud.hitMarker > 0 ? "bg-void" : "bg-fg/80"}`}
          />
        </div>
        {hud.combo > 1 ? (
          <p className="mt-6 text-center font-display text-2xl font-semibold text-accent">{hud.combo}x</p>
        ) : null}
      </div>

      {(hud.floating ?? []).map((f) => (
        <span
          key={f.id}
          className={`pointer-events-none absolute font-display text-lg font-semibold ${floatClass[f.color]}`}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            opacity: Math.min(1, f.life * 2),
            transform: `translate(-50%, ${-12 - (0.85 - f.life) * 28}px)`,
          }}
        >
          {f.text}
        </span>
      ))}

      {hud.lockLost ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="rounded-md border border-border bg-surface/90 px-5 py-3 font-display text-xl font-semibold">
            Click to recapture aim
          </p>
        </div>
      ) : null}

      <p className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-faint sm:block">
        {hud.hint}
      </p>
    </div>
  );
}

export function PauseOverlay({
  title,
  body,
  action,
  onAction,
  secondary,
  onSecondary,
  stats,
  muted,
  onMute,
  sensitivity,
  onSensitivity,
}: {
  title: string;
  body: string;
  action: string;
  onAction: () => void;
  secondary?: string;
  onSecondary?: () => void;
  stats?: { time: number; kills: number; gold: number; shots: number; hits: number };
  muted?: boolean;
  onMute?: () => void;
  sensitivity?: number;
  onSensitivity?: (v: number) => void;
}) {
  const acc = stats && stats.shots > 0 ? Math.round((stats.hits / stats.shots) * 100) : 0;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/80 px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        <h2 className="font-display text-4xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
        {stats ? (
          <dl className="mt-6 grid grid-cols-2 gap-3 font-mono text-xs uppercase tracking-widest text-muted">
            <div>
              <dt className="text-faint">Time</dt>
              <dd className="text-fg">{formatTime(stats.time)}</dd>
            </div>
            <div>
              <dt className="text-faint">Kills</dt>
              <dd className="text-fg">{stats.kills}</dd>
            </div>
            <div>
              <dt className="text-faint">Scrap</dt>
              <dd className="text-fg">{stats.gold}</dd>
            </div>
            <div>
              <dt className="text-faint">Accuracy</dt>
              <dd className="text-fg">{acc}%</dd>
            </div>
          </dl>
        ) : null}
        {typeof sensitivity === "number" && onSensitivity ? (
          <label className="mt-6 block">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">Look sensitivity</span>
            <input
              type="range"
              min={0.4}
              max={2}
              step={0.05}
              value={sensitivity}
              onChange={(e) => onSensitivity(Number(e.target.value))}
              className="mt-2 w-full accent-accent"
            />
          </label>
        ) : null}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAction}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-fg font-display text-xl font-semibold text-accent-fg transition-transform duration-150 active:scale-[0.98]"
          >
            {action}
          </button>
          {secondary && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="flex h-12 w-full items-center justify-center rounded-lg border border-border bg-elevated font-display text-lg font-semibold text-fg"
            >
              {secondary}
            </button>
          ) : null}
          {onMute ? (
            <button
              type="button"
              onClick={onMute}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border font-mono text-xs uppercase tracking-widest text-muted"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              {muted ? "Unmute" : "Mute"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
