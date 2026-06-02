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
import type { Contact } from "@/lib/types";

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
  const navigate = useNavigate();
  
  // 1. Detect if already onboarded
  const [isOnboarded, setIsOnboarded] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rapidresq:onboarded") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (isOnboarded) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isOnboarded, navigate]);

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
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.006, label: "Default NYC Mock Location" });

  if (isOnboarded) {
    return null;
  }

  // Handle addition of contact in Step 2
  function handleAddContact() {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast.error("Name and phone number are required");
      return;
    }
    
    const added: Contact = {
      id: `c_${Date.now()}`,
      name: newContact.name.trim(),
      phone: newContact.phone.trim(),
      relationship: newContact.relationship.trim() || "Contact",
      primary: localContacts.length === 0,
    };
    
    setLocalContacts([...localContacts, added]);
    setNewContact({ name: "", phone: "", relationship: "" });
    toast.success("Contact added locally");
  }

  function handleRemoveContact(id: string) {
    const updated = localContacts.filter((c) => c.id !== id);
    // If we removed the primary contact, make the first remaining one primary
    if (updated.length > 0 && !updated.some((c) => c.primary)) {
      updated[0].primary = true;
    }
    setLocalContacts(updated);
    toast.success("Contact removed");
  }

  function handleSetPrimaryContact(id: string) {
    setLocalContacts(localContacts.map((c) => ({ ...c, primary: c.id === id })));
    toast.success("Primary contact updated");
  }

  // Request browser GPS permissions
  function requestLocation() {
    setLocationStatus("requesting");
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      toast.error("Geolocation not supported by browser. Using mock coords.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Live GPS Coordinates",
        });
        setLocationStatus("granted");
        toast.success("Location synchronized successfully!");
      },
      (err) => {
        console.error(err);
        setLocationStatus("denied");
        toast.error("GPS access denied. You can enter mock coordinates.");
      },
      { timeout: 8000 }
    );
  }

  // Navigate forward in the wizard
  function handleNextStep() {
    if (step === 1 && !formSettings.profile.name.trim()) {
      toast.error("Please enter your display name");
      return;
    }
    if (step === 2 && localContacts.length === 0) {
      toast.error("Please add at least one emergency contact");
      return;
    }
    setStep(step + 1);
  }

  // Save everything and complete onboarding
  function completeOnboarding() {
    // 1. Save settings
    setSettings(formSettings);
    
    // 2. Save contacts to persistent storage
    contacts.forEach((c) => remove(c.id));
    localContacts.forEach((c) => upsert(c));
    
    // 3. Persist GPS location
    persistLocation(coords);
    
    // 4. Set onboarded in localStorage
    localStorage.setItem("rapidresq:onboarded", "true");
    setIsOnboarded(true);
    
    toast.success("RapidResQ configuration activated!", {
      description: "You are now protected. Live detection is running.",
    });
  }

  // Render Functions
  function renderStep1() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Create Profile</h2>
          <p className="text-sm text-muted-foreground">Tell us a bit about yourself so your contacts and help responders can identify you.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-medium">Your Full Name</Label>
            <Input 
              id="displayName" 
              value={formSettings.profile.name}
              onChange={(e) => setFormSettings({
                ...formSettings,
                profile: { ...formSettings.profile, name: e.target.value }
              })}
              placeholder="e.g. Jessica Smith" 
              className="rounded-xl h-11"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType" className="text-sm font-medium">Blood Type</Label>
              <Input 
                id="bloodType" 
                value={formSettings.profile.bloodType}
                onChange={(e) => setFormSettings({
                  ...formSettings,
                  profile: { ...formSettings.profile, bloodType: e.target.value }
                })}
                placeholder="O+" 
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalNote" className="text-sm font-medium">Medical Note (shared in alerts)</Label>
              <Textarea 
                id="medicalNote" 
                value={formSettings.profile.medicalNote}
                onChange={(e) => setFormSettings({
                  ...formSettings,
                  profile: { ...formSettings.profile, medicalNote: e.target.value }
                })}
                placeholder="Allergies, chronic conditions, etc." 
                className="rounded-xl"
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStep2() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Trusted Contacts</h2>
          <p className="text-sm text-muted-foreground">Add people you trust. They will be alerted immediately if a danger signal is detected.</p>
        </div>
        
        {/* Contact Input Form */}
        <div className="border border-border/80 rounded-2xl p-4 bg-secondary/30 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="contactName" className="text-xs">Name</Label>
              <Input 
                id="contactName" 
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="e.g. Mom" 
                className="rounded-lg h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="contactPhone" className="text-xs">Phone Number</Label>
              <Input 
                id="contactPhone" 
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+1 555 0100" 
                className="rounded-lg h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-grow">
              <Label htmlFor="contactRel" className="text-xs">Relationship</Label>
              <Input 
                id="contactRel" 
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                placeholder="Family / Friend" 
                className="rounded-lg h-9 text-sm"
              />
            </div>
            <Button onClick={handleAddContact} size="sm" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground">
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
          {localContacts.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
              No contacts added yet. Add at least one contact above.
            </div>
          ) : (
            localContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-border/60 rounded-xl p-3 bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-semibold font-display text-sm">
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      {c.name}
                      {c.primary && <span className="text-[10px] bg-accent/15 text-accent px-1.5 py-0.5 rounded-full font-medium">Primary</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.phone} · {c.relationship}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!c.primary && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSetPrimaryContact(c.id)}>
                      <Star className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveContact(c.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Location Monitoring</h2>
          <p className="text-sm text-muted-foreground">RapidResQ shares your coordinates with emergency contacts when danger is detected.</p>
        </div>

        <div className="border border-border/80 rounded-2xl p-6 bg-secondary/20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MapPin className="h-8 w-8 animate-pulse" />
          </div>
          {locationStatus === "idle" && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base">Enable Location Services</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">Allow browser geolocation to enable live tracking in case of emergency alerts.</p>
              <Button onClick={requestLocation} className="mt-2" variant="outline">
                <Compass className="mr-1.5 h-4 w-4" /> Authorize GPS Access
              </Button>
            </div>
          )}
          {locationStatus === "requesting" && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base animate-pulse">Requesting GPS Access...</h3>
              <p className="text-xs text-muted-foreground">Please accept the location prompt in your browser.</p>
            </div>
          )}
          {locationStatus === "granted" && (
            <div className="space-y-2">
              <h3 className="font-semibold text-base text-success flex items-center justify-center gap-1">
                <CheckCircle className="h-4.5 w-4.5 text-success fill-success/10" /> GPS Access Granted
              </h3>
              <p className="text-xs text-muted-foreground font-mono bg-card px-3 py-1.5 border rounded-lg inline-block">
                Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
              </p>
              <p className="text-[10px] text-muted-foreground block">
                Detected address: {coords.label}
              </p>
            </div>
          )}
          {locationStatus === "denied" && (
            <div className="space-y-2 w-full">
              <h3 className="font-semibold text-base text-destructive">Location Access Denied</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No problem. You can configure a mock backup location for simulation purposes.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-left">
                <div className="space-y-1">
                  <Label htmlFor="mockLat" className="text-xs font-semibold">Latitude</Label>
                  <Input 
                    id="mockLat" 
                    type="number"
                    step="0.0001"
                    value={coords.lat} 
                    onChange={(e) => setCoords({ ...coords, lat: parseFloat(e.target.value) || 0 })}
                    className="rounded-lg h-9 text-xs" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mockLng" className="text-xs font-semibold">Longitude</Label>
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
                <Label htmlFor="mockLabel" className="text-xs font-semibold">Location Label</Label>
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
                <Compass className="h-3 w-3 animate-spin-slow text-primary" /> Map updates automatically in real-time.
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
          <p className="text-sm text-muted-foreground">Adjust the sensitivity thresholds for automatic distress signals.</p>
        </div>

        <div className="space-y-6">
          {/* Audio Threshold */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Audio Sensitivity</Label>
                <div className="text-xs text-muted-foreground">Volume threshold for scream detection. Lower = more sensitive.</div>
              </div>
              <span className="font-display font-semibold text-primary">{Math.round(formSettings.thresholds.audio * 100)}%</span>
            </div>
            <Slider 
              value={[formSettings.thresholds.audio]} 
              min={0.1} 
              max={1} 
              step={0.05} 
              onValueChange={([v]) => setFormSettings({
                ...formSettings,
                thresholds: { ...formSettings.thresholds, audio: v }
              })} 
            />
          </div>

          {/* Motion Threshold */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Fall Sensitivity</Label>
                <div className="text-xs text-muted-foreground">Impact threshold for fall detection. Lower = more sensitive.</div>
              </div>
              <span className="font-display font-semibold text-accent">{Math.round(formSettings.thresholds.motion * 100)}%</span>
            </div>
            <Slider 
              value={[formSettings.thresholds.motion]} 
              min={0.1} 
              max={1} 
              step={0.05} 
              onValueChange={([v]) => setFormSettings({
                ...formSettings,
                thresholds: { ...formSettings.thresholds, motion: v }
              })} 
            />
          </div>

          {/* Heart Rate Threshold */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Heart Rate Anomaly</Label>
                <div className="text-xs text-muted-foreground">Bpm at which we flag a stress spike.</div>
              </div>
              <span className="font-display font-semibold text-success">{formSettings.thresholds.bpm} bpm</span>
            </div>
            <Slider 
              value={[formSettings.thresholds.bpm]} 
              min={100} 
              max={180} 
              step={5} 
              onValueChange={([v]) => setFormSettings({
                ...formSettings,
                thresholds: { ...formSettings.thresholds, bpm: v }
              })} 
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
            Configure your profile, emergency contacts, and location to immediately secure your personal safety companion.
          </p>
          
          <div className="pt-6">
            <Button 
              onClick={() => setStep(1)} 
              size="lg" 
              variant="secondary" 
              className="shadow-warm px-8 py-6 text-lg rounded-2xl group transition-all duration-300 hover:scale-105"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
            <Button onClick={handleNextStep} className="gap-2 px-6 bg-primary text-primary-foreground">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={completeOnboarding} className="gap-2 bg-gradient-hero hover:opacity-90 text-primary-foreground px-8 font-semibold shadow-warm border-none">
              <CheckCircle className="h-4 w-4" /> Activate RapidResQ
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
