import { z } from "zod";
import type { StoryTypeConfig, GenderRestriction, ContentConfig } from "@/types";

/** Maximum number of story types a user can select */
export const MAX_STORY_TYPES = 5;

/**
 * Full catalogue of available story types.
 * Each entry has a gender restriction that determines visibility
 * based on the selected voice type.
 */
export const STORY_TYPE_CATALOGUE: StoryTypeConfig[] = [
  {
    id: "breakup",
    name: "Breakup Stories",
    emoji: "\u{1F494}",
    genderRestriction: "any",
    description: "Heartbreak tales that hook viewers",
  },
  {
    id: "success",
    name: "Success Stories",
    emoji: "\u{1F3C6}",
    genderRestriction: "any",
    description: "Rags-to-riches triumph narratives",
  },
  {
    id: "horror",
    name: "Horror Stories",
    emoji: "\u{1F47B}",
    genderRestriction: "any",
    description: "Creepy, unsettling tales",
  },
  {
    id: "revenge",
    name: "Revenge Stories",
    emoji: "\u2694\uFE0F",
    genderRestriction: "any",
    description: "Sweet payback narratives",
  },
  {
    id: "motivational",
    name: "Motivational Stories",
    emoji: "\u{1F525}",
    genderRestriction: "any",
    description: "Inspirational push-through stories",
  },
  {
    id: "mystery",
    name: "Mystery / Thriller",
    emoji: "\u{1F50D}",
    genderRestriction: "any",
    description: "Whodunnit and suspense stories",
  },
  {
    id: "alien",
    name: "Alien / Sci-Fi",
    emoji: "\u{1F47D}",
    genderRestriction: "any",
    description: "Extraterrestrial encounters",
  },
  {
    id: "human-achievement",
    name: "Human Achievement",
    emoji: "\u{1F30D}",
    genderRestriction: "any",
    description: "Incredible feats of humanity",
  },
  {
    id: "survival",
    name: "Survival Stories",
    emoji: "\u{1F3D4}\uFE0F",
    genderRestriction: "any",
    description: "Against-all-odds survival tales",
  },
  {
    id: "urban-legends",
    name: "Urban Legends",
    emoji: "\u{1F319}",
    genderRestriction: "any",
    description: "Modern myths and legends",
  },
  {
    id: "true-crime",
    name: "True Crime",
    emoji: "\u{1F50E}",
    genderRestriction: "any",
    description: "Criminal investigations",
  },
  {
    id: "betrayal",
    name: "Betrayal Stories",
    emoji: "\u{1F5E1}\uFE0F",
    genderRestriction: "any",
    description: "Trust broken tales",
  },
  {
    id: "workplace",
    name: "Workplace Drama",
    emoji: "\u{1F3E2}",
    genderRestriction: "any",
    description: "Office politics and career chaos",
  },
  {
    id: "confession",
    name: "Confessions",
    emoji: "\u{1F92B}",
    genderRestriction: "any",
    description: "Deep secrets and confessions",
  },
  {
    id: "petty",
    name: "Petty Stories",
    emoji: "\u2615",
    genderRestriction: "any",
    description: "Deliciously petty everyday drama",
  },
  {
    id: "brotherhood",
    name: "Brotherhood Stories",
    emoji: "\u{1F91D}",
    genderRestriction: "male_only",
    description: "Male friendship and loyalty",
  },
  {
    id: "girl-boss",
    name: "Girl Boss Stories",
    emoji: "\u{1F451}",
    genderRestriction: "female_only",
    description: "Female empowerment and career wins",
  },
  {
    id: "locker-room",
    name: "Locker Room Stories",
    emoji: "\u{1F4AA}",
    genderRestriction: "male_only",
    description: "Male-specific humor and tales",
  },
  {
    id: "sisterhood",
    name: "Sisterhood Stories",
    emoji: "\u{1F46F}",
    genderRestriction: "female_only",
    description: "Female friendship and bonding",
  },
  {
    id: "dating-male",
    name: "Dating Stories (His POV)",
    emoji: "\u{1F4AC}",
    genderRestriction: "male_only",
    description: "Dating from male perspective",
  },
  {
    id: "dating-female",
    name: "Dating Stories (Her POV)",
    emoji: "\u{1F4AC}",
    genderRestriction: "female_only",
    description: "Dating from female perspective",
  },

  // ─── MALE-ONLY (expanded) ────────────────────────────────────
  {
    id: "gym-bro",
    name: "Gym Culture Stories",
    emoji: "\u{1F3CB}\uFE0F",
    genderRestriction: "male_only",
    description: "Gym fails, PRs, and iron therapy",
  },
  {
    id: "sigma-grind",
    name: "Sigma Grindset",
    emoji: "\u{1F43A}",
    genderRestriction: "male_only",
    description: "Lone wolf hustle and mindset tales",
  },
  {
    id: "finance-bro",
    name: "Finance Bro Stories",
    emoji: "\u{1F4C8}",
    genderRestriction: "male_only",
    description: "Money moves, trades, and bag chasing",
  },
  {
    id: "military",
    name: "Military Stories",
    emoji: "\u{1F396}\uFE0F",
    genderRestriction: "male_only",
    description: "Service life, deployment, and valor",
  },
  {
    id: "car-culture",
    name: "Car Culture Stories",
    emoji: "\u{1F3CE}\uFE0F",
    genderRestriction: "male_only",
    description: "Builds, races, and car meet chaos",
  },
  {
    id: "gaming-clutch",
    name: "Gaming Clutch Moments",
    emoji: "\u{1F3AE}",
    genderRestriction: "male_only",
    description: "Legendary plays and rage quit tales",
  },
  {
    id: "combat-sports",
    name: "Combat Sports Stories",
    emoji: "\u{1F94A}",
    genderRestriction: "male_only",
    description: "MMA, boxing, and fight night drama",
  },
  {
    id: "dad-life",
    name: "Dad Life Stories",
    emoji: "\u{1F468}\u200D\u{1F467}",
    genderRestriction: "male_only",
    description: "Fatherhood wins, fails, and wisdom",
  },
  {
    id: "side-hustle",
    name: "Side Hustle Stories",
    emoji: "\u{1F4B0}",
    genderRestriction: "male_only",
    description: "From zero to passive income tales",
  },
  {
    id: "street-smarts",
    name: "Street Smarts",
    emoji: "\u{1F9E0}",
    genderRestriction: "male_only",
    description: "Hard lessons from the real world",
  },
  {
    id: "sports-glory",
    name: "Sports Glory Stories",
    emoji: "\u26BD",
    genderRestriction: "male_only",
    description: "Underdog wins and legendary moments",
  },
  {
    id: "anime-irl",
    name: "Anime IRL Stories",
    emoji: "\u26A1",
    genderRestriction: "male_only",
    description: "When real life hits like anime",
  },
  {
    id: "barber-chair",
    name: "Barber Chair Stories",
    emoji: "\u{1F488}",
    genderRestriction: "male_only",
    description: "Wild tales from the barbershop",
  },
  {
    id: "close-call",
    name: "Close Call Stories",
    emoji: "\u{1F624}",
    genderRestriction: "male_only",
    description: "Almost got caught or almost died",
  },
  {
    id: "bro-code",
    name: "Bro Code Stories",
    emoji: "\u{1F91C}",
    genderRestriction: "male_only",
    description: "When the boys had your back",
  },

  // ─── FEMALE-ONLY (expanded) ───────────────────────────────────
  {
    id: "healing-era",
    name: "Healing Era Stories",
    emoji: "\u{1F98B}",
    genderRestriction: "female_only",
    description: "Post-breakup glow-up journeys",
  },
  {
    id: "wedding-drama",
    name: "Wedding Drama",
    emoji: "\u{1F492}",
    genderRestriction: "female_only",
    description: "Bridezillas, crashers, and chaos",
  },
  {
    id: "toxic-friends",
    name: "Toxic Friendship Stories",
    emoji: "\u{1F40D}",
    genderRestriction: "female_only",
    description: "Fake friends and friendship breakups",
  },
  {
    id: "beauty-tea",
    name: "Beauty Community Tea",
    emoji: "\u{1F484}",
    genderRestriction: "female_only",
    description: "Beauty drama and influencer gossip",
  },
  {
    id: "mom-life",
    name: "Motherhood Stories",
    emoji: "\u{1F37C}",
    genderRestriction: "female_only",
    description: "Raw truths of being a mom",
  },
  {
    id: "situationship",
    name: "Situationship Stories",
    emoji: "\u{1FAE0}",
    genderRestriction: "female_only",
    description: "Almost-relationships and mixed signals",
  },
  {
    id: "glow-up",
    name: "Glow Up Stories",
    emoji: "\u2728",
    genderRestriction: "female_only",
    description: "Transformation arcs and revenge looks",
  },
  {
    id: "mean-girl",
    name: "Mean Girl Encounters",
    emoji: "\u{1F608}",
    genderRestriction: "female_only",
    description: "Surviving real-life mean girls",
  },
  {
    id: "hot-girl-walk",
    name: "Hot Girl Walk Stories",
    emoji: "\u{1F6B6}\u200D\u2640\uFE0F",
    genderRestriction: "female_only",
    description: "Self-care and main character energy",
  },
  {
    id: "roommate-horror",
    name: "Roommate Horror Stories",
    emoji: "\u{1F3E0}",
    genderRestriction: "female_only",
    description: "Nightmare roommate experiences",
  },
  {
    id: "red-flag",
    name: "Red Flag Stories",
    emoji: "\u{1F6A9}",
    genderRestriction: "female_only",
    description: "Dating red flags spotted too late",
  },
  {
    id: "mother-in-law",
    name: "Mother-in-Law Stories",
    emoji: "\u{1F440}",
    genderRestriction: "female_only",
    description: "In-law drama and boundary battles",
  },
  {
    id: "pick-me",
    name: "Pick-Me Encounters",
    emoji: "\u{1F644}",
    genderRestriction: "female_only",
    description: "Cringe pick-me behavior spotted",
  },
  {
    id: "era-stories",
    name: "My __ Era Stories",
    emoji: "\u{1F485}",
    genderRestriction: "female_only",
    description: "Villain era, soft girl, boss era tales",
  },
  {
    id: "spill-the-tea",
    name: "Spill the Tea",
    emoji: "\u{1F375}",
    genderRestriction: "female_only",
    description: "GRWM gossip and hot takes",
  },

  // ─── GENDER-NEUTRAL (expanded) ───────────────────────────────
  {
    id: "aita",
    name: "AITA Stories",
    emoji: "\u2696\uFE0F",
    genderRestriction: "any",
    description: "Am I the villain? You decide",
  },
  {
    id: "conspiracy",
    name: "Conspiracy Theories",
    emoji: "\u{1F53A}",
    genderRestriction: "any",
    description: "Deep rabbit holes and hidden truths",
  },
  {
    id: "glitch-matrix",
    name: "Glitch in the Matrix",
    emoji: "\u{1F300}",
    genderRestriction: "any",
    description: "Reality-breaking moments",
  },
  {
    id: "medical-drama",
    name: "Medical Drama Stories",
    emoji: "\u{1F3E5}",
    genderRestriction: "any",
    description: "ER nightmares and diagnosis shocks",
  },
  {
    id: "neighbor-drama",
    name: "Neighbor Drama",
    emoji: "\u{1F3D8}\uFE0F",
    genderRestriction: "any",
    description: "Feuds over fences and boundaries",
  },
  {
    id: "family-feud",
    name: "Family Feud Stories",
    emoji: "\u{1F3E0}",
    genderRestriction: "any",
    description: "Inheritance fights and family secrets",
  },
  {
    id: "school-stories",
    name: "School Stories",
    emoji: "\u{1F392}",
    genderRestriction: "any",
    description: "Wild teacher, student, and campus tales",
  },
  {
    id: "food-nightmare",
    name: "Food Nightmare Stories",
    emoji: "\u{1F37D}\uFE0F",
    genderRestriction: "any",
    description: "Restaurant horrors and kitchen chaos",
  },
  {
    id: "travel-horror",
    name: "Travel Horror Stories",
    emoji: "\u2708\uFE0F",
    genderRestriction: "any",
    description: "Trips gone terribly wrong",
  },
  {
    id: "paranormal",
    name: "Paranormal Encounters",
    emoji: "\u{1F441}\uFE0F",
    genderRestriction: "any",
    description: "Real ghost stories and hauntings",
  },
  {
    id: "history-dark",
    name: "Dark History",
    emoji: "\u{1F4DC}",
    genderRestriction: "any",
    description: "Disturbing historical deep-dives",
  },
  {
    id: "customer-service",
    name: "Customer Service Nightmares",
    emoji: "\u{1F4DE}",
    genderRestriction: "any",
    description: "Karens, meltdowns, and retail hell",
  },
  {
    id: "unsolved",
    name: "Unsolved Mysteries",
    emoji: "\u2753",
    genderRestriction: "any",
    description: "Cases that were never solved",
  },
  {
    id: "plot-twist",
    name: "Plot Twist Stories",
    emoji: "\u{1F504}",
    genderRestriction: "any",
    description: "Stories with jaw-dropping endings",
  },
  {
    id: "caught-in-4k",
    name: "Caught in 4K Stories",
    emoji: "\u{1F4F8}",
    genderRestriction: "any",
    description: "Busted with undeniable proof",
  },
];

