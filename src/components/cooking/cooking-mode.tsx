"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Minus,
  Plus,
  Save,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AuthorizedRecipe } from "@/lib/catalog/authorized-recipe";
import {
  bindOfflineOwner,
  cacheAuthorizedRecipe,
  queueProgressEvent,
  saveCookingSession,
} from "@/lib/offline/store";
import { cn } from "@/lib/utils";

function kitchenNumber(value: number) {
  if (value >= 100) return String(Math.round(value));
  return String(Math.round(value * 100) / 100);
}

export function CookingMode({
  recipe,
  ownerId,
}: {
  recipe: AuthorizedRecipe;
  ownerId: string;
}) {
  const [servings, setServings] = useState(recipe.servings);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scale = servings / recipe.servings;

  useEffect(() => {
    void bindOfflineOwner(ownerId).then(() =>
      saveCookingSession({
        ownerId,
        recipeVersionId: recipe.versionId,
        stepIndex,
        timers: [],
        servings,
        updatedAt: Date.now(),
      }),
    );
  }, [ownerId, recipe.versionId, servings, stepIndex]);

  const step = recipe.steps[stepIndex];
  const progress = recipe.steps.length
    ? ((stepIndex + (completed ? 1 : 0)) / recipe.steps.length) * 100
    : 0;

  async function completeCook() {
    const idempotencyKey = crypto.randomUUID();
    const payload = {
      recipeId: recipe.id,
      recipeVersionId: recipe.versionId,
      servings,
      idempotencyKey,
    };
    if (!navigator.onLine) {
      await bindOfflineOwner(ownerId);
      await queueProgressEvent({
        ownerId,
        idempotencyKey,
        kind: "cook_completed",
        payload,
        createdAt: Date.now(),
      });
      setCompleted(true);
      setNotice(
        "Completion saved offline. XP will be awarded once after reconnection.",
      );
      return;
    }

    const response = await fetch("/api/cooks/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as {
      awardedXp?: number;
      error?: string;
    };
    if (!response.ok) {
      setNotice(result.error ?? "Completion could not be recorded.");
      return;
    }
    setCompleted(true);
    setNotice(`Cook complete · +${result.awardedXp ?? 0} XP`);
  }

  async function saveOffline() {
    try {
      await bindOfflineOwner(ownerId);
      await cacheAuthorizedRecipe(recipe.slug, ownerId);
      setNotice(
        "This authorized recipe is being saved with its entitlement lease.",
      );
    } catch {
      setNotice(
        "Offline saving is not available yet. Keep this cooking session open.",
      );
    }
  }

  const displayIngredients = useMemo(
    () =>
      recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        amountMin:
          ingredient.amountMin === null ? null : ingredient.amountMin * scale,
        amountMax:
          ingredient.amountMax === null ? null : ingredient.amountMax * scale,
      })),
    [recipe.ingredients, scale],
  );

  return (
    <div className="min-h-[calc(100dvh-4.25rem)] bg-[var(--paper-raised)]">
      <header className="sticky top-17 z-20 border-b bg-[color:var(--paper-raised)]/94 px-5 py-4 backdrop-blur lg:top-17">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="min-w-0">
            <p className="eyebrow text-[var(--vermilion)]">Cooking mode</p>
            <h1 className="truncate font-black">{recipe.title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge tone="jade">
              <WifiOff className="mr-1" size={12} /> session saved
            </Badge>
            <Button
              aria-label="Save recipe offline"
              onClick={() => void saveOffline()}
              size="icon"
              variant="ghost"
            >
              <Save size={18} />
            </Button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--wash)]">
          <div
            className="h-full bg-[var(--vermilion)] transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-2xl border bg-[var(--paper)] p-5">
            <div className="flex items-center justify-between">
              <p className="font-black">Yield</p>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Decrease servings"
                  className="grid size-8 place-items-center rounded-full border"
                  disabled={servings <= 1}
                  onClick={() => setServings((value) => Math.max(1, value - 1))}
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-mono font-black">
                  {servings}
                </span>
                <button
                  aria-label="Increase servings"
                  className="grid size-8 place-items-center rounded-full border"
                  onClick={() => setServings((value) => value + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--ink-faint)]">
              {recipe.yieldUnit} · quantities scale from the immutable version
            </p>
          </div>
          <div>
            <p className="eyebrow text-[var(--ink-faint)]">Ingredients</p>
            <div className="mt-3 divide-y rounded-2xl border bg-[var(--paper)] px-4">
              {displayIngredients.map((ingredient) => (
                <div className="flex gap-3 py-3 text-sm" key={ingredient.id}>
                  <span className="w-20 shrink-0 font-mono font-black">
                    {ingredient.amountMin === null
                      ? "as needed"
                      : kitchenNumber(ingredient.amountMin)}
                    {ingredient.amountMax !== null &&
                    ingredient.amountMax !== ingredient.amountMin
                      ? `–${kitchenNumber(ingredient.amountMax)}`
                      : ""}{" "}
                    {ingredient.unit}
                  </span>
                  <span>
                    {ingredient.name}
                    {ingredient.preparation ? (
                      <span className="text-[var(--ink-faint)]">
                        , {ingredient.preparation}
                      </span>
                    ) : null}
                    {ingredient.optional ? (
                      <Badge className="ml-2" tone="paper">
                        optional
                      </Badge>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {recipe.allergens.length ? (
            <div className="rounded-2xl border border-[var(--vermilion)] bg-[var(--vermilion-soft)] p-4">
              <p className="flex items-center gap-2 text-sm font-black">
                <ShieldAlert size={17} /> Allergen record
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink-muted)]">
                Contains or may contain: {recipe.allergens.join(", ")}. Verify
                every product label and cross-contact condition.
              </p>
            </div>
          ) : null}
        </aside>

        <section
          aria-live="polite"
          className="flex min-h-[35rem] flex-col rounded-3xl border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[7px_7px_0_var(--ink)] sm:p-9"
        >
          {step ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-[var(--vermilion)]">
                    Step {stepIndex + 1} of {recipe.steps.length}
                  </p>
                  <h2 className="display mt-2 text-4xl sm:text-5xl">
                    Keep the panel moving.
                  </h2>
                </div>
                {step.timerSeconds ? (
                  <Timer seconds={step.timerSeconds} />
                ) : null}
              </div>
              <p className="mt-9 text-xl leading-relaxed sm:text-2xl">
                {step.instruction}
              </p>
              {step.safetyNote ? (
                <p className="mt-6 rounded-xl border border-[var(--saffron)] bg-[var(--saffron-soft)] p-4 text-sm font-bold">
                  <ShieldAlert className="mr-2 inline" size={17} />
                  {step.safetyNote}
                </p>
              ) : null}
              {step.temperatureC ? (
                <Badge className="mt-5 w-fit" tone="vermilion">
                  Target {step.temperatureC}°C
                </Badge>
              ) : null}
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-center">
              <div>
                <Check className="mx-auto text-[var(--jade)]" size={48} />
                <h2 className="display mt-5 text-5xl">Ready to plate.</h2>
              </div>
            </div>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 pt-10">
            <Button
              disabled={stepIndex === 0}
              onClick={() => {
                setCompleted(false);
                setStepIndex((value) => Math.max(0, value - 1));
              }}
              variant="outline"
            >
              <ChevronLeft size={17} /> Previous
            </Button>
            {stepIndex < recipe.steps.length - 1 ? (
              <Button
                onClick={() => setStepIndex((value) => value + 1)}
                variant="vermilion"
              >
                Next step <ChevronRight size={17} />
              </Button>
            ) : (
              <Button
                disabled={completed}
                onClick={() => void completeCook()}
                variant="jade"
              >
                <Check size={17} /> {completed ? "Completed" : "Finish cook"}
              </Button>
            )}
          </div>
          {notice ? (
            <p className="mt-5 text-center text-sm font-bold text-[var(--jade)]">
              {notice}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Timer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(
      () =>
        setRemaining((value) => {
          if (value <= 1) {
            window.clearInterval(id);
            return 0;
          }
          return value - 1;
        }),
      1_000,
    );
    return () => window.clearInterval(id);
  }, [running]);
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <button
      className={cn(
        "flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 font-mono text-sm font-black",
        running && "bg-[var(--saffron)] text-[#181512]",
      )}
      onClick={() => setRunning((value) => !value)}
      type="button"
    >
      <Clock3 size={17} /> {minutes}:{String(secs).padStart(2, "0")}
    </button>
  );
}
