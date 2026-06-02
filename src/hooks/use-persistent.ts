import { useCallback, useEffect, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { DEFAULT_SETTINGS, SAMPLE_CONTACTS, DEFAULT_LOCATION, STORAGE_KEYS } from "@/lib/defaults";
import type { Contact, Incident, Settings, UserLocation } from "@/lib/types";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() =>
    loadJSON<Contact[]>(STORAGE_KEYS.contacts, SAMPLE_CONTACTS),
  );
  useEffect(() => saveJSON(STORAGE_KEYS.contacts, contacts), [contacts]);

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
  useEffect(() => saveJSON(STORAGE_KEYS.incidents, incidents), [incidents]);

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
  useEffect(() => saveJSON(STORAGE_KEYS.settings, settings), [settings]);
  return { settings, setSettings };
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>(() =>
    loadJSON<UserLocation>(STORAGE_KEYS.location, DEFAULT_LOCATION),
  );
  useEffect(() => saveJSON(STORAGE_KEYS.location, location), [location]);
  return { location, setLocation };
}