/** Set of all valid story type IDs for fast lookup */
const VALID_STORY_IDS = new Set(STORY_TYPE_CATALOGUE.map((s) => s.id));

/** Map from story ID to its config for fast lookup */
const STORY_TYPE_MAP = new Map(
  STORY_TYPE_CATALOGUE.map((s) => [s.id, s])
);

/**
 * Returns story types filtered by voice type compatibility.
 * - RANDOM: all story types (no gender restriction)
 * - MALE: hide female_only stories
 * - FEMALE: hide male_only stories
 */
export function getFilteredStoryTypes(
  voiceType: "MALE" | "FEMALE" | "RANDOM"
): StoryTypeConfig[] {
  const hiddenRestriction: GenderRestriction | null =
    voiceType === "MALE"
      ? "female_only"
      : voiceType === "FEMALE"
        ? "male_only"
        : null;

  if (!hiddenRestriction) {
    return STORY_TYPE_CATALOGUE;
  }

  return STORY_TYPE_CATALOGUE.filter(
    (s) => s.genderRestriction !== hiddenRestriction
  );
}

/**
 * Validates a content configuration object.
 * Checks enum validity, story type count, existence, and voice compatibility.
 */
export function validateContentConfig(config: ContentConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate videoType
  if (config.videoType !== "GAMEPLAY" && config.videoType !== "AI_IMAGES") {
    errors.push(`Invalid videoType: ${String(config.videoType)}`);
  }

  // Validate voiceType
  if (
    config.voiceType !== "MALE" &&
    config.voiceType !== "FEMALE" &&
    config.voiceType !== "RANDOM"
  ) {
    errors.push(`Invalid voiceType: ${String(config.voiceType)}`);
  }

  // Validate storyTypes count
  if (config.storyTypes.length > MAX_STORY_TYPES) {
    errors.push(
      `Too many story types: ${config.storyTypes.length} (max ${MAX_STORY_TYPES})`
    );
  }

  // Validate each story type ID exists and is compatible with the voice
  const allowedStories = getFilteredStoryTypes(config.voiceType);
  const allowedIds = new Set(allowedStories.map((s) => s.id));

  for (const storyId of config.storyTypes) {
    if (!VALID_STORY_IDS.has(storyId)) {
      errors.push(`Unknown story type: ${storyId}`);
    } else if (!allowedIds.has(storyId)) {
      const story = STORY_TYPE_MAP.get(storyId);
      errors.push(
        `Story type "${story?.name ?? storyId}" is not compatible with voice type ${config.voiceType}`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Zod schema for validating content config in API routes.
 * Uses Zod v4 syntax with z.enum() array format.
 */
export const contentConfigSchema = z.object({
  videoType: z.enum(["GAMEPLAY", "AI_IMAGES"]),
  voiceType: z.enum(["MALE", "FEMALE", "RANDOM"]),
  storyTypes: z.array(z.string()).max(MAX_STORY_TYPES),
  randomizeStories: z.boolean(),
});
