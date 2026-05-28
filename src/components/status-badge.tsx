import { cn } from "@/lib/utils";
import type { SafetyStatus } from "@/lib/types";
import { ShieldCheck, ShieldAlert, Siren } from "lucide-react";

const MAP: Record<
  SafetyStatus,
  { label: string; sub: string; cls: string; Icon: typeof ShieldCheck }
> = {
  safe: {
    label: "All clear",
    sub: "No anomalies detected",
    cls: "from-success/15 to-success/5 text-success-foreground border-success/30",
    Icon: ShieldCheck,
  },
  elevated: {
    label: "Elevated",
    sub: "Unusual signals — monitoring closely",
    cls: "from-warning/20 to-warning/5 text-warning-foreground border-warning/40",
    Icon: ShieldAlert,
  },
  critical: {
    label: "Critical",
    sub: "Anomaly detected — preparing alerts",
    cls: "from-destructive/20 to-destructive/5 text-destructive border-destructive/40",
    Icon: Siren,
  },
};

export function StatusBadge({ status, score }: { status: SafetyStatus; score: number }) {
  const { label, sub, cls, Icon } = MAP[status];
  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-6 transition-colors",
        cls,
      )}
    >
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-background/70 shadow-soft">
          <Icon className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <div className="font-display text-3xl font-semibold">{label}</div>
          <div className="text-sm opacity-80">{sub}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider opacity-70">Anomaly</div>
          <div className="font-display text-2xl font-semibold">{Math.round(score * 100)}</div>
        </div>
      </div>
    </div>
  );
}
