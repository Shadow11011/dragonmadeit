"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ContentConfig, Tier } from "@/types";
import { STORY_TYPE_CATALOGUE, MAX_STORY_TYPES, getFilteredStoryTypes } from "@/lib/content-config";

interface ContentConfigStepProps {
  config: ContentConfig;
  onConfigChange: (config: ContentConfig) => void;
  onBack: () => void;
  onContinue: () => void;
  /** When tier is "FREE", AI_IMAGES is locked behind an upgrade gate. */
  tier?: Tier;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const VIDEO_TYPES: {
  value: ContentConfig["videoType"];
  label: string;
  description: string;
}[] = [
  {
    value: "GAMEPLAY",
    label: "Gameplay Overlay",
    description:
      "Minecraft/Subway Surfers gameplay as background with narration overlay",
  },
  {
    value: "AI_IMAGES",
    label: "AI Image Slideshow",
    description:
      "AI-generated images stitched together with narration",
  },
];

const VOICE_OPTIONS: {
  value: ContentConfig["voiceType"];
  label: string;
  description: string;
}[] = [
  { value: "MALE", label: "Male", description: "Male narrator voice" },
  { value: "FEMALE", label: "Female", description: "Female narrator voice" },
  {
    value: "RANDOM",
    label: "Random",
    description: "Varies per video \u2014 unlocks all story types",
  },
];

export function ContentConfigStep({
  config,
  onConfigChange,
  onBack,
  onContinue,
  tier,
}: ContentConfigStepProps) {
  const [removedWarning, setRemovedWarning] = useState<string | null>(null);
  const isFree = tier === "FREE";

  const filteredStoryTypes = getFilteredStoryTypes(config.voiceType);
  const filteredIds = new Set(filteredStoryTypes.map((s) => s.id));

  // FREE cannot use AI_IMAGES; force-correct the selection if it slips through.
  useEffect(() => {
    if (isFree && config.videoType === "AI_IMAGES") {
      onConfigChange({ ...config, videoType: "GAMEPLAY" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFree]);

  // When voice changes, auto-deselect incompatible story types
  useEffect(() => {
    const incompatible = config.storyTypes.filter((id) => !filteredIds.has(id));
    if (incompatible.length > 0) {
      const voiceLabel =
        config.voiceType === "MALE"
          ? "Male"
          : config.voiceType === "FEMALE"
            ? "Female"
            : "Random";
      setRemovedWarning(
        `${incompatible.length} story type${incompatible.length > 1 ? "s were" : " was"} removed because ${incompatible.length > 1 ? "they require" : "it requires"} a different voice than ${voiceLabel}`
      );
      onConfigChange({
        ...config,
        storyTypes: config.storyTypes.filter((id) => filteredIds.has(id)),
      });

      const timer = setTimeout(() => setRemovedWarning(null), 4000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.voiceType]);

  const toggleStoryType = (id: string) => {
    const isSelected = config.storyTypes.includes(id);
    let newStoryTypes: string[];

    if (isSelected) {
      newStoryTypes = config.storyTypes.filter((s) => s !== id);
    } else if (config.storyTypes.length < MAX_STORY_TYPES) {
      newStoryTypes = [...config.storyTypes, id];
    } else {
      // At limit, don't add
      return;
    }

    onConfigChange({ ...config, storyTypes: newStoryTypes });
  };

  const canContinue = config.storyTypes.length >= 1;
  const atMax = config.storyTypes.length >= MAX_STORY_TYPES;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Configure Your Content</h2>
        <p className="text-text-secondary text-sm mt-1">
          Choose what kind of videos get posted. You can change this anytime
          after setup.
        </p>
      </div>

      {/* Video Type Selector */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Video type
          {isFree && (
            <span className="ml-2 text-xs text-text-secondary font-normal">
              (Free tier — gameplay only)
            </span>
          )}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VIDEO_TYPES.map((vt) => {
            const isSelected = config.videoType === vt.value;
            const isLocked = isFree && vt.value === "AI_IMAGES";
            return (
              <button
                key={vt.value}
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isLocked) return;
                  onConfigChange({ ...config, videoType: vt.value });
                }}
                className={cn(
                  "relative rounded-xl border-2 bg-bg-primary p-5 text-left transition-all",
                  isLocked
                    ? "border-border opacity-60 cursor-not-allowed"
                    : isSelected
                      ? "border-accent-fire ring-2 ring-accent-fire/20"
                      : "border-border hover:border-accent-fire/30"
                )}
              >
                {isLocked && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-accent-gold/15 border border-accent-gold/40 px-2 py-0.5">
                    <svg
                      className="h-3 w-3 text-accent-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold">
                      Paid
                    </span>
                  </div>
                )}
                {isSelected && !isLocked && (
                  <div className="absolute top-3 right-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-fire">
                      <CheckIcon className="h-3.5 w-3.5 text-bg-primary" />
                    </div>
                  </div>
                )}
                <h3 className="text-sm font-bold text-text-primary">
                  {vt.label}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {vt.description}
                </p>
                {isLocked && (
                  <p className="text-xs text-accent-gold mt-2 font-medium">
                    Upgrade to any paid tier to unlock AI-image niches.
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Selector */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          Narrator voice
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VOICE_OPTIONS.map((vo) => {
            const isSelected = config.voiceType === vo.value;
            return (
              <button
                key={vo.value}
                type="button"
                onClick={() =>
                  onConfigChange({ ...config, voiceType: vo.value })
                }
                className={cn(
                  "relative rounded-xl border-2 bg-bg-primary p-4 text-left transition-all",
                  isSelected
                    ? "border-accent-fire ring-2 ring-accent-fire/20"
                    : "border-border hover:border-accent-fire/30"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-fire">
                      <CheckIcon className="h-3 w-3 text-bg-primary" />
                    </div>
                  </div>
                )}
                <h3 className="text-sm font-bold text-text-primary">
                  {vo.label}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {vo.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice-change warning */}
      <AnimatePresence>
        {removedWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-warning/10 border border-warning/20 px-4 py-3 text-sm text-warning flex items-start gap-2">
              <svg
                className="h-5 w-5 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{removedWarning}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Type Picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-text-primary">
            Story types
          </label>
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              atMax
                ? "bg-accent-fire/15 text-accent-fire"
                : "bg-bg-tertiary text-text-secondary"
            )}
          >
            {config.storyTypes.length}/{MAX_STORY_TYPES} selected
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {STORY_TYPE_CATALOGUE.map((st) => {
            const isAvailable = filteredIds.has(st.id);
            const isSelected = config.storyTypes.includes(st.id);
            const isDimmed = atMax && !isSelected;

            return (
              <button
                key={st.id}
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  if (isAvailable) toggleStoryType(st.id);
                }}
                className={cn(
                  "relative rounded-xl border-2 bg-bg-primary p-4 text-left transition-all",
                  isSelected
                    ? "border-accent-fire ring-2 ring-accent-fire/20"
                    : isAvailable
                      ? "border-border hover:border-accent-fire/30"
                      : "border-border opacity-40 cursor-not-allowed",
                  isDimmed && isAvailable && "opacity-50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-fire">
                      <CheckIcon className="h-3 w-3 text-bg-primary" />
                    </div>
                  </div>
                )}
                <div className="text-lg mb-1">{st.emoji}</div>
                <h3 className="text-sm font-bold text-text-primary">
                  {st.name}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                  {st.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Randomize Toggle */}
      <div className="flex items-center justify-between rounded-xl bg-bg-secondary border border-border p-4">
        <div>
          <p className="text-sm font-medium text-text-primary">
            Randomize story selection
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Randomly pick from your selected types for each video
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.randomizeStories}
          onClick={() =>
            onConfigChange({
              ...config,
              randomizeStories: !config.randomizeStories,
            })
          }
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            config.randomizeStories ? "bg-accent-fire" : "bg-bg-tertiary"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
              config.randomizeStories ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          disabled={!canContinue}
          onClick={onContinue}
          className="fire-gradient text-white"
          size="lg"
        >
          Continue to Schedule
        </Button>
      </div>
    </div>
  );
}
