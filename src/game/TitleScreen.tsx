import { Download, Play, Smartphone } from "lucide-react";

type Props = {
  onDeploy: () => void;
  onInstall: () => void;
  canInstall: boolean;
  apkUrl?: string;
};

export function TitleScreen({ onDeploy, onInstall, canInstall, apkUrl }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-bg text-fg">
      <img
        src="/art/title.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/70 to-bg/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end px-6 pb-10 pt-16 sm:justify-center sm:px-12 sm:pb-16">
        <p className="font-mono text-xs tracking-[0.28em] text-accent uppercase">
          Vanguard Protocol · Earth 2172
        </p>
        <h1 className="mt-3 font-display text-6xl font-extrabold leading-[0.85] tracking-tight text-fg sm:text-8xl">
          VOID
          <br />
          BREACH
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          The Shade opened a gate under New Meridian. You are Vanguard-7. Clear
          Ashfall Gate, loot what the dead dropped, and kill the Harbinger.
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-faint">
          Level 01 · Ashfall Gate
        </p>

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
            <dd>Mouse · click / RT</dd>
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
            <dd>1 AR · 2 shotgun · 3 SMG</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-widest text-faint">Sprint</dt>
            <dd>Shift</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
