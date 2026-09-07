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

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:justify-center sm:px-12 sm:pb-16">
        <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase sm:text-xs">
          Chimera Protocol · Earth 2172
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold leading-[0.88] tracking-tight text-fg sm:mt-3 sm:text-8xl">
          <span className="block">VOID</span>
          <span className="block">BREACH</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:mt-5 sm:text-base">
          Top-down survival shooter. Suit up, hold the ash streets, vacuum loot
          off the Shade, and burn the Harbinger at Ashfall Gate.
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint sm:text-xs">
          Level 01 · Ashfall Gate
        </p>

        {best && best.runs > 0 ? (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted">
            Best · {best.kills} kills · {best.gold} scrap · {formatTime(best.time)} · {best.runs} runs
          </p>
        ) : null}

        <div className="mt-6 flex max-w-lg flex-col gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 font-display text-lg font-semibold text-fg transition-opacity duration-150 hover:opacity-90 sm:h-12"
            >
              <Smartphone className="size-4" />
              Install on phone
            </button>
          ) : null}
          {apkUrl ? (
            <a
              href={apkUrl}
              className="inline-flex h-10 items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted sm:h-12 sm:rounded-lg sm:border sm:border-border sm:bg-surface sm:px-6 sm:font-display sm:text-lg sm:font-semibold sm:normal-case sm:tracking-normal sm:text-fg"
            >
              <Download className="size-3.5 sm:size-4" />
              Android APK
            </a>
          ) : null}
        </div>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint sm:hidden">
          Left stick move · right drag aim · fire
        </p>

        <dl className="mt-10 hidden max-w-xl grid-cols-2 gap-x-8 gap-y-3 text-sm text-muted sm:grid sm:grid-cols-3">
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
