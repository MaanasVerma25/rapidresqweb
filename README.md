# RapidResQ

An AI-powered women's safety and emergency response platform prototype. RapidResQ demonstrates an intelligent safety ecosystem that monitors behavioral, audio, physiological, and motion-based signals to detect emergencies and trigger real-time interventions — all simulated in the browser for demonstration purposes.

> ⚠️ **Prototype Disclaimer**: This is a UI/UX prototype only. It does not connect to real emergency services, send actual SMS/WhatsApp messages, or use real ML models. Do not rely on it in a real emergency.

## Features

- **Automatic Distress Detection** — Simulated AI monitoring of audio, motion, and heart-rate signals with weighted anomaly scoring
- **SOS Emergency Trigger** — Hold-to-activate SOS button with a 5-second cancel window
- **Live Signal Monitoring** — Real-time waveform visualizations for audio, motion, and BPM streams
- **Scenario Simulator** — Demo modes (scream, fall, sudden run, heart spike) to test detection flows
- **Trusted Contacts** — Add and manage emergency contacts with primary contact marking
- **Incident History** — Timeline of simulated incidents with alert delivery logs and signal traces
- **Detection Sensitivity** — Configurable thresholds for audio, motion, and heart-rate anomaly detection

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + Vite 7)
- **Styling**: Tailwind CSS v4 with custom OKLCH design tokens
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **State**: React hooks + localStorage persistence
- **Package Manager**: Bun

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ or [Bun](https://bun.sh/) 1.2+
- Git

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

   > If you don't have Bun, you can use `npm install` or `yarn install` instead.

3. **Start the development server**

   ```bash
   bun dev
   ```

4. **Open in browser**

   Navigate to `http://localhost:3000`

## Environment Variables

This prototype does not require any environment variables to run locally. The app uses localStorage for persistence and simulates all AI detection and alerting in the browser.

If you extend the project with a real backend, you would add variables here following the patterns in `src/lib/config.server.ts`:

| Variable                    | Scope           | Description                                         |
| --------------------------- | --------------- | --------------------------------------------------- |
| `NODE_ENV`                  | Server          | Runtime environment (development / production)      |
| `VITE_*`                    | Client + Server | Public configuration values (prefixed with `VITE_`) |
| `DATABASE_URL`              | Server          | Database connection string (future)                 |
| `SUPABASE_URL`              | Server          | Supabase project URL (future)                       |
| `SUPABASE_SERVICE_ROLE_KEY` | Server          | Supabase service role key (future)                  |

To add environment variables locally, create a `.env` file in the project root:

```bash
# Public (available in browser)
VITE_APP_NAME=RapidResQ

# Server-only (never exposed to client)
NODE_ENV=development
```

## Available Scripts

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `bun dev`     | Start the development server         |
| `bun build`   | Build for production                 |
| `bun preview` | Preview the production build locally |
| `bun lint`    | Run ESLint                           |
| `bun format`  | Format code with Prettier            |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── app-header.tsx
│   ├── signal-tile.tsx
│   ├── sos-button.tsx
│   ├── status-badge.tsx
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
│   ├── use-safety-signals.ts   # Simulated signal stream generator
│   └── use-persistent.ts       # localStorage persistence hook
├── lib/                 # Utilities, types, and config
│   ├── types.ts
│   ├── defaults.ts
│   ├── storage.ts
│   └── config.server.ts
├── routes/              # TanStack Start file-based routes
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # Landing page
│   ├── dashboard.tsx    # Main safety hub
│   ├── monitor.tsx      # Live signal monitoring
│   ├── contacts.tsx     # Trusted contacts
│   ├── incidents.index.tsx   # Incident history
│   ├── incidents.$id.tsx     # Incident detail
│   └── settings.tsx     # Detection sensitivity & preferences
├── styles.css           # Tailwind CSS entry + design tokens
├── router.tsx           # TanStack Router configuration
└── start.ts             # TanStack Start server entry
```

## Design System

- **Palette**: Forest/emerald green, warm amber/orange, moss, and cream — an empowering, grounded, nature-forward palette
- **Typography**: Fraunces (display headings) + Inter (body text)
- **Tokens**: Defined in `src/styles.css` using OKLCH color space for perceptually uniform theming

## License

[MIT](LICENSE) — Built as a prototype for demonstration purposes.
