import { useEffect, useRef, useState } from "react";
import type { Scenario, SafetyStatus } from "@/lib/types";

export type SignalSample = {
  t: number;
  audio: number; // 0-1
  motion: number; // 0-1
  bpm: number; // beats per minute
  score: number; // 0-1
};

type Options = {
  thresholds: { audio: number; motion: number; bpm: number };
  enabled: boolean;
};

const HISTORY = 60;

// Map scenario to bias values for the generator.
function scenarioBias(s: Scenario) {
  switch (s) {
    case "scream":
      return { audio: 0.92, motion: 0.45, bpm: 138 };
    case "fall":
      return { audio: 0.55, motion: 0.95, bpm: 128 };
    case "run":
      return { audio: 0.35, motion: 0.85, bpm: 152 };
    case "heart-spike":
      return { audio: 0.25, motion: 0.3, bpm: 168 };
    default:
      return { audio: 0.18, motion: 0.22, bpm: 78 };
  }
}

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

export function useSafetySignals({ thresholds, enabled }: Options) {
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [samples, setSamples] = useState<SignalSample[]>(() => {
    const now = Date.now();
    return Array.from({ length: HISTORY }, (_, i) => ({
      t: now - (HISTORY - i) * 500,
      audio: 0.15,
      motion: 0.18,
      bpm: 76,
      score: 0,
    }));
  });

  const scenarioRef = useRef(scenario);
  scenarioRef.current = scenario;

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      const bias = scenarioBias(scenarioRef.current);
      const jitter = () => (Math.random() - 0.5) * 0.12;
      const audio = clamp(bias.audio + jitter());
      const motion = clamp(bias.motion + jitter());
      const bpm = Math.round(bias.bpm + (Math.random() - 0.5) * 8);

      // Weighted anomaly score against thresholds
      const audioScore = clamp(audio / Math.max(thresholds.audio, 0.01));
      const motionScore = clamp(motion / Math.max(thresholds.motion, 0.01));
      const bpmScore = clamp((bpm - 70) / Math.max(thresholds.bpm - 70, 1));
      const score = clamp(audioScore * 0.4 + motionScore * 0.4 + bpmScore * 0.2);

      setSamples((prev) => {
        const next = [...prev.slice(1), { t: Date.now(), audio, motion, bpm, score }];
        return next;
      });
    }, 500);
    return () => clearInterval(id);
  }, [enabled, thresholds.audio, thresholds.motion, thresholds.bpm]);

  const latest = samples[samples.length - 1];
  const status: SafetyStatus =
    latest.score >= 0.85 ? "critical" : latest.score >= 0.55 ? "elevated" : "safe";

  return { samples, latest, status, scenario, setScenario };
}
