import { useCallback, useEffect, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { DEFAULT_SETTINGS, SAMPLE_CONTACTS, DEFAULT_LOCATION, STORAGE_KEYS } from "@/lib/defaults";
import type {
  Contact,
  Incident,
  Settings,
  UserLocation,
  Scenario,
  IncidentAlert,
} from "@/lib/types";
import { supabase } from "@/lib/supabase";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() =>
    loadJSON<Contact[]>(STORAGE_KEYS.contacts, SAMPLE_CONTACTS),
  );

  useEffect(() => {
    saveJSON(STORAGE_KEYS.contacts, contacts);
  }, [contacts]);

  // Sync from Supabase on mount
  useEffect(() => {
    async function sync() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", session.user.id);

      if (data && !error) {
        const synced = data.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship,
          primary: c.is_primary || false,
        }));
        setContacts(synced);
      }
    }
    sync();
  }, []);

  const upsert = useCallback((c: Contact) => {
    setContacts((prev) => {
      const exists = prev.some((x) => x.id === c.id);
      const next = exists ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c];
      if (c.primary) return next.map((x) => ({ ...x, primary: x.id === c.id }));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const setPrimary = useCallback((id: string) => {
    setContacts((prev) => prev.map((c) => ({ ...c, primary: c.id === id })));
  }, []);

  return { contacts, upsert, remove, setPrimary };
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    loadJSON<Incident[]>(STORAGE_KEYS.incidents, []),
  );

  useEffect(() => {
    saveJSON(STORAGE_KEYS.incidents, incidents);
  }, [incidents]);

  // Sync from Supabase on mount
  useEffect(() => {
    async function sync() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("user_id", session.user.id)
        .order("started_at", { ascending: false });

      if (data && !error) {
        const synced: Incident[] = data.map((i) => ({
          id: i.id,
          startedAt: new Date(i.started_at).getTime(),
          endedAt: i.ended_at ? new Date(i.ended_at).getTime() : undefined,
          trigger: i.trigger as Scenario | "manual",
          status: i.status as "active" | "resolved" | "cancelled",
          peakScore: Number(i.peak_score),
          location: i.location as { lat: number; lng: number; label: string },
          signalTrace:
            (i.signal_trace as {
              t: number;
              audio: number;
              motion: number;
              bpm: number;
              score: number;
            }[]) || [],
          alerts: (i.alerts as IncidentAlert[]) || [],
        }));
        setIncidents(synced);
      }
    }
    sync();
  }, []);

  const add = useCallback((i: Incident) => setIncidents((prev) => [i, ...prev]), []);
  const update = useCallback(
    (id: string, patch: Partial<Incident>) =>
      setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    [],
  );

  return { incidents, add, update };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() =>
    loadJSON<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  );

  useEffect(() => {
    saveJSON(STORAGE_KEYS.settings, settings);
  }, [settings]);

  // Sync from Supabase on mount
  useEffect(() => {
    async function sync() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch profile and settings
      const [profileRes, settingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("user_settings").select("*").eq("user_id", session.user.id).single(),
      ]);

      if (!profileRes.error || !settingsRes.error) {
        setSettings((prev) => ({
          ...prev,
          profile: {
            name: profileRes.data?.name || prev.profile.name,
            medicalNote: profileRes.data?.medical_note || prev.profile.medicalNote,
            bloodType: profileRes.data?.blood_type || prev.profile.bloodType,
          },
          thresholds: (settingsRes.data?.thresholds as Settings["thresholds"]) || prev.thresholds,
          channels: (settingsRes.data?.channels as Settings["channels"]) || prev.channels,
        }));
      }
    }
    sync();
  }, []);

  return { settings, setSettings };
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>(() =>
    loadJSON<UserLocation>(STORAGE_KEYS.location, DEFAULT_LOCATION),
  );
  useEffect(() => saveJSON(STORAGE_KEYS.location, location), [location]);
  return { location, setLocation };
}
