import { useEffect, useState } from "react";
import { Delete, Download, X } from "lucide-react";

export const APK_UNLOCK_PIN = "431431";
const UNLOCK_KEY = "void-breach-apk-ok";

type Props = {
  open: boolean;
  apkUrl: string;
  onClose: () => void;
};

function isUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function persistUnlock() {
  try {
    sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* ignore */
  }
}

function startDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener noreferrer";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function ApkPinSheet({ open, apkUrl, onClose }: Props) {
  const [digits, setDigits] = useState("");
  const [denied, setDenied] = useState(false);
  const [unlocked, setUnlocked] = useState(isUnlocked);

  useEffect(() => {
    if (!open) {
      setDigits("");
      setDenied(false);
      setUnlocked(isUnlocked());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        onClose();
        return;
      }
      if (unlocked || denied) return;
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        setDigits((d) => (d.length >= APK_UNLOCK_PIN.length ? d : d + e.key));
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        setDenied(false);
        setDigits((d) => d.slice(0, -1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, unlocked, denied, onClose]);

  useEffect(() => {
    if (!open || unlocked || digits.length !== APK_UNLOCK_PIN.length) return;
    if (digits === APK_UNLOCK_PIN) {
      persistUnlock();
      setUnlocked(true);
      startDownload(apkUrl);
      return;
    }
    setDenied(true);
    const t = window.setTimeout(() => {
      setDigits("");
      setDenied(false);
    }, 520);
    return () => window.clearTimeout(t);
  }, [digits, open, unlocked, apkUrl]);

  if (!open) return null;

  const push = (n: string) => {
    if (unlocked || denied) return;
    setDigits((d) => (d.length >= APK_UNLOCK_PIN.length ? d : d + n));
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-4 py-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 short:max-w-xl short:p-4 desk:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">Restricted drop</p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">Android APK</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-elevated"
            aria-label="Close APK unlock"
          >
            <X className="size-4" />
          </button>
        </div>

        {unlocked ? (
          <>
            <p className="mt-3 text-sm text-muted">Pin accepted. The sideload package is unlocked for this session.</p>
            <button
              type="button"
              onClick={() => startDownload(apkUrl)}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-fg font-display text-xl font-semibold text-accent-fg"
            >
              <Download className="size-4" />
              Download APK
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted">Enter the six-digit pin to unlock the Android build.</p>
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: APK_UNLOCK_PIN.length }, (_, i) => (
                <span
                  key={i}
                  className={`flex h-11 w-9 items-center justify-center rounded-md border font-display text-2xl font-semibold tabular-nums ${
                    denied
                      ? "border-health text-health"
                      : digits.length > i
                        ? "border-accent bg-elevated text-fg"
                        : "border-border bg-elevated text-faint"
                  }`}
                >
                  {digits[i] ? "•" : ""}
                </span>
              ))}
            </div>
            {denied ? (
              <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-health">Access denied</p>
            ) : (
              <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Restricted issue</p>
            )}
            <div className="mx-auto mt-4 grid max-w-[16rem] grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0"].map((key) =>
                key === "back" ? (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setDenied(false);
                      setDigits((d) => d.slice(0, -1));
                    }}
                    className="flex h-12 items-center justify-center rounded-lg border border-border bg-elevated"
                    aria-label="Delete digit"
                  >
                    <Delete className="size-4" />
                  </button>
                ) : (
                  <button
                    key={key}
                    type="button"
                    onClick={() => push(key)}
                    className="flex h-12 items-center justify-center rounded-lg border border-border bg-elevated font-display text-2xl font-semibold"
                  >
                    {key}
                  </button>
                ),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
