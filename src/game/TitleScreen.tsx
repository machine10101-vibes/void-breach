import { Download, Play, Smartphone } from "lucide-react";
import type { BestRun } from "./types";

type Props = {
  onDeploy: () => void;
  onInstall: () => void;
  canInstall: boolean;
  apkUrl?: string;
  best?: BestRun | null;
};

function formatTime(t: number) {
  if (!t) return "—";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TitleScreen({ onDeploy, onInstall, canInstall, apkUrl, best }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-transparent text-fg">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-55"
        style={{ backgroundImage: "url(/art/title.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-6 pb-10 pt-16 sm:justify-center sm:px-12 sm:pb-16">
        <p className="font-mono text-xs tracking-[0.28em] text-accent uppercase">
          Chimera Protocol · Earth 2172
        </p>
        <h1 className="mt-3 font-display text-5xl font-extrabold leading-[0.88] tracking-tight text-fg sm:text-8xl">
          <span className="block">VOID</span>
          <span className="block">BREACH</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          Top-down survival shooter. Suit up, hold the ash streets, vacuum loot
          off the Shade, and burn the Harbinger at Ashfall Gate.
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-faint">
          Level 01 · Ashfall Gate
        </p>

        {best && best.runs > 0 ? (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted">
            Best · {best.kills} kills · {best.gold} scrap · {formatTime(best.time)} · {best.runs} runs
          </p>
        ) : null}

        <div className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onDeploy}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-fg px-8 font-display text-xl font-semibold tracking-wide text-accent-fg transition-transform duration-150 hover:bg-accent hover:text-accent-fg active:scale-[0.98]"
          >
            <Play className="size-4" strokeWidth={2.2} />
            Deploy
          </button>
          {canInstall ? (
            <button
              type="button"
              onClick={onInstall}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 font-display text-lg font-semibold text-fg transition-opacity duration-150 hover:opacity-90"
            >
              <Smartphone className="size-4" />
              Install on phone
            </button>
          ) : null}
          {apkUrl ? (
            <a
              href={apkUrl}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 font-display text-lg font-semibold text-fg"
            >
              <Download className="size-4" />
              Android APK
            </a>
          ) : null}
        </div>

        <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-8 gap-y-3 text-sm text-muted sm:grid-cols-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">Move</dt>
            <dd>WASD / left stick</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">Aim / fire</dt>
            <dd>Mouse cursor · click / RT</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">Zoom</dt>
            <dd>RMB / LT</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">Dodge</dt>
            <dd>Space</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">Skills</dt>
            <dd>Q frag · E drive · F cleave</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">Guns</dt>
            <dd>1–3 · scroll</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
