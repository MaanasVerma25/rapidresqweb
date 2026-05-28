export type Contact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  primary?: boolean;
};

export type SafetyStatus = "safe" | "elevated" | "critical";

export type Scenario = "normal" | "scream" | "fall" | "run" | "heart-spike";

export type AlertChannel = "sms" | "whatsapp" | "inapp";

export type IncidentAlert = {
  contactId: string;
  contactName: string;
  channel: AlertChannel;
  status: "queued" | "sent" | "delivered";
  at: number;
};

export type Incident = {
  id: string;
  startedAt: number;
  endedAt?: number;
  trigger: "manual" | Scenario;
  status: "active" | "resolved" | "cancelled";
  peakScore: number;
  location: { lat: number; lng: number; label: string };
  signalTrace: { t: number; audio: number; motion: number; bpm: number; score: number }[];
  alerts: IncidentAlert[];
};

export type Settings = {
  profile: { name: string; medicalNote: string; bloodType: string };
  thresholds: { audio: number; motion: number; bpm: number };
  channels: { sms: boolean; whatsapp: boolean; inapp: boolean };
};
