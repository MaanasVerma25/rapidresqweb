import { useEffect, useRef, useState } from "react";
import { Siren } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onTrigger: () => void;
  active?: boolean;
  holdMs?: number;
};

export function SOSButton({ onTrigger, active, holdMs = 1500 }: Props) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  function start() {
    if (active) return;
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const p = Math.min(1, elapsed / holdMs);
      setProgress(p);
      if (p >= 1) {
        onTrigger();
        stop();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setProgress(0);
  }

  useEffect(() => () => stop(), []);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label="Hold to trigger SOS"
        onMouseDown={start}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        className={cn(
          "relative grid h-44 w-44 select-none place-items-center rounded-full text-destructive-foreground transition-transform active:scale-95",
          "bg-gradient-to-br from-destructive to-[oklch(0.65_0.22_18)] shadow-warm",
          !active && "pulse-ring",
        )}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="oklch(1 0 0 / 0.2)" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="oklch(1 0 0 / 0.9)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
            style={{ transition: progress === 0 ? "stroke-dashoffset 200ms ease" : "none" }}
          />
        </svg>
        <div className="flex flex-col items-center">
          <Siren className="h-10 w-10" />
          <span className="mt-1 font-display text-2xl font-semibold">SOS</span>
        </div>
      </button>
      <p className="text-center text-sm text-muted-foreground">
        Hold for {Math.round(holdMs / 1000)}s to trigger an emergency alert
      </p>
    </div>
  );
}
