import { useCallback, useRef } from "react";
import type { GameHandle } from "./engine";

type Props = {
  handle: GameHandle | null;
  visible: boolean;
  deckOnly?: boolean;
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
      className={`flex h-10 min-w-10 items-center justify-center rounded-md border px-2 font-display text-xs font-semibold uppercase tracking-wide short:h-8 short:min-w-8 short:px-1.5 short:text-[10px] ${
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

export function TouchControls({ handle, visible, deckOnly }: Props) {
  const moveId = useRef<number | null>(null);
  const lookId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });
  const knob = useRef<HTMLDivElement>(null);

  const onMoveDown = useCallback(
    (e: React.PointerEvent) => {
      if (!handle) return;
      e.preventDefault();
      e.stopPropagation();
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
        const max = deckOnly ? 76 : 68;
        const dead = 12;
        if (m < dead) {
          handle.setTouchMove(0, 0);
          handle.setAction("sprint", false);
          if (knob.current) knob.current.style.transform = "translate(0px, 0px)";
          return;
        }
        const s = m > max ? max / m : 1;
        const x = (dx * s) / max;
        const y = (-dy * s) / max;
        handle.setTouchMove(x, y);
        handle.setAction("sprint", !deckOnly && m > max * 0.92);
        if (knob.current) {
          knob.current.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
        }
      } else if (e.pointerId === lookId.current) {
        handle.setTouchLook(e.clientX - last.current.x, e.clientY - last.current.y);
        last.current = { x: e.clientX, y: e.clientY };
      }
    },
    [handle, deckOnly],
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
      {!deckOnly ? (
        <div
          className="pointer-events-auto absolute top-14 right-[7.5rem] bottom-44 left-[38%] short:top-12 short:right-[8.25rem] short:bottom-8 short:left-[40%]"
          onPointerDown={onLookDown}
          onPointerMove={onPtrMove}
          onPointerUp={endMove}
          onPointerCancel={endMove}
        />
      ) : null}

      <div
        className={`pointer-events-auto absolute left-[max(0.45rem,env(safe-area-inset-left))] z-30 flex items-center justify-center rounded-full border-2 border-accent/80 bg-surface/70 shadow-[0_0_0_1px_rgba(94,234,212,0.28)] ${
          deckOnly
            ? "bottom-[max(6.2rem,calc(env(safe-area-inset-bottom)+5.2rem))] h-[8.25rem] w-[8.25rem] short:h-[7.25rem] short:w-[7.25rem]"
            : "bottom-[max(0.55rem,calc(env(safe-area-inset-bottom)+0.25rem))] h-[7.75rem] w-[7.75rem] short:h-[6.85rem] short:w-[6.85rem]"
        }`}
        onPointerDown={onMoveDown}
        onPointerMove={onPtrMove}
        onPointerUp={endMove}
        onPointerCancel={endMove}
      >
        <div
          ref={knob}
          className={`rounded-full bg-accent ${deckOnly ? "h-14 w-14 short:h-12 short:w-12" : "h-[3.25rem] w-[3.25rem] short:h-12 short:w-12"}`}
        />
        <span className="pointer-events-none absolute -bottom-5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
          Walk
        </span>
      </div>

      {!deckOnly ? (
        <div className="pointer-events-auto absolute right-[max(0.4rem,env(safe-area-inset-right))] bottom-[max(0.5rem,calc(env(safe-area-inset-bottom)+0.25rem))] z-30 flex flex-col items-end gap-2 short:bottom-[max(0.4rem,env(safe-area-inset-bottom))] short:top-auto short:translate-y-0 short:gap-1.5">
          <div className="flex gap-1.5 short:flex-col">
            <Pill label="Frag" onDown={() => handle?.pulse("frag")} />
            <Pill label="Drive" onDown={() => handle?.pulse("overdrive")} />
            <Pill label="Cleave" onDown={() => handle?.pulse("cleave")} />
          </div>
          <div className="flex items-end gap-2 short:flex-col-reverse short:items-end">
            <Pill label="Reload" onDown={() => handle?.pulse("reload")} />
            <Pill label="Roll" onDown={() => handle?.pulse("dodge")} />
            <button
              type="button"
              className="flex h-[5.75rem] w-[5.75rem] items-center justify-center rounded-full bg-accent font-display text-xl font-semibold text-accent-fg shadow-[0_0_0_4px_rgba(232,93,4,0.28)] short:h-[5.15rem] short:w-[5.15rem] short:text-lg"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                handle?.setAction("fire", true);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                handle?.setAction("fire", false);
              }}
              onPointerCancel={() => handle?.setAction("fire", false)}
            >
              Fire
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
