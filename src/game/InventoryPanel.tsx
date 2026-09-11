import { armorStyle } from "./armorKits";
import { RECIPES, scrapValue } from "./items";
import { ItemPreview } from "./ItemPreview";
import type { ArmorSlot, InvItem, Rarity } from "./types";

const rarityClass: Record<Rarity, string> = {
  common: "text-fg",
  magic: "text-magic",
  rare: "text-rare",
  legendary: "text-legendary",
};

const ARMOR_SLOTS: { slot: ArmorSlot; label: string }[] = [
  { slot: "helm", label: "Helm" },
  { slot: "chest", label: "Chest" },
  { slot: "arms", label: "Arms" },
  { slot: "legs", label: "Legs" },
];

function bonusLine(it: InvItem) {
  if (it.kind === "weapon") return `${it.dmg} dmg · ${it.mag} mag`;
  if (it.kind === "ammo") return `${it.qty ?? 0} rounds`;
  const bits = [
    `${armorStyle(it.name)} mesh`,
    it.hpBonus ? `+${it.hpBonus} HP` : "",
    it.shieldBonus ? `+${it.shieldBonus} shield` : "",
    it.dmgBonus ? `+${it.dmgBonus}% dmg` : "",
  ].filter(Boolean);
  return bits.join(" · ") || it.slot;
}

export function InventoryPanel({
  open,
  onClose,
  inventory,
  equippedWeapon,
  equippedArmor,
  scrapBank,
  onEquip,
  onScrap,
}: {
  open: boolean;
  onClose: () => void;
  inventory: InvItem[];
  equippedWeapon: string | null;
  equippedArmor: Record<ArmorSlot, string | null>;
  scrapBank: number;
  onEquip: (uid: string) => void;
  onScrap: (uid: string) => void;
}) {
  if (!open) return null;
  const wornWeapon = inventory.find((i) => i.uid === equippedWeapon) ?? null;
  const wornArmor = (slot: ArmorSlot) => inventory.find((i) => i.uid === equippedArmor[slot]) ?? null;
  const wornIds = new Set<string>([equippedWeapon, ...Object.values(equippedArmor)].filter(Boolean) as string[]);
  const stashWeapons = inventory.filter((i) => i.kind === "weapon" && !wornIds.has(i.uid));
  const stashArmor = inventory.filter((i) => i.kind === "armor" && !wornIds.has(i.uid));
  const ammo = inventory.filter((i) => i.kind === "ammo");
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-3 py-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="max-h-[min(42rem,92dvh)] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-surface p-4 desk:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold">Loadout</h2>
            <p className="text-sm text-muted">Wear plates or stow them. The operator mesh wears the same kit you see here.</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-faint">
              Bank {scrapBank} scrap · {inventory.length} items
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-elevated px-3 py-2 font-mono text-xs uppercase tracking-widest text-muted"
          >
            Close
          </button>
        </div>

        <section className="mt-4">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent">On the body</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <LoadoutSlot
              label="Weapon"
              item={wornWeapon}
              empty="Holstered — pick a rifle from stash"
              action={wornWeapon ? "Stow rifle" : undefined}
              onAction={wornWeapon ? () => onEquip(wornWeapon.uid) : undefined}
            />
            {ARMOR_SLOTS.map(({ slot, label }) => {
              const piece = wornArmor(slot);
              return (
                <LoadoutSlot
                  key={slot}
                  label={label}
                  item={piece}
                  empty={`Empty ${slot} — equip from stash`}
                  action={piece ? "Stow" : undefined}
                  onAction={piece ? () => onEquip(piece.uid) : undefined}
                />
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent">Stash</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {stashWeapons.length || stashArmor.length ? (
              [...stashWeapons, ...stashArmor].map((it) => (
                <ItemCard
                  key={it.uid}
                  item={it}
                  equipped={false}
                  onEquip={() => onEquip(it.uid)}
                  onScrap={() => onScrap(it.uid)}
                />
              ))
            ) : (
              <p className="font-mono text-xs text-muted">Nothing stowed. Print more on the hull CNC.</p>
            )}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent">Ammo</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ammo.length ? (
              ammo.map((it) => <ItemCard key={it.uid} item={it} equipped={false} onScrap={() => onScrap(it.uid)} />)
            ) : (
              <p className="font-mono text-xs text-muted">No spare packs. Drop Shade for rounds.</p>
            )}
          </div>
        </section>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
          Print more on the ship CNC · {RECIPES.length} schematics
        </p>
      </div>
    </div>
  );
}

function LoadoutSlot({
  label,
  item,
  empty,
  action,
  onAction,
}: {
  label: string;
  item: InvItem | null;
  empty: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${item ? "border-accent bg-elevated" : "border-border bg-elevated/40"}`}>
      {item ? <ItemPreview item={item} /> : <div className="h-16 w-20 shrink-0 rounded-md border border-dashed border-border" />}
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">{label}</p>
        {item ? (
          <>
            <p className={`font-display text-lg font-semibold ${rarityClass[item.rarity]}`}>{item.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">{bonusLine(item)}</p>
          </>
        ) : (
          <p className="font-mono text-xs text-muted">{empty}</p>
        )}
      </div>
      {action && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-md border border-border bg-bg/50 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

function ItemCard({
  item,
  equipped,
  onEquip,
  onScrap,
}: {
  item: InvItem;
  equipped: boolean;
  onEquip?: () => void;
  onScrap?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
        equipped ? "border-accent bg-elevated" : "border-border bg-elevated/60"
      }`}
    >
      <ItemPreview item={item} />
      {onEquip && item.kind !== "ammo" ? (
        <button type="button" onClick={onEquip} className="min-w-0 flex-1 text-left">
          <span className={`block font-display text-lg font-semibold ${rarityClass[item.rarity]}`}>{item.name}</span>
          <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">{bonusLine(item)}</span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-muted">
            {item.kind === "weapon" ? "Equip weapon" : `Equip ${item.slot}`}
          </span>
        </button>
      ) : (
        <span className="min-w-0 flex-1">
          <span className={`block font-display text-lg font-semibold ${rarityClass[item.rarity]}`}>{item.name}</span>
          <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">{bonusLine(item)}</span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-muted">Reserve pack</span>
        </span>
      )}
      {onScrap ? (
        <button
          type="button"
          onClick={onScrap}
          className="shrink-0 rounded-md border border-border bg-bg/50 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted"
        >
          Scrap {scrapValue(item)}
        </button>
      ) : null}
    </div>
  );
}
