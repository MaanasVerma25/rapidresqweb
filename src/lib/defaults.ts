import type { Settings, Contact } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  profile: { name: "", medicalNote: "", bloodType: "" },
  thresholds: { audio: 0.7, motion: 0.7, bpm: 130 },
  channels: { sms: true, whatsapp: true, inapp: true },
};

export const SAMPLE_CONTACTS: Contact[] = [
  { id: "c1", name: "Mom", phone: "+1 555 0101", relationship: "Family", primary: true },
  { id: "c2", name: "Aisha", phone: "+1 555 0102", relationship: "Best friend" },
];

export const STORAGE_KEYS = {
  contacts: "rapidresq:contacts",
  incidents: "rapidresq:incidents",
  settings: "rapidresq:settings",
} as const;
