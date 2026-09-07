import { useEffect, useRef, useState } from "react";
import type { GameHandle } from "./engine";
import { Hud, PauseOverlay } from "./Hud";
import { isTouchUi, TOUCH_UI_QUERY } from "./layout";
import { SettingsSheet } from "./SettingsSheet";
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
  ads: false,
  boss: null,
  hitFlash: 0,
  xp: 0,
  xpNeed: 200,
  level: 1,
  combo: 0,
  missionTime: 0,
  hitMarker: 0,
  floating: [],
  slots: [],
  lockLost: false,
  compass: 0,
  muted: false,
  lowAmmo: false,
  wave: "",
  stats: { time: 0, kills: 0, gold: 0, xp: 0, shots: 0, hits: 0, damageDealt: 0 },
  best: null,
  sensitivity: 1,
  invertLookX: false,
  invertLookY: false,
};

function useTouchUi() {
  const [on, setOn] = useState(() => isTouchUi());
  useEffect(() => {
    const mq = window.matchMedia(TOUCH_UI_QUERY);
    const apply = () => setOn(isTouchUi());
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);
  return on;
}

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<GameHandle | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(bootHud);
  const [handle, setHandle] = useState<GameHandle | null>(null);
  const [installEvt, setInstallEvt] = useState<{ prompt: () => Promise<void> } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const touchUi = useTouchUi();

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

  const openSettings = (pauseFirst: boolean) => {
    if (pauseFirst && phase === "playing") handleRef.current?.pause();
    setSettingsOpen(true);
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />
      {phase === "title" || phase === "boot" ? (
        <TitleScreen
          onDeploy={() => handleRef.current?.startMission()}
          onSettings={() => openSettings(false)}
          canInstall={Boolean(installEvt)}
          onInstall={() => void installEvt?.prompt()}
          apkUrl="https://github.com/machine10101-vibes/void-breach/releases/latest"
          best={hud.best}
        />
      ) : (
        <Hud
          hud={hud}
          onPause={() => handleRef.current?.pause()}
          onSettings={() => openSettings(true)}
          onMute={() => handleRef.current?.setMuted(!hud.muted)}
          onReload={() => handleRef.current?.pulse("reload")}
        />
      )}
      <TouchControls handle={handle} visible={playing && touchUi && !settingsOpen} />
      {phase === "paused" && !settingsOpen ? (
        <PauseOverlay
          title="Hold"
          body="Ashfall Gate is still live. Resume to keep the breach."
          action="Resume"
          onAction={() => handleRef.current?.resume()}
          secondary="Restart run"
          onSecondary={() => handleRef.current?.startMission()}
          muted={hud.muted}
          onMute={() => handleRef.current?.setMuted(!hud.muted)}
          onSettings={() => setSettingsOpen(true)}
          stats={hud.stats}
        />
      ) : null}
      {phase === "dead" ? (
        <PauseOverlay
          title="Down"
          body="The Shade overran the drop. Redeploy and push the gate again."
          action="Redeploy"
          onAction={() => handleRef.current?.startMission()}
          onSettings={() => setSettingsOpen(true)}
          stats={hud.stats}
        />
      ) : null}
      {phase === "victory" ? (
        <PauseOverlay
          title="Gate sealed"
          body="Harbinger is ash. First breach complete — run it again cleaner, faster."
          action="Run it back"
          onAction={() => handleRef.current?.startMission()}
          onSettings={() => setSettingsOpen(true)}
          stats={hud.stats}
        />
      ) : null}
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        muted={hud.muted}
        onMute={() => handleRef.current?.setMuted(!hud.muted)}
        sensitivity={hud.sensitivity}
        onSensitivity={(v) => handleRef.current?.setSensitivity(v)}
        invertLookX={hud.invertLookX}
        invertLookY={hud.invertLookY}
        onInvertLookX={(v) => handleRef.current?.setInvertLookX(v)}
        onInvertLookY={(v) => handleRef.current?.setInvertLookY(v)}
      />
    </main>
  );
}
