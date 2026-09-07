import { useCallback, useRef } from "react";
import type { GameHandle } from "./engine";

type Props = {
  handle: GameHandle | null;
  visible: boolean;
};

function ActionBtn({
  label,
  sub,
  onDown,
  onUp,
}: {
  label: string;
  sub?: string;
  onDown: () => void;
  onUp?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-border bg-surface/80 font-display text-sm font-semibold text-fg backdrop-blur-sm"
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
      {sub ? <span className="font-mono text-[9px] text-faint">{sub}</span> : null}
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
        const max = 48;
        const s = m > max ? max / m : 1;
        const x = (dx * s) / max;
        const y = (-dy * s) / max;
        handle.setTouchMove(x, y);
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
        if (knob.current) knob.current.style.transform = "translate(0,0)";
      }
      if (e.pointerId === lookId.current) lookId.current = null;
    },
    [handle],
  );

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10">
      <div
        className="absolute bottom-24 left-6 flex h-28 w-28 items-center justify-center rounded-full border border-border bg-surface/40"
        onPointerDown={onMoveDown}
        onPointerMove={onPtrMove}
        onPointerUp={endMove}
        onPointerCancel={endMove}
      >
        <div ref={knob} className="h-14 w-14 rounded-full bg-fg/30" />
      </div>

      <div
        className="absolute inset-y-0 right-0 w-[58%]"
        onPointerDown={onLookDown}
        onPointerMove={onPtrMove}
        onPointerUp={endMove}
        onPointerCancel={endMove}
      />

      <div className="absolute bottom-24 right-4 flex flex-col items-end gap-3">
        <div className="flex gap-2">
          <ActionBtn label="Q" sub="Frag" onDown={() => handle?.pulse("frag")} />
          <ActionBtn label="E" sub="Drive" onDown={() => handle?.pulse("overdrive")} />
          <ActionBtn label="F" sub="Cleave" onDown={() => handle?.pulse("cleave")} />
        </div>
        <div className="flex gap-2">
          <ActionBtn label="R" onDown={() => handle?.pulse("reload")} />
          <ActionBtn
            label="Aim"
            onDown={() => handle?.setAction("ads", true)}
            onUp={() => handle?.setAction("ads", false)}
          />
          <ActionBtn
            label="Run"
            onDown={() => handle?.setAction("sprint", true)}
            onUp={() => handle?.setAction("sprint", false)}
          />
          <ActionBtn label="Roll" onDown={() => handle?.pulse("dodge")} />
        </div>
        <button
          type="button"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-accent font-display text-lg font-semibold text-accent-fg"
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
  );
}
