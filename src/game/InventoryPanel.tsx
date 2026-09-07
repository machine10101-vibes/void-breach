import { RECIPES } from "./items";
import { ItemPreview } from "./ItemPreview";
import type { ArmorSlot, InvItem, Rarity } from "./types";

const rarityClass: Record<Rarity, string> = {
  common: "text-fg",
  magic: "text-magic",
  rare: "text-rare",
  legendary: "text-legendary",
};

function bonusLine(it: InvItem) {
  if (it.kind === "weapon") return `${it.dmg} dmg · ${it.mag} mag`;
  if (it.kind === "ammo") return `${it.qty ?? 0} rounds`;
  const bits = [
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
}: {
  open: boolean;
  onClose: () => void;
  inventory: InvItem[];
  equippedWeapon: string | null;
  equippedArmor: Record<ArmorSlot, string | null>;
  scrapBank: number;
  onEquip: (uid: string) => void;
}) {
  if (!open) return null;
  const weapons = inventory.filter((i) => i.kind === "weapon");
  const ammo = inventory.filter((i) => i.kind === "ammo");
  const armor = inventory.filter((i) => i.kind === "armor");
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-3 py-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="max-h-[min(40rem,92dvh)] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-surface p-4 desk:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-semibold">Inventory</h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
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
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent">Weapons</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {weapons.map((it) => (
              <ItemCard key={it.uid} item={it} equipped={it.uid === equippedWeapon} onEquip={() => onEquip(it.uid)} />
            ))}
          </div>
        </section>
        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent">Ammo</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ammo.length ? (
              ammo.map((it) => <ItemCard key={it.uid} item={it} equipped={false} />)
            ) : (
              <p className="font-mono text-xs text-muted">No spare packs. Drop Shade for rounds.</p>
            )}
          </div>
        </section>
        <section className="mt-5">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-accent">Armor</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {armor.map((it) => (
              <ItemCard
                key={it.uid}
                item={it}
                equipped={it.slot ? equippedArmor[it.slot] === it.uid : false}
                onEquip={() => onEquip(it.uid)}
              />
            ))}
          </div>
        </section>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
          Print more on the ship CNC · {RECIPES.length} schematics
        </p>
      </div>
    </div>
  );
}

function ItemCard({
  item,
  equipped,
  onEquip,
}: {
  item: InvItem;
  equipped: boolean;
  onEquip?: () => void;
}) {
  const clickable = Boolean(onEquip) && item.kind !== "ammo";
  const inner = (
    <>
      <ItemPreview item={item} />
      <span className="min-w-0 flex-1">
        <span className={`block font-display text-lg font-semibold ${rarityClass[item.rarity]}`}>{item.name}</span>
        <span className="block font-mono text-[10px] uppercase tracking-widest text-faint">{bonusLine(item)}</span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-muted">
          {item.kind === "ammo" ? "Reserve pack" : equipped ? "Equipped" : item.kind === "weapon" ? "Equip weapon" : `Equip ${item.slot}`}
        </span>
      </span>
    </>
  );
  if (!clickable) {
    return <div className="flex items-center gap-3 rounded-lg border border-border bg-elevated/60 px-3 py-2.5">{inner}</div>;
  }
  return (
    <button
      type="button"
      onClick={onEquip}
      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left ${
        equipped ? "border-accent bg-elevated" : "border-border bg-elevated/60"
      }`}
    >
      {inner}
    </button>
  );
}
