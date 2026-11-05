import { isMissionUnlocked, MISSIONS } from "./campaign";
import { nextSkillCost, SKILL_ORDER, SKILL_TRACK } from "./skills";
import type { MissionId, SkillId } from "./types";

export function MissionPanel({
  open,
  onClose,
  selected,
  cleared,
  onSelect,
  scrapBank,
  skillRanks,
  onDrill,
}: {
  open: boolean;
  onClose: () => void;
  selected: MissionId;
  cleared: MissionId[];
  onSelect: (id: MissionId) => void;
  scrapBank: number;
  skillRanks: Record<SkillId, number>;
  onDrill: (id: SkillId) => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-3 py-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="max-h-[min(38rem,92dvh)] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-4 desk:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold">Ops holotable</h2>
            <p className="text-sm text-muted">Each district is longer and meaner. Higher gates drop better kits.</p>
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
                <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-faint">
                  {m.length} · {m.threat}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-accent">Loot · {m.loot}</span>
              </button>
            );
          })}
        </div>
        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent">Chimera drills</h3>
          <p className="mt-1 text-sm text-muted">Spend banked scrap. Ranks stay on the suit between drops. {scrapBank} scrap in the hopper.</p>
          <div className="mt-3 flex flex-col gap-2">
            {SKILL_ORDER.map((id) => {
              const track = SKILL_TRACK[id];
              const rank = skillRanks[id] ?? 0;
              const cost = nextSkillCost(id, rank);
              const can = cost != null && scrapBank >= cost;
              return (
                <div key={id} className="rounded-lg border border-border bg-elevated px-3 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-display text-lg font-semibold">{track.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
                      {[0, 1, 2].map((i) => (i < rank ? "●" : "○")).join(" ")}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{track.blurb}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-accent">
                    {cost == null ? "Maxed" : track.lines[rank]}
                  </p>
                  <button
                    type="button"
                    disabled={!can}
                    onClick={() => onDrill(id)}
                    className="mt-2 rounded-md border border-border bg-bg/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-fg disabled:opacity-40"
                  >
                    {cost == null ? "Logged" : can ? `Drill ${rank + 1} · ${cost} scrap` : `Need ${cost} scrap`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
