import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSafetySignals } from "@/hooks/use-safety-signals";
import { useSettings } from "@/hooks/use-persistent";

export const Route = createFileRoute("/monitor")({
  head: () => ({
    meta: [
      { title: "Live monitor · RapidResQ" },
      {
        name: "description",
        content: "Live anomaly detection across audio, motion, and heart-rate signals.",
      },
    ],
  }),
  component: MonitorPage,
});

function MonitorPage() {
  const { settings } = useSettings();
  const [enabled, setEnabled] = useState(true);
  const { samples, latest } = useSafetySignals({ thresholds: settings.thresholds, enabled });

  const audio = useMemo(() => samples.map((s) => s.audio), [samples]);
  const motion = useMemo(() => samples.map((s) => s.motion), [samples]);
  const bpm = useMemo(() => samples.map((s) => s.bpm), [samples]);
  const score = useMemo(() => samples.map((s) => s.score), [samples]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Live monitor</h1>
            <p className="mt-1 text-muted-foreground">
              Behavioural, audio, and physiological streams.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
            <Label htmlFor="det" className="text-sm">
              Detection
            </Label>
            <Switch id="det" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Anomaly score</span>
              <span className="font-display text-2xl">{Math.round(latest.score * 100)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Gauge value={latest.score} />
            <AreaChart series={score} stroke="var(--color-primary)" fill="var(--color-primary)" />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <StreamCard
            title="Audio (scream / keyword)"
            unit="%"
            value={Math.round(latest.audio * 100)}
            series={audio}
            color="var(--color-accent)"
          />
          <StreamCard
            title="Motion (accelerometer)"
            unit="%"
            value={Math.round(latest.motion * 100)}
            series={motion}
            color="var(--color-primary)"
          />
          <StreamCard
            title="Heart rate"
            unit="bpm"
            value={latest.bpm}
            series={bpm.map((v) => (v - 60) / 120)}
            color="var(--color-destructive)"
          />
          <StreamCard
            title="Composite score"
            unit="%"
            value={Math.round(latest.score * 100)}
            series={score}
            color="var(--color-success)"
          />
        </div>
      </main>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="mb-4">
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${pct}%`,
            background:
              value > 0.85
                ? "var(--color-destructive)"
                : value > 0.55
                  ? "var(--color-warning)"
                  : "var(--color-success)",
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>Safe</span>
        <span>Elevated</span>
        <span>Critical</span>
      </div>
    </div>
  );
}

function StreamCard({
  title,
  unit,
  value,
  series,
  color,
}: {
  title: string;
  unit: string;
  value: number;
  series: number[];
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          <span className="font-display text-2xl">
            {value}
            <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChart series={series} stroke={color} fill={color} />
      </CardContent>
    </Card>
  );
}

function AreaChart({ series, stroke, fill }: { series: number[]; stroke: string; fill: string }) {
  const w = 600;
  const h = 120;
  const max = Math.max(0.01, ...series);
  const step = w / Math.max(1, series.length - 1);
  const pts = series.map((v, i) => [i * step, h - (v / max) * h] as const);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const gradId = `g-${stroke.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-32 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
