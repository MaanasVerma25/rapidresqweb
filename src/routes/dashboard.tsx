import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Mic, Activity, HeartPulse, MapPin, Wind, Footprints, PersonStanding, AlertOctagon, Heart } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { StatusBadge } from "@/components/status-badge";
import { SOSButton } from "@/components/sos-button";
import { SignalTile } from "@/components/signal-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSafetySignals } from "@/hooks/use-safety-signals";
import { useContacts, useIncidents, useSettings } from "@/hooks/use-persistent";
import type { Incident, Scenario } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · RapidResQ" },
      { name: "description", content: "Live safety status, SOS, and signal monitoring." },
    ],
  }),
  component: Dashboard,
});

const SCENARIOS: { id: Scenario; label: string; icon: typeof Wind }[] = [
  { id: "normal", label: "Calm", icon: Wind },
  { id: "scream", label: "Scream", icon: AlertOctagon },
  { id: "fall", label: "Fall", icon: PersonStanding },
  { id: "run", label: "Sudden run", icon: Footprints },
  { id: "heart-spike", label: "Heart spike", icon: Heart },
];

function Dashboard() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { contacts } = useContacts();
  const { incidents, add } = useIncidents();
  const [enabled] = useState(true);
  const { samples, latest, status, scenario, setScenario } = useSafetySignals({
    thresholds: settings.thresholds,
    enabled,
  });

  const series = useMemo(() => ({
    audio: samples.map((s) => s.audio),
    motion: samples.map((s) => s.motion),
    bpm: samples.map((s) => (s.bpm - 60) / 120),
    score: samples.map((s) => s.score),
  }), [samples]);

  const recent = incidents[0];

  function triggerIncident(trigger: Incident["trigger"]) {
    const id = `inc_${Date.now()}`;
    const peakScore = Math.max(...samples.map((s) => s.score), latest.score);
    const channels: Array<"sms" | "whatsapp" | "inapp"> = [];
    if (settings.channels.sms) channels.push("sms");
    if (settings.channels.whatsapp) channels.push("whatsapp");
    if (settings.channels.inapp) channels.push("inapp");

    const alerts = contacts.flatMap((c) =>
      channels.map((ch) => ({
        contactId: c.id,
        contactName: c.name,
        channel: ch,
        status: "sent" as const,
        at: Date.now() + Math.floor(Math.random() * 1200),
      })),
    );

    const incident: Incident = {
      id,
      startedAt: Date.now(),
      trigger,
      status: "active",
      peakScore,
      location: { lat: 40.7128, lng: -74.006, label: "Approx. last known location" },
      signalTrace: samples.slice(-30),
      alerts,
    };
    add(incident);
    toast.error("Incident opened", {
      description: `Alerting ${contacts.length} contact${contacts.length === 1 ? "" : "s"} via ${channels.length} channel${channels.length === 1 ? "" : "s"}.`,
    });
    navigate({ to: "/incidents/$id", params: { id } });
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Live status</div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">
              Hello{settings.profile.name ? `, ${settings.profile.name}` : ""}
            </h1>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            Detection running
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <StatusBadge status={status} score={latest.score} />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SignalTile
                label="Audio"
                value={Math.round(latest.audio * 100).toString()}
                unit="%"
                Icon={Mic}
                series={series.audio}
                tone={latest.audio > settings.thresholds.audio ? "destructive" : "primary"}
              />
              <SignalTile
                label="Motion"
                value={Math.round(latest.motion * 100).toString()}
                unit="%"
                Icon={Activity}
                series={series.motion}
                tone={latest.motion > settings.thresholds.motion ? "destructive" : "accent"}
              />
              <SignalTile
                label="Heart rate"
                value={latest.bpm.toString()}
                unit="bpm"
                Icon={HeartPulse}
                series={series.bpm}
                tone={latest.bpm > settings.thresholds.bpm ? "destructive" : "success"}
              />
              <SignalTile
                label="Location"
                value="Live"
                Icon={MapPin}
                series={series.score}
                tone="primary"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Scenario simulator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Inject a behavioural pattern to see how RapidResQ reacts. Sustained high-anomaly states
                  will auto-trigger an incident.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SCENARIOS.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      size="sm"
                      variant={scenario === id ? "default" : "outline"}
                      onClick={() => {
                        setScenario(id);
                        toast(`Simulating: ${label}`, {
                          description: id === "normal" ? "Returning to baseline." : "Watching for anomaly...",
                        });
                      }}
                    >
                      <Icon className="mr-1.5 h-3.5 w-3.5" />
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="flex flex-col items-center justify-center p-8">
              <SOSButton onTrigger={() => triggerIncident("manual")} />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent incident</CardTitle>
              </CardHeader>
              <CardContent>
                {recent ? (
                  <button
                    onClick={() => navigate({ to: "/incidents/$id", params: { id: recent.id } })}
                    className="block w-full rounded-xl border border-border p-4 text-left transition-colors hover:bg-secondary/60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium capitalize">{recent.trigger.replace("-", " ")}</div>
                      <Badge variant={recent.status === "active" ? "destructive" : "secondary"}>
                        {recent.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(recent.startedAt).toLocaleString()} · {recent.alerts.length} alerts sent
                    </div>
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No incidents yet. Stay safe — RapidResQ is watching.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
