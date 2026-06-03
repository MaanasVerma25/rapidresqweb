import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIncidents } from "@/hooks/use-persistent";
import { ChevronRight, Inbox } from "lucide-react";

export const Route = createFileRoute("/incidents/")({
  head: () => ({
    meta: [
      { title: "Incident history · RapidResQ" },
      { name: "description", content: "Past safety incidents and alert delivery logs." },
    ],
  }),
  component: IncidentsPage,
});

function IncidentsPage() {
  const { incidents } = useIncidents();
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Incident history</h1>
          <p className="mt-1 text-muted-foreground">
            A record of every alert RapidResQ has triggered.
          </p>
        </div>

        {incidents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <div className="font-medium">No incidents yet</div>
              <p className="text-sm text-muted-foreground">
                Trigger a scenario from the dashboard to see how it appears here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {incidents.map((i) => (
              <Link key={i.id} to="/incidents/$id" params={{ id: i.id }} className="block">
                <Card className="transition-shadow hover:shadow-soft">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
                      <span className="font-display text-lg font-semibold">
                        {Math.round(i.peakScore * 100)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {i.trigger.replace("-", " ")}
                        </span>
                        <Badge variant={i.status === "active" ? "destructive" : "secondary"}>
                          {i.status}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-sm text-muted-foreground">
                        {new Date(i.startedAt).toLocaleString()} · {i.alerts.length} alerts
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
