import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  Castle,
  Clapperboard,
  Gamepad2,
  Sparkles,
  Tv,
} from "lucide-react";

export type CollectionKey =
  "anime" | "animation" | "game" | "film" | "theme_park";

export type EditorialRecipe = {
  slug: string;
  title: string;
  dish: string;
  work: string;
  context: string;
  kind: CollectionKey;
  access: "standard" | "supporter";
  difficulty: "Easy" | "Intermediate" | "Advanced";
  minutes: number;
  tags: string[];
  color: "vermilion" | "jade" | "saffron" | "ink";
  teaser: string;
};

export const collections: Array<{
  key: CollectionKey;
  label: string;
  eyebrow: string;
  count: number;
  evidence: number;
  icon: LucideIcon;
  accent: string;
}> = [
  {
    key: "anime",
    label: "Anime",
    eyebrow: "From the screen",
    count: 84,
    evidence: 200,
    icon: Tv,
    accent: "var(--vermilion)",
  },
  {
    key: "animation",
    label: "Other animation",
    eyebrow: "Beyond Japan",
    count: 84,
    evidence: 200,
    icon: Sparkles,
    accent: "var(--jade)",
  },
  {
    key: "game",
    label: "Games",
    eyebrow: "Cook your inventory",
    count: 84,
    evidence: 200,
    icon: Gamepad2,
    accent: "var(--saffron)",
  },
  {
    key: "film",
    label: "Films",
    eyebrow: "A cinematic table",
    count: 84,
    evidence: 200,
    icon: Clapperboard,
    accent: "var(--ink)",
  },
  {
    key: "theme_park",
    label: "Parks & worlds",
    eyebrow: "Menus worth a journey",
    count: 84,
    evidence: 200,
    icon: Castle,
    accent: "var(--vermilion)",
  },
];

export const featuredRecipes: EditorialRecipe[] = [
  {
    slug: "moonlit-miso-ramen",
    title: "Moonlit miso ramen",
    dish: "Miso ramen",
    work: "Midnight Market Club",
    context: "A restorative bowl shared after the market closes in episode 7.",
    kind: "anime",
    access: "standard",
    difficulty: "Intermediate",
    minutes: 55,
    tags: ["pork optional", "warming", "noodles"],
    color: "vermilion",
    teaser:
      "Deeply savory miso broth, springy noodles, sweet corn, greens, and a jammy egg—built for a weeknight kitchen.",
  },
  {
    slug: "forest-picnic-onigiri",
    title: "Forest picnic onigiri",
    dish: "Onigiri",
    work: "The Moss Post",
    context: "Packed for a gentle train journey through the cedar country.",
    kind: "film",
    access: "standard",
    difficulty: "Easy",
    minutes: 35,
    tags: ["vegetarian option", "picnic", "rice"],
    color: "jade",
    teaser:
      "Glossy seasoned rice wrapped around three practical fillings, shaped for lunchboxes and quiet adventures.",
  },
  {
    slug: "starlight-berry-parfait",
    title: "Starlight berry parfait",
    dish: "Fruit parfait",
    work: "Arcade After School",
    context:
      "A celebratory café item unlocked after the final rhythm challenge.",
    kind: "game",
    access: "supporter",
    difficulty: "Easy",
    minutes: 25,
    tags: ["vegetarian", "dessert", "no bake"],
    color: "saffron",
    teaser:
      "A bright stack of berries, vanilla cream, crisp sesame crumble, and jewel-like citrus jelly.",
  },
  {
    slug: "four-winds-vegetable-curry",
    title: "Four-winds vegetable curry",
    dish: "Japanese curry rice",
    work: "Wayfarer Kingdoms",
    context:
      "A communal inn meal with variations from every region of the world map.",
    kind: "animation",
    access: "supporter",
    difficulty: "Intermediate",
    minutes: 70,
    tags: ["vegan", "batch cook", "comforting"],
    color: "ink",
    teaser:
      "Silky Japanese-style curry packed with roasted vegetables and a fruit-bright finish, made without boxed roux.",
  },
];

export const activity = [
  {
    user: "Mira",
    action: "cooked Moonlit miso ramen",
    detail: "“The India noodle swap worked beautifully.”",
    time: "8 min",
    accent: "var(--vermilion)",
  },
  {
    user: "Jun",
    action: "completed Pantry Alchemist",
    detail: "+180 XP · rare jade frame unlocked",
    time: "24 min",
    accent: "var(--jade)",
  },
  {
    user: "Asha",
    action: "shared a collection",
    detail: "Rainy-day comfort food · 12 recipes",
    time: "42 min",
    accent: "var(--saffron)",
  },
];

export const studioStages = [
  { label: "Evidence verified", value: 1_000, icon: BookOpenText },
  { label: "Test kitchen", value: 420, icon: Sparkles },
  { label: "Rights cleared", value: 420, icon: Castle },
];

export function findRecipe(slug: string) {
  return featuredRecipes.find((recipe) => recipe.slug === slug);
}
