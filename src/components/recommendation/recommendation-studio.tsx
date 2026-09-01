"use client";

import type { Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  representativeRecipePreviews,
  representativeRecommendationRecipes,
} from "@/data/recommendation-previews";
import type {
  Allergen,
  DietaryTag,
  Difficulty,
  MarketCode,
  RecommendationResult,
  UnitSystem,
} from "@/domain/contracts";
import { recommendRecipes } from "@/domain/recommendation";
import { cn } from "@/lib/utils";

const moods = ["comforting", "quick", "adventurous", "calm", "celebratory"];
const diets: Array<{ value: DietaryTag; label: string }> = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "dairy_free", label: "Dairy-free" },
  { value: "egg_free", label: "Egg-free" },
  { value: "nut_free", label: "Nut-free" },
];
const allergens: Array<{ value: Allergen; label: string }> = [
  { value: "gluten", label: "Gluten" },
  { value: "milk", label: "Milk" },
  { value: "egg", label: "Egg" },
  { value: "soy", label: "Soy" },
  { value: "sesame", label: "Sesame" },
  { value: "peanut", label: "Peanut" },
  { value: "tree_nut", label: "Tree nuts" },
  { value: "fish", label: "Fish" },
];

export function RecommendationStudio() {
  const [ingredients, setIngredients] = useState(
    "rice, mushrooms, scallions, tofu",
  );
  const [dislikes, setDislikes] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["comforting"]);
  const [selectedDiets, setSelectedDiets] = useState<DietaryTag[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
  const [minutes, setMinutes] = useState(40);
  const [skill, setSkill] = useState<Difficulty>("beginner");
  const [market, setMarket] = useState<MarketCode>("IN");
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const recipeLookup = useMemo(
    () =>
      new Map(
        representativeRecipePreviews.map((recipe) => [recipe.id, recipe]),
      ),
    [],
  );

  function toggle<T extends string>(
    value: T,
    values: readonly T[],
    setValues: (next: T[]) => void,
  ) {
    setValues(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );
  }

  function runRecommendation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const split = (value: string) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    setResult(
      recommendRecipes(representativeRecommendationRecipes, {
        availableIngredients: split(ingredients),
        mood: selectedMoods,
        maximumTotalMinutes: minutes,
        skill,
        dietaryRequirements: selectedDiets,
        allergens: selectedAllergens,
        dislikedIngredients: split(dislikes),
        market,
        unitSystem: units,
      }),
    );
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.75fr)] xl:items-start">
      <form
        className="rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] p-5 shadow-[7px_7px_0_var(--ink)] sm:p-7"
        onSubmit={runRecommendation}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
          <div>
            <p className="eyebrow text-[var(--vermilion)]">Pantry scan</p>
            <h2 className="display mt-1 text-3xl">Start with your kitchen</h2>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--saffron)] text-[#181512]">
            <ChefHat aria-hidden="true" size={21} />
          </span>
        </div>

        <div className="mt-6 grid gap-7">
          <Field
            label="Available ingredients"
            hint="Separate ingredients with commas."
          >
            <input
              className="min-h-12 w-full rounded-xl border bg-[var(--paper)] px-4 outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)]/35"
              onChange={(event) => setIngredients(event.target.value)}
              placeholder="rice, eggs, spinach…"
              value={ingredients}
            />
          </Field>

          <Field label="Mood" hint="Choose as many as feel right.">
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => {
                const selected = selectedMoods.includes(mood);
                return (
                  <button
                    aria-pressed={selected}
                    className={cn(
                      "min-h-10 rounded-full border px-4 text-sm font-bold capitalize transition-colors",
                      selected
                        ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                        : "bg-[var(--paper)] hover:border-[var(--ink)]",
                    )}
                    key={mood}
                    onClick={() =>
                      toggle(mood, selectedMoods, setSelectedMoods)
                    }
                    type="button"
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Time available" hint={`${minutes} minutes maximum`}>
              <input
                aria-label="Maximum cooking time"
                className="mt-2 w-full accent-[var(--vermilion)]"
                max="120"
                min="15"
                onChange={(event) => setMinutes(Number(event.target.value))}
                step="5"
                type="range"
                value={minutes}
              />
              <div className="mt-1 flex justify-between font-mono text-[0.65rem] text-[var(--ink-faint)]">
                <span>15 min</span>
                <span>2 hr</span>
              </div>
            </Field>
            <Field label="Kitchen confidence">
              <select
                className="min-h-12 w-full rounded-xl border bg-[var(--paper)] px-4 font-bold outline-none focus:border-[var(--ink)]"
                onChange={(event) => setSkill(event.target.value as Difficulty)}
                value={skill}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
          </div>

          <Field
            label="Dietary requirements"
            hint="These are hard constraints."
          >
            <CheckboxGrid
              options={diets}
              selected={selectedDiets}
              toggle={(value) => toggle(value, selectedDiets, setSelectedDiets)}
            />
          </Field>

          <Field
            label="Allergens to exclude"
            hint="A selected allergen removes the recipe entirely; always verify product labels."
          >
            <CheckboxGrid
              options={allergens}
              selected={selectedAllergens}
              toggle={(value) =>
                toggle(value, selectedAllergens, setSelectedAllergens)
              }
            />
          </Field>

          <Field
            label="Disliked ingredients"
            hint="Also treated as a hard exclusion."
          >
            <input
              className="min-h-12 w-full rounded-xl border bg-[var(--paper)] px-4 outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--focus)]/35"
              onChange={(event) => setDislikes(event.target.value)}
              placeholder="fish, aubergine…"
              value={dislikes}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Ingredient market">
              <select
                className="min-h-12 w-full rounded-xl border bg-[var(--paper)] px-4 font-bold outline-none"
                onChange={(event) =>
                  setMarket(event.target.value as MarketCode)
                }
                value={market}
              >
                <option value="IN">India</option>
                <option value="NA">North America</option>
                <option value="EU">Europe</option>
                <option value="OTHER">Other configured market</option>
              </select>
            </Field>
            <Field label="Measurement system">
              <div className="grid grid-cols-2 rounded-xl border bg-[var(--paper)] p-1">
                {(["metric", "imperial"] as const).map((system) => (
                  <button
                    aria-pressed={units === system}
                    className={cn(
                      "min-h-10 rounded-lg text-sm font-bold capitalize",
                      units === system && "bg-[var(--ink)] text-[var(--paper)]",
                    )}
                    key={system}
                    onClick={() => setUnits(system)}
                    type="button"
                  >
                    {system}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <Button
          className="mt-8 w-full"
          size="lg"
          type="submit"
          variant="vermilion"
        >
          <WandSparkles aria-hidden="true" size={19} /> Find three safe matches
        </Button>
      </form>

      <div className="xl:sticky xl:top-24">
        {result ? (
          <ResultPanel result={result} recipeLookup={recipeLookup} />
        ) : (
          <div className="relative overflow-hidden rounded-3xl border border-[var(--ink)] bg-[#181512] p-7 text-[#f7f0e3] shadow-[7px_7px_0_var(--saffron)]">
            <div className="halftone absolute inset-0 opacity-15" />
            <div className="relative">
              <Sparkles className="text-[var(--saffron)]" size={36} />
              <p className="eyebrow mt-8 text-white/55">
                Waiting for your pantry
              </p>
              <h2 className="display mt-2 text-4xl">
                Three choices, zero mystery.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                Your answers produce the same reliable matches online and
                offline. Every result comes from the reviewed FooDex catalog;
                nothing is invented on the fly.
              </p>
              <div className="mt-7 grid gap-3">
                {(
                  [
                    [
                      ShieldCheck,
                      "Safety first",
                      "Allergens, diets, and dislikes exclude.",
                    ],
                    [
                      Clock3,
                      "Practical rank",
                      "Time and skill affect the score.",
                    ],
                    [
                      MapPin,
                      "Local pantry",
                      "Regional availability shapes the reasons.",
                    ],
                  ] satisfies Array<[LucideIcon, string, string]>
                ).map(([Icon, title, body]) => (
                  <div
                    className="grid grid-cols-[2rem_1fr] gap-3"
                    key={String(title)}
                  >
                    <Icon className="mt-0.5 text-[var(--saffron)]" size={18} />
                    <div>
                      <p className="text-sm font-black">{String(title)}</p>
                      <p className="text-xs text-white/55">{String(body)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-black">{label}</legend>
      {hint ? (
        <p className="mt-1 mb-3 text-xs text-[var(--ink-faint)]">{hint}</p>
      ) : (
        <div className="h-3" />
      )}
      {children}
    </fieldset>
  );
}

function CheckboxGrid<T extends string>({
  options,
  selected,
  toggle,
}: {
  options: Array<{ value: T; label: string }>;
  selected: readonly T[];
  toggle: (value: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const checked = selected.includes(option.value);
        return (
          <label
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-colors",
              checked
                ? "border-[var(--jade)] bg-[var(--jade-soft)]"
                : "bg-[var(--paper)]",
            )}
            key={option.value}
          >
            <input
              checked={checked}
              className="sr-only"
              onChange={() => toggle(option.value)}
              type="checkbox"
            />
            <span
              aria-hidden="true"
              className={cn(
                "grid size-4 place-items-center rounded border",
                checked && "border-[var(--jade)] bg-[var(--jade)] text-white",
              )}
            >
              {checked ? <Check size={11} strokeWidth={3} /> : null}
            </span>
            {option.label}
          </label>
        );
      })}
    </div>
  );
}

function ResultPanel({
  result,
  recipeLookup,
}: {
  result: RecommendationResult;
  recipeLookup: Map<string, (typeof representativeRecipePreviews)[number]>;
}) {
  const cards = [
    ...result.choices.map((choice, index) => ({
      choice,
      label: index === 0 ? "Best fit" : "Close second",
      wildcard: false,
    })),
    ...(result.wildcard
      ? [{ choice: result.wildcard, label: "Safe wildcard", wildcard: true }]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-[var(--vermilion)]">Your results</p>
          <h2 className="display mt-1 text-4xl">Tonight&apos;s three</h2>
        </div>
        <Badge tone="paper">v{result.algorithmVersion}</Badge>
      </div>
      {cards.map(({ choice, label, wildcard }, index) => {
        const recipe = recipeLookup.get(choice.recipeId);
        const href = recipe
          ? (`/recipes/${recipe.slug}` as Route)
          : ("/recipes" as Route);
        return (
          <article
            className={cn(
              "rounded-2xl border border-[var(--ink)] bg-[var(--paper-raised)] p-5",
              index === 0 && "shadow-[5px_5px_0_var(--vermilion)]",
              wildcard && "border-dashed bg-[var(--saffron-soft)]",
            )}
            key={choice.recipeId}
          >
            <div className="flex items-start justify-between gap-3">
              <Badge
                tone={wildcard ? "saffron" : index === 0 ? "vermilion" : "jade"}
              >
                {label}
              </Badge>
              <span className="font-mono text-xs font-black">
                {Math.max(1, Math.min(99, choice.score))}%
              </span>
            </div>
            <h3 className="display mt-3 text-2xl">{choice.title}</h3>
            <div className="mt-4 grid gap-2">
              {choice.reasons.map((reason) => (
                <p
                  className="flex items-start gap-2 text-xs leading-relaxed text-[var(--ink-muted)]"
                  key={reason}
                >
                  <Check
                    className="mt-0.5 shrink-0 text-[var(--jade)]"
                    size={14}
                  />
                  {reason}
                </p>
              ))}
            </div>
            <Link
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mt-4 px-0",
              )}
              href={href}
            >
              Preview this recipe <ArrowRight size={15} />
            </Link>
          </article>
        );
      })}
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--vermilion)] bg-[var(--vermilion-soft)] p-6">
          <p className="font-black">No safe match in the sample set.</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Nothing bypassed your hard constraints. Adjust the pantry or
            time—not the safety rules.
          </p>
        </div>
      ) : null}
      <p className="text-center text-[0.68rem] text-[var(--ink-faint)]">
        {result.excludedCount} excluded · {result.evaluatedCount} safely
        evaluated
      </p>
    </div>
  );
}
