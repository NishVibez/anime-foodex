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
  connectionLabel: "Seen in" | "Inspired by";
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
    title: "Ichiraku-style miso ramen",
    dish: "Miso ramen",
    work: "Naruto",
    connectionLabel: "Seen in",
    context:
      "Ramen is Naruto Uzumaki’s signature comfort food, most famously served at Ichiraku. This is Anime FooDex’s independently developed miso interpretation.",
    kind: "anime",
    access: "standard",
    difficulty: "Intermediate",
    minutes: 55,
    tags: ["pork optional", "comfort food", "noodles"],
    color: "vermilion",
    teaser:
      "A deeply savory bowl with springy noodles, sweet corn, greens, and a jammy egg—made for anyone who has ever wanted a seat at Ichiraku.",
  },
  {
    slug: "forest-picnic-onigiri",
    title: "Satsuki’s picnic onigiri",
    dish: "Onigiri",
    work: "My Neighbor Totoro",
    connectionLabel: "Seen in",
    context:
      "Rice-filled bentos help turn everyday family care into one of the film’s warmest food memories. This practical onigiri set is independently authored for real lunchboxes.",
    kind: "film",
    access: "standard",
    difficulty: "Easy",
    minutes: 35,
    tags: ["vegetarian option", "picnic", "rice"],
    color: "jade",
    teaser:
      "Glossy rice, three practical fillings, and the gentle picnic energy of a Studio Ghibli afternoon.",
  },
  {
    slug: "starlight-berry-parfait",
    title: "Stardrop berry parfait",
    dish: "Fruit parfait",
    work: "Stardew Valley",
    connectionLabel: "Inspired by",
    context:
      "An original celebration of Stardew Valley’s berries, artisan goods, and rare Stardrop magic. It is a fandom interpretation, not an in-game recipe.",
    kind: "game",
    access: "supporter",
    difficulty: "Easy",
    minutes: 25,
    tags: ["vegetarian", "dessert", "no bake"],
    color: "saffron",
    teaser:
      "Layers of berries, vanilla cream, sesame crumble, and jewel-bright jelly for the end of a very good harvest day.",
  },
  {
    slug: "four-winds-vegetable-curry",
    title: "Four-winds vegetable curry",
    dish: "Japanese curry rice",
    work: "Avatar: The Last Airbender",
    connectionLabel: "Inspired by",
    context:
      "An original vegetarian curry built around the Four Nations’ distinct food cultures. It is clearly labeled as an inspired interpretation, not a dish claimed to appear on screen.",
    kind: "animation",
    access: "supporter",
    difficulty: "Intermediate",
    minutes: 70,
    tags: ["vegan", "batch cook", "comforting"],
    color: "ink",
    teaser:
      "A silky, vegetable-packed curry with four regional finishing paths—ideal for a watch-party table.",
  },
];

export const activity = [
  {
    user: "Mira",
    action: "cooked Ichiraku-style miso ramen",
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
