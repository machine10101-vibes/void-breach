import type { ReactNode } from "react";
import { Pause, Settings, Volume2, VolumeX } from "lucide-react";
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
    <div className={`w-full overflow-hidden rounded-sm bg-elevated/80 ${height}`}>
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

function IconBtn({
  label,
  onClick,
  children,
  compact,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pointer-events-auto flex items-center justify-center rounded-md border border-border bg-surface/80 text-fg ${
        compact ? "h-9 w-9" : "h-11 w-11"
      }`}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export function Hud({
  hud,
  onPause,
  onSettings,
  onMute,
  onReload,
}: {
  hud: HudSnapshot;
  onPause?: () => void;
  onSettings?: () => void;
  onMute?: () => void;
  onReload?: () => void;
}) {
  if (hud.phase === "title" || hud.phase === "boot") return null;
  const heading = ((-hud.compass * 180) / Math.PI + 36000) % 360;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      {hud.hitFlash > 0 ? (
        <div className="absolute inset-0 bg-health/30" style={{ opacity: Math.min(0.5, hud.hitFlash) }} />
      ) : null}

      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 px-3 pt-[max(0.4rem,env(safe-area-inset-top))] desk:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{hud.objective}</p>
          {hud.boss ? (
            <div className="mt-1 max-w-[11rem] short:max-w-[9rem]">
              <Bar value={hud.boss.hp} max={hud.boss.max} color="bg-void" height="h-1.5" />
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <IconBtn label="Settings" onClick={onSettings} compact>
            <Settings className="size-3.5" />
          </IconBtn>
          <IconBtn label="Pause" onClick={onPause} compact>
            <Pause className="size-3.5" />
          </IconBtn>
        </div>
      </div>

      <div className="absolute left-0 right-0 top-0 hidden flex-col items-center gap-2 px-4 pt-4 desk:flex">
        <div className="relative h-5 w-64 overflow-hidden">
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

      <div className="absolute left-4 top-16 hidden w-44 flex-col gap-1 desk:flex">
        {(hud.loot ?? []).map((l) => (
          <p key={l.id} className={`font-display text-lg leading-tight ${rarityClass[l.rarity] ?? "text-fg"}`}>
            {l.name}
          </p>
        ))}
      </div>

      <div className="pointer-events-auto absolute right-4 top-4 hidden items-center gap-2 desk:flex">
        <div className="text-right font-mono text-[10px] uppercase tracking-widest text-muted">
          <p>Op {hud.level}</p>
          <p className="text-fg">{hud.gold} scrap</p>
          <p>{hud.kills} kills</p>
          <p>{formatTime(hud.missionTime)}</p>
        </div>
        <IconBtn label={hud.muted ? "Unmute" : "Mute"} onClick={onMute}>
          {hud.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </IconBtn>
        <IconBtn label="Settings" onClick={onSettings}>
          <Settings className="size-4" />
        </IconBtn>
        <IconBtn label="Pause" onClick={onPause}>
          <Pause className="size-4" />
        </IconBtn>
      </div>

      <div className="absolute bottom-[max(6.4rem,calc(env(safe-area-inset-bottom)+5.6rem))] left-[max(0.65rem,env(safe-area-inset-left))] w-[min(10.5rem,40vw)] desk:hidden short:bottom-auto short:left-[max(0.55rem,env(safe-area-inset-left))] short:top-[2.55rem] short:w-[min(8.75rem,26vw)]">
        <div className="mb-0.5 flex items-baseline justify-between gap-2">
          <span className="font-display text-lg font-semibold tabular-nums leading-none">{Math.ceil(hud.health)}</span>
          <button
            type="button"
            onClick={onReload}
            className={`pointer-events-auto font-display text-lg font-semibold tabular-nums leading-none ${
              hud.lowAmmo || hud.reloading ? "text-health" : "text-fg"
            }`}
          >
            {hud.reloading ? "…" : hud.ammo}
            <span className="ml-0.5 font-mono text-[10px] text-muted">/{hud.reserve}</span>
          </button>
        </div>
        <Bar value={hud.health} max={hud.maxHealth} color="bg-health" height="h-1.5" />
        <div className="mt-0.5">
          <Bar value={hud.shield} max={hud.maxShield} color="bg-shield" height="h-1" />
        </div>
        <div className="mt-0.5">
          <Bar value={hud.xp} max={hud.xpNeed} color="bg-accent" height="h-0.5" />
        </div>
      </div>

      <div className="absolute bottom-8 left-6 hidden w-[22rem] flex-col gap-3 desk:flex">
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

        <div className="flex gap-1">
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

      <div className="absolute bottom-28 left-1/2 hidden -translate-x-1/2 gap-2 desk:flex">
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

      <div className="pointer-events-none absolute left-1/2 top-[36%] -translate-x-1/2">
        {hud.hitMarker > 0 ? (
          <p className="font-display text-sm font-semibold text-void">HIT</p>
        ) : null}
        {hud.combo > 1 ? (
          <p className="mt-2 text-center font-display text-2xl font-semibold text-accent">{hud.combo}x</p>
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
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center desk:flex">
          <p className="rounded-md border border-border bg-surface/90 px-5 py-3 font-display text-xl font-semibold">
            Move the cursor to aim
          </p>
        </div>
      ) : null}

      <p className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-faint desk:block">
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
  onSettings,
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
  onSettings?: () => void;
}) {
  const acc = stats && stats.shots > 0 ? Math.round((stats.hits / stats.shots) * 100) : 0;
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/80 px-4 py-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="max-h-[min(36rem,88dvh)] w-full max-w-sm overflow-y-auto rounded-xl border border-border bg-surface p-5 short:max-h-[92dvh] short:max-w-2xl short:p-4 desk:p-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight desk:text-4xl">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted desk:mt-3">{body}</p>
        {stats ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs uppercase tracking-widest text-muted short:grid-cols-4 desk:mt-5">
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
        <div className="mt-5 flex flex-col gap-2.5 short:mt-4 desk:mt-8 desk:gap-3">
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
              className="flex h-11 w-full items-center justify-center rounded-lg border border-border bg-elevated font-display text-lg font-semibold text-fg"
            >
              {secondary}
            </button>
          ) : null}
          {onSettings ? (
            <button
              type="button"
              onClick={onSettings}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border font-display text-lg font-semibold text-fg"
            >
              <Settings className="size-4" />
              Settings
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
