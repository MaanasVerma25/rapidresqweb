import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Activity, Users, ArrowRight, Sparkles, HeartPulse, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RapidResQ — AI-powered women's safety" },
      {
        name: "description",
        content:
          "RapidResQ listens for distress signals, detects anomalies in real time, and instantly rallies your trusted contacts.",
      },
      { property: "og:title", content: "RapidResQ — AI-powered women's safety" },
      {
        property: "og:description",
        content: "Automatic distress detection, real-time intervention, and a trusted safety network.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(1_0_0/0.18),transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <div className="max-w-3xl text-primary-foreground">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              AI safety companion · always listening
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Safety that <em className="font-display italic text-accent">moves first</em>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/85 sm:text-xl">
              RapidResQ listens for screams, falls, and racing heart rates — then rallies your trusted
              circle in seconds. No tap required.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="secondary" className="shadow-warm">
                <Link to="/dashboard">
                  Open my dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link to="/monitor">See live detection</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <div className="text-sm font-medium uppercase tracking-widest text-primary">How it works</div>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Three layers of protection, always on.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            Icon={Activity}
            tint="primary"
            title="Auto-detect"
            body="On-device signal models watch audio, motion, and heart rate for distress patterns — no manual SOS needed."
          />
          <FeatureCard
            Icon={Bell}
            tint="accent"
            title="Real-time response"
            body="Confirmed anomalies open an incident, share live location, and dispatch SMS + WhatsApp to your circle."
          />
          <FeatureCard
            Icon={Users}
            tint="success"
            title="Trusted network"
            body="Add the people you trust most. They get notified the moment something feels wrong — and so can you."
          />
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-sm font-medium uppercase tracking-widest text-accent">Our mission</div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Every woman, walking home with backup.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              We built RapidResQ for the moments you can't reach your phone. Calm, quiet protection in
              the background — loud, decisive intervention the second it's needed.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Median response" value="2.3s" />
            <Stat label="Signals monitored" value="6+" />
            <Stat label="Channels per alert" value="3" />
            <Stat label="Always on" value="24/7" />
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">RapidResQ</span>
          </div>
          <p>Prototype · simulated detection &amp; alerts · not a real emergency service.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  Icon,
  title,
  body,
  tint,
}: {
  Icon: typeof HeartPulse;
  title: string;
  body: string;
  tint: "primary" | "accent" | "success";
}) {
  const tints = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    success: "bg-success/15 text-success",
  } as const;
  return (
    <div className="group rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-soft">
      <span className={`mb-5 inline-grid h-12 w-12 place-items-center rounded-2xl ${tints[tint]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-display text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{body}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="font-display text-3xl font-semibold text-primary">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
