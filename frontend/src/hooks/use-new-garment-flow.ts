"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { analyzeGarment } from "@/lib/analysis/analyze-garment";
import type { AnalysisProgress } from "@/lib/analysis/types";
import { validateGarmentFile } from "@/lib/garment-file";
import { useObjectUrl } from "@/hooks/use-object-url";
import { saveGarment, WardrobeError } from "@/lib/wardrobe/garments";
import type {
  FlowStep,
  GarmentAnalysis,
  Occasion,
  StyleDirection,
  StylingPreferences,
  Weather,
} from "@/types/garment";

const emptyPreferences: StylingPreferences = {
  occasions: [],
  weather: null,
  styleDirection: null,
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useNewGarmentFlow() {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState<FlowStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GarmentAnalysis | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [preferences, setPreferences] =
    useState<StylingPreferences>(emptyPreferences);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const savingRef = useRef(false);
  const previewUrl = useObjectUrl(file);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const selectFile = (nextFile: File) => {
    const message = validateGarmentFile(nextFile);
    if (message) {
      setError(message);
      return;
    }

    abortRef.current?.abort();
    setError(null);
    setAnalysis(null);
    setProgress(null);
    setFile(nextFile);
    setStep("preview");
  };

  const removeFile = () => {
    abortRef.current?.abort();
    setFile(null);
    setAnalysis(null);
    setProgress(null);
    setError(null);
    setStep("upload");
  };

  const analyzePiece = async () => {
    if (!file) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setProgress(null);
    setStep("analyzing");

    try {
      const result = await analyzeGarment(
        { file },
        {
          signal: controller.signal,
          stepDelayMs: prefersReducedMotion ? 80 : 1400,
          onProgress: setProgress,
        },
      );

      setAnalysis(result);
      setStep("details");
    } catch (caught) {
      if (isAbortError(caught) || controller.signal.aborted) {
        return;
      }

      setError("We couldn’t analyze that piece. Try another photo.");
      setStep("preview");
    }
  };

  const startOver = () => {
    abortRef.current?.abort();
    setFile(null);
    setAnalysis(null);
    setProgress(null);
    setPreferences(emptyPreferences);
    setError(null);
    setSaving(false);
    savingRef.current = false;
    setStep("upload");
  };

  const updateAnalysisField = (
    key: keyof GarmentAnalysis,
    value: string,
  ) => {
    setAnalysis((current) =>
      current ? { ...current, [key]: value } : current,
    );
  };

  const confirmDetails = async () => {
    if (!analysis || !file || savingRef.current) {
      return;
    }

    if (!analysis.category.trim() || !analysis.primaryColor.trim()) {
      setError("Category and primary color are required.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      await saveGarment({ file, analysis });
      setStep("preferences");
    } catch (caught) {
      setError(
        caught instanceof WardrobeError
          ? caught.message
          : "We couldn’t save that piece. Try again.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const toggleOccasion = (occasion: Occasion) => {
    setPreferences((current) => {
      const exists = current.occasions.includes(occasion);
      return {
        ...current,
        occasions: exists
          ? current.occasions.filter((item) => item !== occasion)
          : [...current.occasions, occasion],
      };
    });
  };

  const setWeather = (weather: Weather) => {
    setPreferences((current) => ({ ...current, weather }));
  };

  const setStyleDirection = (styleDirection: StyleDirection) => {
    setPreferences((current) => ({ ...current, styleDirection }));
  };

  const canContinue =
    preferences.occasions.length > 0 &&
    preferences.weather !== null &&
    preferences.styleDirection !== null;

  const complete = () => {
    if (!canContinue) {
      setError("Choose at least one occasion, a weather, and a style.");
      return;
    }

    setError(null);
    setStep("complete");
  };

  return {
    step,
    file,
    previewUrl,
    error,
    analysis,
    progress,
    preferences,
    canContinue,
    saving,
    selectFile,
    removeFile,
    analyzePiece,
    startOver,
    updateAnalysisField,
    confirmDetails,
    toggleOccasion,
    setWeather,
    setStyleDirection,
    complete,
  };
}
