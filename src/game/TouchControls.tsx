import { useCallback, useRef } from "react";
import type { GameHandle } from "./engine";

type Props = {
  handle: GameHandle | null;
  visible: boolean;
};

function Pill({
  label,
  ready = true,
  onDown,
  onUp,
}: {
  label: string;
  ready?: boolean;
  onDown: () => void;
  onUp?: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex h-10 min-w-10 items-center justify-center rounded-md border px-2 font-display text-xs font-semibold uppercase tracking-wide ${
        ready ? "border-border bg-surface/55 text-fg" : "border-border/60 bg-surface/30 text-faint"
      }`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        onDown();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onUp?.();
      }}
      onPointerCancel={onUp}
    >
      {label}
    </button>
  );
}

export function TouchControls({ handle, visible }: Props) {
  const moveId = useRef<number | null>(null);
  const lookId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });
  const knob = useRef<HTMLDivElement>(null);

  const onMoveDown = useCallback(
    (e: React.PointerEvent) => {
      if (!handle) return;
      moveId.current = e.pointerId;
      origin.current = { x: e.clientX, y: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [handle],
  );

  const onLookDown = useCallback((e: React.PointerEvent) => {
    lookId.current = e.pointerId;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPtrMove = useCallback(
    (e: React.PointerEvent) => {
      if (!handle) return;
      if (e.pointerId === moveId.current) {
        const dx = e.clientX - origin.current.x;
        const dy = e.clientY - origin.current.y;
        const m = Math.hypot(dx, dy);
        const max = 36;
        const s = m > max ? max / m : 1;
        const x = (dx * s) / max;
        const y = (-dy * s) / max;
        handle.setTouchMove(x, y);
        handle.setAction("sprint", m > max * 0.92);
        if (knob.current) {
          knob.current.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
        }
      } else if (e.pointerId === lookId.current) {
        handle.setTouchLook(e.clientX - last.current.x, e.clientY - last.current.y);
        last.current = { x: e.clientX, y: e.clientY };
      }
    },
    [handle],
  );

  const endMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId === moveId.current) {
        moveId.current = null;
        handle?.setTouchMove(0, 0);
        handle?.setAction("sprint", false);
        if (knob.current) knob.current.style.transform = "translate(0,0)";
      }
      if (e.pointerId === lookId.current) lookId.current = null;
    },
    [handle],
  );

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div
        className="pointer-events-auto absolute top-12 right-0 bottom-36 left-[30%]"
        onPointerDown={onLookDown}
        onPointerMove={onPtrMove}
        onPointerUp={endMove}
        onPointerCancel={endMove}
      />

      <div
        className="pointer-events-auto absolute bottom-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.4rem))] left-[max(0.65rem,env(safe-area-inset-left))] flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full border border-border/70 bg-surface/25"
        onPointerDown={onMoveDown}
        onPointerMove={onPtrMove}
        onPointerUp={endMove}
        onPointerCancel={endMove}
      >
        <div ref={knob} className="h-9 w-9 rounded-full bg-fg/35" />
      </div>

      <div className="pointer-events-auto absolute right-[max(0.55rem,env(safe-area-inset-right))] bottom-[max(0.7rem,calc(env(safe-area-inset-bottom)+0.35rem))] flex flex-col items-end gap-1.5">
        <div className="flex gap-1">
          <Pill label="Frag" onDown={() => handle?.pulse("frag")} />
          <Pill label="Drive" onDown={() => handle?.pulse("overdrive")} />
          <Pill label="Cleave" onDown={() => handle?.pulse("cleave")} />
        </div>
        <div className="flex items-end gap-1.5">
          <Pill label="Roll" onDown={() => handle?.pulse("dodge")} />
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-accent-fg"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handle?.setAction("fire", true);
            }}
            onPointerUp={() => handle?.setAction("fire", false)}
            onPointerCancel={() => handle?.setAction("fire", false)}
          >
            Fire
          </button>
        </div>
      </div>
    </div>
  );
}
