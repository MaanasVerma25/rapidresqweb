import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  Activity,
  Users,
  ArrowRight,
  Sparkles,
  HeartPulse,
  Plus,
  Trash2,
  Phone,
  Star,
  MapPin,
  Compass,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useContacts, useSettings, useLocation } from "@/hooks/use-persistent";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { Contact } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Auth } from "@/components/auth";

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
        content:
          "Automatic distress detection, real-time intervention, and a trusted safety network.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Detect if already onboarded
  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rapidresq:onboarded") === "true";
    }
    return false;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isOnboarded && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isOnboarded, navigate, user]);

  // 2. Load persistent states
  const { settings, setSettings } = useSettings();
  const { contacts, upsert, remove, setPrimary } = useContacts();
  const { setLocation: persistLocation } = useLocation();

  // 3. Wizard states
  const [step, setStep] = useState(0); // 0 is landing, 1-4 are steps

  // Local form states (copied from defaults)
  const [formSettings, setFormSettings] = useState(() => settings);
  const [localContacts, setLocalContacts] = useState<Contact[]>(() => contacts);

  // New contact entry state
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" });

  // Location states
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [coords, setCoords] = useState({
    lat: 40.7128,
    lng: -74.006,
    label: "Default NYC Mock Location",
  });
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
      setCoords(geoLoc);
      setLocationStatus("granted");
    }
  }, [geoLoc]);

  useEffect(() => {
    if (geoErr) {
      toast.error(geoErr);
      setLocationStatus("denied");
    }
  }, [geoErr]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Sparkles className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Next step handler with validation
  function handleNextStep() {
    if (step === 1 && !formSettings.profile.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (step === 2 && localContacts.length === 0) {
      toast.error("Please add at least one emergency contact");
      return;
    }
    setStep(step + 1);
  }

  // Save everything and complete onboarding
  async function completeOnboarding() {
    if (!user) return;

    try {
      // 1. Save settings
      setSettings(formSettings);

      // Save to Supabase
      const { error: settingsError } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        thresholds: formSettings.thresholds,
        channels: formSettings.channels,
      });
      if (settingsError) throw settingsError;

      // 2. Save profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        name: formSettings.profile.name,
        medical_note: formSettings.profile.medicalNote,
        blood_type: formSettings.profile.bloodType,
      });
      if (profileError) throw profileError;

      // 3. Save contacts
      contacts.forEach((c) => remove(c.id));
      localContacts.forEach((c) => upsert(c));

      // Save to Supabase (delete old ones first for simplicity in this flow)
      await supabase.from("contacts").delete().eq("user_id", user.id);
      const { error: contactsError } = await supabase.from("contacts").insert(
        localContacts.map((c) => ({
          user_id: user.id,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship,
          is_primary: c.primary || false,
        })),
      );
      if (contactsError) throw contactsError;

      // 4. Persist GPS location
      persistLocation(coords);

      // 5. Set onboarded in localStorage
      localStorage.setItem("rapidresq:onboarded", "true");
      setIsOnboarded(true);
      navigate({ to: "/dashboard", replace: true });

      toast.success("RapidResQ configuration activated!", {
        description: "You are now protected. Live detection is running.",
      });
    } catch (error) {
      toast.error(
        "Failed to save configuration: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  }

  // Render Functions
  function renderStep1() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Create Profile</h2>
          <p className="text-sm text-muted-foreground">
            Tell us a bit about yourself so your contacts and help responders can identify you.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">
              Your Full Name
            </Label>
            <Input
              id="displayName"
              value={formSettings.profile.name}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  profile: { ...formSettings.profile, name: e.target.value },
                })
              }
              placeholder="e.g. Jessica Smith"
              className="rounded-xl h-11"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType" className="text-sm font-medium">
                Blood Type
              </Label>
              <Input
                id="bloodType"
                value={formSettings.profile.bloodType}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    profile: { ...formSettings.profile, bloodType: e.target.value },
                  })
                }
                placeholder="O+"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalNote" className="text-sm font-medium">
                Medical Note (shared in alerts)
              </Label>
              <Textarea
                id="medicalNote"
                value={formSettings.profile.medicalNote}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    profile: { ...formSettings.profile, medicalNote: e.target.value },
                  })
                }
                placeholder="e.g. Diabetic, allergic to penicillin..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    const addContact = () => {
      if (!newContact.name || !newContact.phone) {
        toast.error("Name and phone are required");
        return;
      }
      const c: Contact = {
        id: Math.random().toString(36).substr(2, 9),
        ...newContact,
        primary: localContacts.length === 0,
      };
      setLocalContacts([...localContacts, c]);
      setNewContact({ name: "", phone: "", relationship: "" });
    };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Emergency Contacts</h2>
          <p className="text-sm text-muted-foreground">
            Who should we alert when we detect trouble?
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Name"
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+1..."
                className="h-10 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              placeholder="Relationship (e.g. Sister, Roommate)"
              className="h-10 rounded-lg"
            />
            <Button
              onClick={addContact}
              variant="outline"
              size="icon"
              className="shrink-0 h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {localContacts.length === 0 && (
            <div className="text-center py-8 border border-dashed rounded-2xl bg-secondary/20">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs text-muted-foreground">No contacts added yet</p>
            </div>
          )}
          {localContacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl border bg-card/50"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {c.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    {c.name} {c.primary && <Star className="h-3 w-3 fill-accent text-accent" />}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {c.relationship} • {c.phone}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => setLocalContacts(localContacts.filter((x) => x.id !== c.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Location Access</h2>
          <p className="text-sm text-muted-foreground">
            We need your real-time location to send help precisely where you are.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
          {locationStatus === "idle" && (
            <div className="space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <Button onClick={() => getPosition()} className="rounded-full px-8">
                Allow Location Access
              </Button>
            </div>
          )}

          {locationStatus === "requesting" && (
            <div className="space-y-2">
              <Compass className="h-10 w-10 text-primary animate-spin mx-auto" />
              <p className="text-sm">Acquiring satellite signal...</p>
            </div>
          )}

          {locationStatus === "denied" && (
            <div className="w-full space-y-4">
              <p className="text-sm text-destructive font-medium bg-destructive/5 p-3 rounded-xl">
                Location access was denied. Please provide a mock location for this prototype.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <Label htmlFor="mockLat" className="text-xs font-semibold">
                    Latitude
                  </Label>
                  <Input
                    id="mockLat"
                    type="number"
                    step="0.0001"
                    value={coords.lat}
                    onChange={(e) => setCoords({ ...coords, lat: parseFloat(e.target.value) || 0 })}
                    className="rounded-lg h-9 text-xs"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <Label htmlFor="mockLng" className="text-xs font-semibold">
                    Longitude
                  </Label>
                  <Input
                    id="mockLng"
                    type="number"
                    step="0.0001"
                    value={coords.lng}
                    onChange={(e) => setCoords({ ...coords, lng: parseFloat(e.target.value) || 0 })}
                    className="rounded-lg h-9 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1 text-left">
                <Label htmlFor="mockLabel" className="text-xs font-semibold">
                  Location Label
                </Label>
                <Input
                  id="mockLabel"
                  value={coords.label}
                  onChange={(e) => setCoords({ ...coords, label: e.target.value })}
                  className="rounded-lg h-9 text-xs"
                  placeholder="e.g. Main Street, New York"
                />
              </div>
            </div>
          )}

          {(locationStatus === "granted" || locationStatus === "denied") && (
            <div className="w-full mt-4 space-y-2">
              <div className="relative w-full aspect-[2/1] overflow-hidden rounded-2xl border border-border shadow-inner">
                <iframe
                  title="User Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.015}%2C${coords.lat - 0.008}%2C${coords.lng + 0.015}%2C${coords.lat + 0.008}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
                  className="w-full h-full filter saturate-[0.85] contrast-[0.95]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Compass className="h-3 w-3 animate-spin-slow text-primary" /> Map updates
                automatically in real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderStep4() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Detection Settings</h2>
          <p className="text-sm text-muted-foreground">
            Adjust the sensitivity thresholds for automatic distress signals.
          </p>
        </div>

        <div className="space-y-6">
          {/* Audio Threshold */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Audio Sensitivity</Label>
                <div className="text-xs text-muted-foreground">
                  Volume threshold for scream detection. Lower = more sensitive.
                </div>
              </div>
              <span className="font-display font-semibold text-primary">
                {Math.round(formSettings.thresholds.audio * 100)}%
              </span>
            </div>
            <Slider
              value={[formSettings.thresholds.audio]}
              min={0.1}
              max={1}
              step={0.05}
              onValueChange={([v]) =>
                setFormSettings({
                  ...formSettings,
                  thresholds: { ...formSettings.thresholds, audio: v },
                })
              }
            />
          </div>

          {/* Motion Threshold */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Fall Sensitivity</Label>
                <div className="text-xs text-muted-foreground">
                  Impact threshold for fall detection. Lower = more sensitive.
                </div>
              </div>
              <span className="font-display font-semibold text-accent">
                {Math.round(formSettings.thresholds.motion * 100)}%
              </span>
            </div>
            <Slider
              value={[formSettings.thresholds.motion]}
              min={0.1}
              max={1}
              step={0.05}
              onValueChange={([v]) =>
                setFormSettings({
                  ...formSettings,
                  thresholds: { ...formSettings.thresholds, motion: v },
                })
              }
            />
          </div>

          {/* Heart Rate Threshold */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Heart Rate Anomaly</Label>
                <div className="text-xs text-muted-foreground">
                  Bpm at which we flag a stress spike.
                </div>
              </div>
              <span className="font-display font-semibold text-success">
                {formSettings.thresholds.bpm} bpm
              </span>
            </div>
            <Slider
              value={[formSettings.thresholds.bpm]}
              min={100}
              max={180}
              step={5}
              onValueChange={([v]) =>
                setFormSettings({
                  ...formSettings,
                  thresholds: { ...formSettings.thresholds, bpm: v },
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }

  // Welcome Step (0)
  if (step === 0) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Beautiful Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,oklch(1_0_0/0.18),transparent_60%)]" />

        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-primary-foreground relative z-10 space-y-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Sparkles className="h-4 w-4 text-accent" />
            AI Safety Companion · Always Active
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Welcome to <br />
            <span className="text-accent italic font-display">RapidResQ</span>.
          </h1>

          <p className="mx-auto max-w-xl text-lg text-primary-foreground/85 sm:text-xl">
            Configure your profile, emergency contacts, and location to immediately secure your
            personal safety companion.
          </p>

          <div className="pt-6">
            <Button
              onClick={() => setStep(1)}
              size="lg"
              variant="secondary"
              className="shadow-warm px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105"
            >
              Get Started{" "}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Onboarding Wizard Container (steps 1-4)
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

      <div className="max-w-xl w-full space-y-8 bg-card border border-border/80 rounded-3xl p-8 shadow-xl relative">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-5">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-display font-semibold text-xl">Configure RapidResQ</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">
            Step {step} of 4
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-350"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="min-h-[220px] transition-all duration-300">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border/60 mt-8">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div /> // placeholder for alignment
          )}

          {step < 4 ? (
            <Button
              onClick={handleNextStep}
              className="gap-2 px-6 bg-primary text-primary-foreground"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              className="gap-2 bg-gradient-hero hover:opacity-90 text-primary-foreground px-8 font-semibold shadow-warm border-none"
            >
              <CheckCircle className="h-4 w-4" /> Activate RapidResQ
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
