import { useEffect, useRef, useState } from "react";
import type { GameHandle } from "./engine";
import { Hud, PauseOverlay } from "./Hud";
import { TitleScreen } from "./TitleScreen";
import { TouchControls } from "./TouchControls";
import type { HudSnapshot, Phase } from "./types";

const bootHud: HudSnapshot = {
  phase: "boot",
  health: 200,
  maxHealth: 200,
  shield: 110,
  maxShield: 110,
  ammo: 32,
  magSize: 32,
  reserve: 160,
  weapon: "ar",
  weaponName: "Vanguard ARX",
  rarity: "common",
  gold: 0,
  kills: 0,
  objective: "",
  hint: "",
  skills: [],
  loot: [],
  reloading: false,
  overdrive: false,
  sprinting: false,
  boss: null,
  hitFlash: 0,
  xp: 0,
  level: 1,
};

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(bootHud);
  const [handle, setHandle] = useState<GameHandle | null>(null);
  const [installEvt, setInstallEvt] = useState<{ prompt: () => Promise<void> } | null>(null);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    let local: GameHandle | undefined;
    void import("./engine").then(({ mountGame }) => {
      if (dead || !canvasRef.current) return;
      local = mountGame(canvasRef.current, (next) => {
        setHud(next);
      });
      handleRef.current = local;
      setHandle(local);
      const qa = new URLSearchParams(window.location.search).has("qa");
      if (qa) local.startMission();
    });
    return () => {
      dead = true;
      local?.destroy();
      handleRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onInstall = (e: Event) => {
      e.preventDefault();
      const ev = e as Event & { prompt: () => Promise<void> };
      setInstallEvt({ prompt: () => ev.prompt() });
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  const phase: Phase = hud.phase;
  const playing = phase === "playing";

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
      {phase === "title" || phase === "boot" ? (
        <TitleScreen
          onDeploy={() => handleRef.current?.startMission()}
          canInstall={Boolean(installEvt)}
          onInstall={() => void installEvt?.prompt()}
          apkUrl="https://github.com/machine10101-vibes/void-breach/releases/latest"
        />
      ) : (
        <Hud hud={hud} />
      )}
      <TouchControls handle={handle} visible={playing && coarse} />
      {phase === "paused" ? (
        <PauseOverlay
          title="Hold"
          body="Ashfall Gate is still live. Resume to keep the breach."
          action="Resume"
          onAction={() => handleRef.current?.resume()}
        />
      ) : null}
      {phase === "dead" ? (
        <PauseOverlay
          title="Down"
          body="The Shade overran the drop. Redeploy and push the gate again."
          action="Redeploy"
          onAction={() => window.location.reload()}
        />
      ) : null}
      {phase === "victory" ? (
        <PauseOverlay
          title="Gate sealed"
          body="Harbinger is ash. First breach complete — more sectors when you are ready."
          action="Run it back"
          onAction={() => window.location.reload()}
        />
      ) : null}
    </main>
  );
}
