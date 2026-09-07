import type { HudSnapshot } from "./types";

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
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const rarityClass: Record<string, string> = {
  common: "text-fg",
  magic: "text-magic",
  rare: "text-rare",
  legendary: "text-legendary",
};

export function Hud({ hud }: { hud: HudSnapshot }) {
  if (hud.phase === "title" || hud.phase === "boot") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      {hud.hitFlash > 0 ? (
        <div
          className="absolute inset-0 bg-health/25"
          style={{ opacity: Math.min(0.45, hud.hitFlash) }}
        />
      ) : null}

      <div className="absolute left-0 right-0 top-0 flex flex-col items-center gap-2 px-4 pt-4">
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

      <div className="absolute left-4 top-16 hidden w-40 flex-col gap-1 sm:flex">
        {hud.loot.map((l) => (
          <p key={l.id} className={`font-display text-lg leading-tight ${rarityClass[l.rarity]}`}>
            {l.name}
          </p>
        ))}
      </div>

      <div className="absolute bottom-6 left-4 right-4 flex flex-col gap-4 sm:bottom-8 sm:left-6 sm:right-auto sm:w-[22rem]">
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
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={`font-display text-xl font-semibold ${rarityClass[hud.rarity]}`}>{hud.weaponName}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {hud.reloading ? "Reloading" : hud.overdrive ? "Overdrive" : "Primary"}
            </p>
          </div>
          <p className="font-display text-4xl font-semibold tabular-nums leading-none">
            {hud.ammo}
            <span className="ml-1 font-mono text-sm text-muted">/{hud.reserve}</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-28 left-1/2 hidden -translate-x-1/2 gap-2 sm:flex">
        {hud.skills.map((s) => (
          <div
            key={s.id}
            className="flex h-14 w-16 flex-col items-center justify-center rounded-md border border-border bg-surface/80"
          >
            <span className="font-mono text-[10px] text-faint">{s.key}</span>
            <span className="font-display text-sm font-semibold">{s.ready ? s.name : s.cd.toFixed(1)}</span>
          </div>
        ))}
      </div>

      <div className="absolute right-4 top-4 text-right font-mono text-[10px] uppercase tracking-widest text-muted">
        <p>Op {hud.level}</p>
        <p className="text-fg">{hud.gold} scrap</p>
        <p>{hud.kills} kills</p>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-5 w-5">
          <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-fg/80" />
          <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-fg/80" />
          <span className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-fg/80" />
          <span className="absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-fg/80" />
        </div>
      </div>

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
}: {
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/80 px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8">
        <h2 className="font-display text-4xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-fg font-display text-xl font-semibold text-accent-fg transition-transform duration-150 active:scale-[0.98]"
        >
          {action}
        </button>
      </div>
    </div>
  );
}
