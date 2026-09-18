"use client";

import { motion } from "motion/react";
import { Button } from "@/components/button-link";
import { OptionChip } from "@/components/wardrobe/option-chip";
import { editorialEase } from "@/lib/motion";
import {
  occasions,
  styleDirections,
  weatherOptions,
  type Occasion,
  type StyleDirection,
  type StylingPreferences,
  type Weather,
} from "@/types/garment";

export function PreferencesStage({
  preferences,
  error,
  canContinue,
  onToggleOccasion,
  onWeather,
  onStyle,
  onContinue,
}: {
  preferences: StylingPreferences;
  error: string | null;
  canContinue: boolean;
  onToggleOccasion: (occasion: Occasion) => void;
  onWeather: (weather: Weather) => void;
  onStyle: (style: StyleDirection) => void;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.7, ease: editorialEase }}
      className="max-w-4xl"
    >
      <p className="label text-olive mb-5">Context</p>
      <h1 className="font-serif text-headline text-olive text-balance">
        Where are you wearing it?
      </h1>
      <p className="text-ink mt-6 max-w-2xl text-[1.05rem] leading-relaxed">
        Give us a little context. REWEAR will eventually use this together with
        your wardrobe to build combinations that fit the situation.
      </p>

      <fieldset className="mt-14 border-0 p-0">
        <legend className="label text-olive mb-5">Occasions</legend>
        <div className="flex flex-wrap gap-3">
          {occasions.map((occasion) => (
            <OptionChip
              key={occasion.id}
              label={occasion.label}
              selected={preferences.occasions.includes(occasion.id)}
              onClick={() => onToggleOccasion(occasion.id)}
              role="checkbox"
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-12 border-0 p-0">
        <legend className="label text-olive mb-5">Weather</legend>
        <div
          role="radiogroup"
          aria-label="Weather"
          className="flex flex-wrap gap-3"
        >
          {weatherOptions.map((option) => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={preferences.weather === option.id}
              onClick={() => onWeather(option.id)}
              role="radio"
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-12 border-0 p-0">
        <legend className="label text-olive mb-5">Style direction</legend>
        <div
          role="radiogroup"
          aria-label="Style direction"
          className="flex flex-wrap gap-3"
        >
          {styleDirections.map((option) => (
            <OptionChip
              key={option.id}
              label={option.label}
              selected={preferences.styleDirection === option.id}
              onClick={() => onStyle(option.id)}
              role="radio"
            />
          ))}
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="text-umber mt-8 text-sm">
          {error}
        </p>
      ) : null}

      <div className="mt-12">
        <Button onClick={onContinue} disabled={!canContinue}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
