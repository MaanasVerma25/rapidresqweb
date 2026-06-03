## RapidResQ — UI Prototype Plan

A polished single-user web prototype for an AI-powered women's safety platform. All AI detection, alerts, and emergency dispatch are **simulated in-browser** — no backend, no Twilio, no real ML. Designed to demo the concept end-to-end.

### Scope (locked from your answers)

- **Build level:** UI/UX prototype only (mocked detection & alerts)
- **User:** End user (woman at risk) — no auth, no admin/guardian views
- **Alerts:** SMS + WhatsApp shown as simulated outbound (toast + activity log entries that mimic delivery). No Twilio integration in v1.
- **Visual:** Greenish/orangish palette — empowering, grounded, nature-forward

### Pages (TanStack Start routes)

```
/                  Landing — hero, value props, "Open my safety dashboard" CTA
/dashboard         Main hub — status, big SOS, live signals, quick actions
/monitor           Live monitoring — audio/motion/heart-rate streams (simulated)
/contacts          Trusted contacts list (localStorage)
/incidents         Incident history + activity log of past simulated alerts
/incidents/$id     Incident detail — timeline, signal trace, alert delivery log
/settings          Detection sensitivity sliders, alert preferences, profile
```

### Core screens & components

**Landing**

- Hero with mission statement, gradient from forest green to warm amber
- Feature trio: Auto-detect, Real-time response, Trusted network
- Footer with disclaimer (prototype, not a real emergency service)

**Dashboard**

- Safety status card (Safe / Elevated / Critical) — large, color-coded
- Pulsing SOS button (hold-to-trigger, 3s)
- Live signal tiles: Audio level, Motion intensity, Heart rate (BPM), Location
- "Simulate scenario" tray (dev/demo affordance): Normal, Scream, Fall, Sudden run, Heart spike → triggers anomaly flow
- Recent incident card

**Monitor**

- Animated waveform (audio), accelerometer chart, BPM line — all driven by a mocked signal generator hook
- Anomaly score gauge updating live
- "Detection running" indicator with toggle

**SOS / Incident flow**

- Countdown modal (5s cancel window)
- On trigger: create incident → simulate contacting trusted contacts → show progress (SMS sent ✓, WhatsApp sent ✓, Location shared ✓)
- Map placeholder showing static location pin
- Calming guidance copy while help is "on the way"

**Contacts**

- Add/edit/delete (name, phone, relationship)
- Persisted in localStorage
- Star a primary contact

**Settings**

- Sensitivity sliders (audio, motion, heart-rate thresholds)
- Alert channel toggles (SMS, WhatsApp, in-app)
- Profile (name, emergency medical note, blood type)

### Simulated AI detection (frontend only)

A `useSafetySignals` hook generates pseudo-random sensor streams. A `useAnomalyDetector` hook applies threshold + simple weighted score logic over the streams and exposes a status (safe/elevated/critical). A "scenario simulator" lets the user inject preset patterns to demo detection triggering an incident automatically.

### Design system

- Palette: forest/emerald green, warm amber/orange, moss, cream — defined as oklch tokens in `src/styles.css`
- Typography: warm modern pair (e.g. Fraunces display + Inter body via Google Fonts)
- Rounded-2xl cards, soft shadows, subtle gradients, gentle motion (fade/scale)
- Accessible contrast, large tap targets, prominent SOS

### Technical notes

- TanStack Start routes under `src/routes/`
- shadcn components (Card, Button, Slider, Dialog, Switch, Badge, Sonner toasts)
- State: React + localStorage for contacts/incidents/settings; no backend
- Charts: lightweight SVG/recharts for waveforms
- All "alerts" are toasts + log entries — clearly labeled as simulated in a persistent disclaimer banner
- No Lovable Cloud, no Twilio connector in v1

### Out of scope (v1)

Real auth, real database, real SMS/WhatsApp/calls, real ML models, real location/GPS/microphone access, guardian/responder dashboards, mobile/native, wearables. These can be layered on later.

### Closing the loop

After build I'll verify the route tree compiles, screens render, the scenario simulator triggers the incident flow, and contacts persist across reloads.
