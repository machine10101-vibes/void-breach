import { isMissionUnlocked, MISSIONS } from "./campaign";
import type { MissionId } from "./types";

export function MissionPanel({
  open,
  onClose,
  selected,
  cleared,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selected: MissionId;
  cleared: MissionId[];
  onSelect: (id: MissionId) => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-3 py-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="max-h-[min(38rem,92dvh)] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-4 desk:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold">Ops holotable</h2>
            <p className="text-sm text-muted">Pick a district. Ember Rail and Null Spire unlock after the previous gate falls.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted"
          >
            Close
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {MISSIONS.map((m) => {
            const unlocked = isMissionUnlocked(m.id, cleared);
            const active = selected === m.id;
            const done = cleared.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  onSelect(m.id);
                  onClose();
                }}
                className={`rounded-lg border px-3 py-3 text-left disabled:opacity-40 ${
                  active ? "border-accent bg-elevated" : "border-border bg-elevated"
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-xl font-semibold text-fg">
                    {m.code} · {m.name}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
                    {!unlocked ? "Locked" : active ? "Selected" : done ? "Cleared" : "Ready"}
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{m.blurb}</span>
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-faint">{m.threat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
