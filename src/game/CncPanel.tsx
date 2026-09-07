import { RECIPES } from "./items";
import type { Rarity } from "./types";

const rarityClass: Record<Rarity, string> = {
  common: "text-fg",
  magic: "text-magic",
  rare: "text-rare",
  legendary: "text-legendary",
};

export function CncPanel({
  open,
  onClose,
  scrapBank,
  onCraft,
}: {
  open: boolean;
  onClose: () => void;
  scrapBank: number;
  onCraft: (id: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-3 py-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="max-h-[min(38rem,92dvh)] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-4 desk:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold">Hull CNC</h2>
            <p className="text-sm text-muted">Print weapons and armor from scrap recovered in the field.</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent">{scrapBank} scrap in the hopper</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted"
          >
            Close
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {RECIPES.map((r) => {
            const can = scrapBank >= r.cost;
            return (
              <button
                key={r.id}
                type="button"
                disabled={!can}
                onClick={() => onCraft(r.id)}
                className="rounded-lg border border-border bg-elevated px-3 py-3 text-left disabled:opacity-40"
              >
                <span className={`block font-display text-xl font-semibold ${rarityClass[r.output.rarity]}`}>
                  {r.name}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">
                  {r.output.kind} · {r.cost} scrap
                </span>
                <span className="mt-2 block font-display text-base text-fg">{can ? "Print" : "Need more scrap"}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
