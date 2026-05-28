import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks/use-persistent";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · RapidResQ" },
      { name: "description", content: "Detection sensitivity, alert preferences, and profile." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, setSettings } = useSettings();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">Tune how RapidResQ watches over you.</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Display name</Label>
              <Input
                value={settings.profile.name}
                onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, name: e.target.value } })}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="space-y-1.5">
                <Label>Medical note (shared during an incident)</Label>
                <Textarea
                  value={settings.profile.medicalNote}
                  onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, medicalNote: e.target.value } })}
                  placeholder="Allergies, conditions, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Blood type</Label>
                <Input
                  value={settings.profile.bloodType}
                  onChange={(e) => setSettings({ ...settings, profile: { ...settings.profile, bloodType: e.target.value } })}
                  placeholder="O+"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Detection sensitivity</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <Sense
              label="Audio threshold"
              hint="Higher = louder noise needed to trigger"
              value={settings.thresholds.audio}
              min={0.2} max={1} step={0.05}
              onChange={(v) => setSettings({ ...settings, thresholds: { ...settings.thresholds, audio: v } })}
              display={`${Math.round(settings.thresholds.audio * 100)}%`}
            />
            <Sense
              label="Motion threshold"
              hint="Sudden movement / fall sensitivity"
              value={settings.thresholds.motion}
              min={0.2} max={1} step={0.05}
              onChange={(v) => setSettings({ ...settings, thresholds: { ...settings.thresholds, motion: v } })}
              display={`${Math.round(settings.thresholds.motion * 100)}%`}
            />
            <Sense
              label="Heart-rate threshold"
              hint="Bpm at which we flag a spike"
              value={settings.thresholds.bpm}
              min={100} max={180} step={5}
              onChange={(v) => setSettings({ ...settings, thresholds: { ...settings.thresholds, bpm: v } })}
              display={`${settings.thresholds.bpm} bpm`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Alert channels</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              label="SMS"
              hint="Text message to your trusted contacts"
              checked={settings.channels.sms}
              onChange={(v) => setSettings({ ...settings, channels: { ...settings.channels, sms: v } })}
            />
            <Toggle
              label="WhatsApp"
              hint="WhatsApp message with live location"
              checked={settings.channels.whatsapp}
              onChange={(v) => setSettings({ ...settings, channels: { ...settings.channels, whatsapp: v } })}
            />
            <Toggle
              label="In-app push"
              hint="Notification in this app"
              checked={settings.channels.inapp}
              onChange={(v) => setSettings({ ...settings, channels: { ...settings.channels, inapp: v } })}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => toast.success("Settings saved")}>Save</Button>
        </div>
      </main>
    </div>
  );
}

function Sense({ label, hint, value, min, max, step, onChange, display }: {
  label: string; hint: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <Label className="text-sm">{label}</Label>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        <span className="font-display text-lg text-primary">{display}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
