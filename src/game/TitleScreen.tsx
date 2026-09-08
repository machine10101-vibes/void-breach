import { useState } from "react";
import { Download, Play, Settings, Smartphone } from "lucide-react";
import { ApkPinSheet } from "./ApkPinSheet";
import { assetUrl } from "@/lib/asset-url";
import type { BestRun } from "./types";

type Props = {
  onDeploy: () => void;
  onBoardShip: () => void;
  onSettings: () => void;
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

export function TitleScreen({ onDeploy, onBoardShip, onSettings, onInstall, canInstall, apkUrl, best }: Props) {
  const [apkOpen, setApkOpen] = useState(false);
  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-transparent text-fg">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-55"
        style={{ backgroundImage: `url(${assetUrl("art/title.jpg")})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-bg/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end gap-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] short:flex-row short:items-end short:justify-between short:gap-6 short:px-5 desk:justify-center desk:px-12 desk:pb-16">
        <div className="min-w-0 short:max-w-[55%]">
          <p className="font-mono text-[10px] tracking-[0.28em] text-accent uppercase desk:text-xs">
            Chimera Protocol · Earth 2172
          </p>
          <h1 className="mt-1 font-display text-[2.6rem] font-extrabold leading-[0.88] tracking-tight text-fg short:text-5xl desk:mt-3 desk:text-8xl">
            <span className="block">VOID</span>
            <span className="block">BREACH</span>
          </h1>
          <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-muted desk:mt-5 desk:block desk:text-base">
            Top-down survival shooter. Suit up, hold the ash streets, vacuum loot
            off the Shade, and burn the Harbinger at Ashfall Gate.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-faint desk:text-xs">
            Level 01 · Ashfall Gate
          </p>

          {best && best.runs > 0 ? (
            <p className="mt-3 hidden font-mono text-[10px] uppercase tracking-widest text-muted desk:block">
              Best · {best.kills} kills · {best.gold} scrap · {formatTime(best.time)} · {best.runs} runs
            </p>
          ) : null}

          <dl className="mt-10 hidden max-w-xl grid-cols-3 gap-x-8 gap-y-3 text-sm text-muted desk:grid">
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
              <dd>1–8 · scroll</dd>
            </div>
          </dl>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 short:w-auto short:min-w-[11rem] short:max-w-[16rem] desk:mt-2 desk:w-full desk:max-w-lg desk:flex-row desk:flex-wrap desk:gap-3">
          <button
            type="button"
            onClick={onDeploy}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-fg px-8 font-display text-xl font-semibold tracking-wide text-accent-fg transition-transform duration-150 hover:bg-accent hover:text-accent-fg active:scale-[0.98] short:h-11"
          >
            <Play className="size-4" strokeWidth={2.2} />
            Deploy
          </button>
          <button
            type="button"
            onClick={onBoardShip}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 font-display text-lg font-semibold text-fg transition-opacity duration-150 hover:opacity-90 desk:h-12"
          >
            Board ship
          </button>
          <button
            type="button"
            onClick={onSettings}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 font-display text-lg font-semibold text-fg transition-opacity duration-150 hover:opacity-90 desk:h-12"
          >
            <Settings className="size-4" />
            Settings
          </button>
          {canInstall ? (
            <button
              type="button"
              onClick={onInstall}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 font-display text-lg font-semibold text-fg transition-opacity duration-150 hover:opacity-90 short:h-10 desk:h-12"
            >
              <Smartphone className="size-4" />
              Install on phone
            </button>
          ) : null}
          {apkUrl ? (
            <button
              type="button"
              onClick={() => setApkOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted short:h-9 desk:h-12 desk:rounded-lg desk:border desk:border-border desk:bg-surface desk:px-6 desk:font-display desk:text-lg desk:font-semibold desk:normal-case desk:tracking-normal desk:text-fg"
            >
              <Download className="size-3.5 desk:size-4" />
              Android APK
            </button>
          ) : null}
        </div>
      </div>

      <p className="relative z-10 px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] font-mono text-[10px] uppercase tracking-[0.18em] text-faint short:hidden desk:hidden">
        Left stick move · right drag aim · fire
      </p>

      {apkUrl ? <ApkPinSheet open={apkOpen} apkUrl={apkUrl} onClose={() => setApkOpen(false)} /> : null}
    </div>
  );
}
