import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIncidents } from "@/hooks/use-persistent";
import { ArrowLeft, MapPin, MessageSquare, Smartphone, Bell, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/incidents/$id")({
  head: () => ({
    meta: [{ title: "Incident · RapidResQ" }],
  }),
  component: IncidentDetail,
});

const CHANNEL_ICON = {
  sms: Smartphone,
  whatsapp: MessageSquare,
  inapp: Bell,
} as const;

function IncidentDetail() {
  const { id } = useParams({ from: "/incidents/$id" });
  const { incidents, update } = useIncidents();
  const incident = incidents.find((i) => i.id === id);

  if (!incident) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="font-display text-3xl font-semibold">Incident not found</h1>
          <p className="mt-2 text-muted-foreground">It may have been cleared from this device.</p>
          <Button asChild className="mt-6">
            <Link to="/incidents">Back to incidents</Link>
          </Button>
        </main>
      </div>
    );
  }

  function resolve() {
    update(incident!.id, { status: "resolved", endedAt: Date.now() });
    toast.success("Incident marked resolved");
  }

  const series = incident.signalTrace.map((s) => s.score);
  const w = 600,
    h = 80;
  const max = Math.max(0.01, ...series);
  const step = w / Math.max(1, series.length - 1);
  const line = series
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`)
    .join(" ");

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/incidents">
              <ArrowLeft className="mr-1 h-4 w-4" /> All incidents
            </Link>
          </Button>
          {incident.status === "active" && (
            <Button onClick={resolve}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Mark resolved
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Incident
                </div>
                <h1 className="font-display text-3xl font-semibold capitalize">
                  {incident.trigger.replace("-", " ")}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(incident.startedAt).toLocaleString()}
                </p>
              </div>
              <Badge
                variant={incident.status === "active" ? "destructive" : "secondary"}
                className="text-sm"
              >
                {incident.status}
              </Badge>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Peak anomaly" value={`${Math.round(incident.peakScore * 100)}`} />
              <Stat label="Alerts dispatched" value={`${incident.alerts.length}`} />
              <Stat
                label="Contacts reached"
                value={`${new Set(incident.alerts.map((a) => a.contactId)).size}`}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signal trace</CardTitle>
            </CardHeader>
            <CardContent>
              <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" preserveAspectRatio="none">
                <polyline
                  points={line}
                  fill="none"
                  stroke="var(--color-destructive)"
                  strokeWidth="2"
                />
              </svg>
              <div className="mt-2 text-xs text-muted-foreground">
                Last {incident.signalTrace.length} samples around the trigger event.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-gradient-to-br from-secondary/50 to-background shadow-inner">
                {incident.location.lat !== 0 || incident.location.lng !== 0 ? (
                  <iframe
                    title="Incident Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${incident.location.lng - 0.012}%2C${incident.location.lat - 0.006}%2C${incident.location.lng + 0.012}%2C${incident.location.lat + 0.006}&layer=mapnik&marker=${incident.location.lat}%2C${incident.location.lng}`}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground/60 mb-2 animate-bounce" />
                    <span className="text-xs text-muted-foreground">Coordinates not available</span>
                  </div>
                )}
              </div>
              <div className="text-sm">
                <div className="font-medium">{incident.location.label || "Live Coordinates"}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {incident.location.lat.toFixed(5)}, {incident.location.lng.toFixed(5)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alert delivery log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incident.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contacts configured — add some on the Contacts page.
              </p>
            ) : (
              incident.alerts
                .slice()
                .sort((a, b) => a.at - b.at)
                .map((a, idx) => {
                  const Icon = CHANNEL_ICON[a.channel];
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-3 py-2"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{a.contactName}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {a.channel === "inapp" ? "In-app push" : a.channel} ·{" "}
                          {new Date(a.at).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {a.status}
                      </Badge>
                    </div>
                  );
                })
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Simulated delivery for prototype purposes.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}
