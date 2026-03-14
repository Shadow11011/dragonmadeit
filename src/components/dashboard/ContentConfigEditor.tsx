"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { ContentConfig } from "@/types";
import { STORY_TYPE_CATALOGUE, MAX_STORY_TYPES, getFilteredStoryTypes } from "@/lib/content-config";

interface ContentConfigEditorProps {
  accountId: string;
  initialConfig: ContentConfig;
  onSaved?: () => void;
  onCancel?: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export function ContentConfigEditor({
  accountId,
  initialConfig,
  onSaved,
  onCancel,
}: ContentConfigEditorProps) {
  const [config, setConfig] = useState<ContentConfig>({
    videoType: initialConfig.videoType ?? "GAMEPLAY",
    voiceType: initialConfig.voiceType ?? "RANDOM",
    storyTypes: Array.isArray(initialConfig.storyTypes) ? initialConfig.storyTypes : [],
    randomizeStories: initialConfig.randomizeStories ?? true,
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredStoryTypes = getFilteredStoryTypes(config.voiceType);
  const filteredIds = new Set(filteredStoryTypes.map((s) => s.id));

  const handleVideoTypeChange = useCallback(
    (videoType: ContentConfig["videoType"]) => {
      setConfig((prev) => ({ ...prev, videoType }));
      setSaveStatus("idle");
    },
    []
  );

  const handleVoiceChange = useCallback(
    (voiceType: ContentConfig["voiceType"]) => {
      setConfig((prev) => {
        const newFiltered = getFilteredStoryTypes(voiceType);
        const validIds = new Set(newFiltered.map((s) => s.id));
        const updatedStoryTypes = prev.storyTypes.filter((id) =>
          validIds.has(id)
        );
        return { ...prev, voiceType, storyTypes: updatedStoryTypes };
      });
      setSaveStatus("idle");
    },
    []
  );

  const handleStoryToggle = useCallback(
    (storyId: string) => {
      setConfig((prev) => {
        const isSelected = prev.storyTypes.includes(storyId);
        if (isSelected) {
          return {
            ...prev,
            storyTypes: prev.storyTypes.filter((id) => id !== storyId),
          };
        }
        if (prev.storyTypes.length >= MAX_STORY_TYPES) return prev;
        return { ...prev, storyTypes: [...prev.storyTypes, storyId] };
      });
      setSaveStatus("idle");
    },
    []
  );

  const handleRandomizeToggle = useCallback(() => {
    setConfig((prev) => ({ ...prev, randomizeStories: !prev.randomizeStories }));
    setSaveStatus("idle");
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/tiktok-accounts/${accountId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        const errData = data as { error?: string };
        throw new Error(errData.error ?? "Failed to save content configuration");
      }

      setSaveStatus("success");
      onSaved?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save content configuration";
      setErrorMessage(message);
      setSaveStatus("error");
    }
  }, [accountId, config, onSaved]);

  // Check if voice change caused story deselections
  const initialStoryTypes = Array.isArray(initialConfig.storyTypes) ? initialConfig.storyTypes : [];
  const droppedCount =
    initialConfig.voiceType !== config.voiceType
      ? initialStoryTypes.filter((id) => !filteredIds.has(id)).length
      : 0;

  return (
    <div className="space-y-8">
      {/* Video Type Selector */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          Video Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleVideoTypeChange("GAMEPLAY")}
            className={cn(
              "rounded-xl border p-5 text-left transition-all",
              config.videoType === "GAMEPLAY"
                ? "border-accent-fire ring-2 ring-accent-fire/20 bg-accent-fire/5"
                : "border-border bg-bg-secondary hover:border-accent-fire/30"
            )}
          >
            <div className="text-2xl mb-2">🎮</div>
            <p className="font-semibold text-text-primary">Gameplay Overlay</p>
            <p className="text-xs text-text-secondary mt-1">
              Minecraft/Subway Surfers gameplay with narration
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleVideoTypeChange("AI_IMAGES")}
            className={cn(
              "rounded-xl border p-5 text-left transition-all",
              config.videoType === "AI_IMAGES"
                ? "border-accent-fire ring-2 ring-accent-fire/20 bg-accent-fire/5"
                : "border-border bg-bg-secondary hover:border-accent-fire/30"
            )}
          >
            <div className="text-2xl mb-2">🖼️</div>
            <p className="font-semibold text-text-primary">
              AI Image Slideshow
            </p>
            <p className="text-xs text-text-secondary mt-1">
              AI-generated images stitched together with narration
            </p>
          </button>
        </div>
      </section>

      {/* Voice Selector */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Voice</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["MALE", "FEMALE", "RANDOM"] as const).map((voice) => (
            <button
              key={voice}
              type="button"
              onClick={() => handleVoiceChange(voice)}
              className={cn(
                "rounded-xl border p-4 text-center transition-all",
                config.voiceType === voice
                  ? "border-accent-fire ring-2 ring-accent-fire/20 bg-accent-fire/5"
                  : "border-border bg-bg-secondary hover:border-accent-fire/30"
              )}
            >
              <div className="text-xl mb-1">
                {voice === "MALE" ? "🗣️" : voice === "FEMALE" ? "👩" : "🎲"}
              </div>
              <p className="text-sm font-medium text-text-primary capitalize">
                {voice.toLowerCase()}
              </p>
            </button>
          ))}
        </div>

        {/* Voice change warning */}
        <AnimatePresence>
          {droppedCount > 0 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-warning mt-2"
            >
              {droppedCount} incompatible story type
              {droppedCount > 1 ? "s were" : " was"} deselected due to voice
              change.
            </motion.p>
          )}
        </AnimatePresence>
      </section>

      {/* Story Type Picker */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary">
            Story Types
          </h3>
          <span
            className={cn(
              "text-sm font-medium",
              config.storyTypes.length >= MAX_STORY_TYPES
                ? "text-accent-fire"
                : "text-text-secondary"
            )}
          >
            {config.storyTypes.length}/{MAX_STORY_TYPES} selected
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {STORY_TYPE_CATALOGUE.map((story) => {
            const isAvailable = filteredIds.has(story.id);
            const isSelected = config.storyTypes.includes(story.id);
            const isMaxed =
              config.storyTypes.length >= MAX_STORY_TYPES && !isSelected;

            return (
              <button
                key={story.id}
                type="button"
                disabled={!isAvailable || isMaxed}
                onClick={() => handleStoryToggle(story.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-accent-fire ring-2 ring-accent-fire/20 bg-accent-fire/5"
                    : "border-border bg-bg-secondary",
                  !isAvailable
                    ? "opacity-40 cursor-not-allowed"
                    : isMaxed
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:border-accent-fire/30"
                )}
              >
                <div className="text-lg mb-1">{story.emoji}</div>
                <p className="text-sm font-medium text-text-primary">
                  {story.name}
                </p>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                  {story.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Randomize Toggle */}
      <section>
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            role="switch"
            aria-checked={config.randomizeStories}
            onClick={handleRandomizeToggle}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
              config.randomizeStories ? "bg-accent-fire" : "bg-border"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                config.randomizeStories ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Randomize story order
            </p>
            <p className="text-xs text-text-secondary">
              Shuffle story types each cycle instead of posting in order
            </p>
          </div>
        </label>
      </section>

      {/* Status Messages */}
      <AnimatePresence>
        {saveStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success"
          >
            Content configuration updated!
          </motion.div>
        )}
        {saveStatus === "error" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="fire-gradient text-white glow-fire"
          disabled={saveStatus === "saving" || config.storyTypes.length === 0}
          onClick={() => void handleSave()}
        >
          {saveStatus === "saving" ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
