import { Volume2, VolumeX, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  muted: boolean;
  onMute: () => void;
  sensitivity: number;
  onSensitivity: (v: number) => void;
  invertLookX: boolean;
  invertLookY: boolean;
  onInvertLookX: (v: boolean) => void;
  onInvertLookY: (v: boolean) => void;
};

export function SettingsSheet({
  open,
  onClose,
  muted,
  onMute,
  sensitivity,
  onSensitivity,
  invertLookX,
  invertLookY,
  onInvertLookX,
  onInvertLookY,
}: Props) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-4 py-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="max-h-[min(34rem,90dvh)] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-5 short:max-w-2xl short:p-4 desk:p-7">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-elevated"
            aria-label="Close settings"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">Aim, look, and audio. These stay on this device.</p>

        <div className="mt-5 grid gap-4 short:grid-cols-2">
          <label className="block">
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

          <div className="flex flex-col gap-2">
            <Toggle
              checked={invertLookX}
              onChange={onInvertLookX}
              label="Invert look left / right"
              hint="Swap horizontal aim"
            />
            <Toggle
              checked={invertLookY}
              onChange={onInvertLookY}
              label="Invert look up / down"
              hint="Swap vertical aim"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onMute}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border font-mono text-xs uppercase tracking-widest text-muted"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-elevated px-3 py-2.5 text-left"
      aria-pressed={checked}
    >
      <span>
        <span className="block font-display text-base font-semibold">{label}</span>
        <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">{hint}</span>
      </span>
      <span className={`h-6 w-11 rounded-full p-0.5 ${checked ? "bg-accent" : "bg-border"}`}>
        <span className={`block h-5 w-5 rounded-full bg-fg transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}
