import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  unit?: string;
  Icon: LucideIcon;
  series: number[]; // 0-1 normalized
  tone?: "primary" | "accent" | "success" | "destructive";
};

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
  destructive: "text-destructive",
};

export function SignalTile({ label, value, unit, Icon, series, tone = "primary" }: Props) {
  const max = Math.max(0.01, ...series);
  const w = 100;
  const h = 36;
  const step = w / Math.max(1, series.length - 1);
  const points = series
    .map((v, i) => `${(i * step).toFixed(2)},${(h - (v / max) * h).toFixed(2)}`)
    .join(" ");

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span
            className={cn("grid h-9 w-9 place-items-center rounded-lg bg-secondary", TONE[tone])}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="font-display text-xl font-semibold">
              {value}
              {unit && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
              )}
            </div>
          </div>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-10 w-full" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={TONE[tone]}
          />
        </svg>
      </CardContent>
    </Card>
  );
}
