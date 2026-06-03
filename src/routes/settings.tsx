import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Compass } from "lucide-react";
import { useSettings, useLocation } from "@/hooks/use-persistent";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useEffect } from "react";

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
  const { location, setLocation } = useLocation();

  const {
    location: geoLoc,
    error: geoErr,
    loading: geoLoading,
    getPosition,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 8000,
  });

  useEffect(() => {
    if (geoLoc) {
      setLocation(geoLoc);
      toast.success("Location synchronized successfully!");
    }
  }, [geoLoc, setLocation]);

  useEffect(() => {
    if (geoErr) {
      toast.error(geoErr);
    }
  }, [geoErr]);

  function syncLocation() {
    getPosition();
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">Tune how RapidResQ watches over you.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Display name</Label>
              <Input
                value={settings.profile.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, name: e.target.value },
                  })
                }
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="space-y-1.5">
                <Label>Medical note (shared during an incident)</Label>
                <Textarea
                  value={settings.profile.medicalNote}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, medicalNote: e.target.value },
                    })
                  }
                  placeholder="Allergies, conditions, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Blood type</Label>
                <Input
                  value={settings.profile.bloodType}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      profile: { ...settings.profile, bloodType: e.target.value },
                    })
                  }
                  placeholder="O+"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">User location</Label>
                  <div className="text-xs text-muted-foreground">
                    Manage your GPS coordinates for incident response.
                  </div>
                </div>
                <Button
                  onClick={syncLocation}
                  variant="outline"
                  size="sm"
                  disabled={geoLoading}
                  className="flex items-center gap-1.5"
                >
                  <Compass className={`h-4 w-4 ${geoLoading ? "animate-spin" : ""}`} />
                  {geoLoading ? "Syncing..." : "Sync GPS"}
                </Button>
              </div>

              {location.lat !== 0 || location.lng !== 0 ? (
                <div className="space-y-3 mt-2">
                  <div className="relative w-full aspect-[2.5/1] overflow-hidden rounded-xl border border-border shadow-inner">
                    <iframe
                      title="Settings Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.015}%2C${location.lat - 0.008}%2C${location.lng + 0.015}%2C${location.lat + 0.008}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
                      className="w-full h-full filter saturate-[0.85] contrast-[0.95]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-secondary/30 p-2.5 rounded-lg border">
                    <div>Latitude: {location.lat.toFixed(5)}</div>
                    <div>Longitude: {location.lng.toFixed(5)}</div>
                    <div className="col-span-2 text-[10px] text-muted-foreground mt-1 truncate">
                      Label: {location.label || "No custom label"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-xl bg-secondary/10">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-35 animate-pulse" />
                  GPS coordinates not configured. Tap Sync GPS to authorize location tracking.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detection sensitivity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Sense
              label="Audio threshold"
              hint="Higher = louder noise needed to trigger"
              value={settings.thresholds.audio}
              min={0.2}
              max={1}
              step={0.05}
              onChange={(v) =>
                setSettings({ ...settings, thresholds: { ...settings.thresholds, audio: v } })
              }
              display={`${Math.round(settings.thresholds.audio * 100)}%`}
            />
            <Sense
              label="Motion threshold"
              hint="Sudden movement / fall sensitivity"
              value={settings.thresholds.motion}
              min={0.2}
              max={1}
              step={0.05}
              onChange={(v) =>
                setSettings({ ...settings, thresholds: { ...settings.thresholds, motion: v } })
              }
              display={`${Math.round(settings.thresholds.motion * 100)}%`}
            />
            <Sense
              label="Heart-rate threshold"
              hint="Bpm at which we flag a spike"
              value={settings.thresholds.bpm}
              min={100}
              max={180}
              step={5}
              onChange={(v) =>
                setSettings({ ...settings, thresholds: { ...settings.thresholds, bpm: v } })
              }
              display={`${settings.thresholds.bpm} bpm`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alert channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              label="SMS"
              hint="Text message to your trusted contacts"
              checked={settings.channels.sms}
              onChange={(v) =>
                setSettings({ ...settings, channels: { ...settings.channels, sms: v } })
              }
            />
            <Toggle
              label="WhatsApp"
              hint="WhatsApp message with live location"
              checked={settings.channels.whatsapp}
              onChange={(v) =>
                setSettings({ ...settings, channels: { ...settings.channels, whatsapp: v } })
              }
            />
            <Toggle
              label="In-app push"
              hint="Notification in this app"
              checked={settings.channels.inapp}
              onChange={(v) =>
                setSettings({ ...settings, channels: { ...settings.channels, inapp: v } })
              }
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

function Sense({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
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
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
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
