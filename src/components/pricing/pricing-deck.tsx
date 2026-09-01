"use client";

import {
  Check,
  Crown,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Region = "india" | "international";
type Plan = "monthly" | "yearly" | "lifetime";

const plans: Record<
  Region,
  Array<{
    key: Plan;
    name: string;
    founding: string;
    published: string;
    cadence: string;
    best?: boolean;
  }>
> = {
  india: [
    {
      key: "monthly",
      name: "Monthly",
      founding: "₹299",
      published: "₹599",
      cadence: "/ month",
    },
    {
      key: "yearly",
      name: "Yearly",
      founding: "₹2,399",
      published: "₹4,799",
      cadence: "/ year",
      best: true,
    },
    {
      key: "lifetime",
      name: "Lifetime",
      founding: "₹5,999",
      published: "₹11,999",
      cadence: "one time",
    },
  ],
  international: [
    {
      key: "monthly",
      name: "Monthly",
      founding: "$4.99",
      published: "$9.99",
      cadence: "/ month",
    },
    {
      key: "yearly",
      name: "Yearly",
      founding: "$39.99",
      published: "$79.99",
      cadence: "/ year",
      best: true,
    },
    {
      key: "lifetime",
      name: "Lifetime",
      founding: "$99.99",
      published: "$199.99",
      cadence: "one time",
    },
  ],
};

const features = [
  "Every exclusive recipe and premium collection",
  "Unlimited offline recipes and private cooklists",
  "Advanced filters, scaling tools, and personal export",
  "An entirely ad-free Anime FooDex",
  "Supporter profile frames, badges, and seasonal rewards",
  "A clearly disclosed 10% competitive XP boost",
];

export function PricingDeck() {
  const [region, setRegion] = useState<Region>("india");
  const [loading, setLoading] = useState<Plan | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<{
    id: string;
    gateway: string;
    checkoutExpiresAt: string;
  } | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  async function claim(plan: Plan) {
    setLoading(plan);
    setMessage(null);
    try {
      const response = await fetch("/api/billing/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ region, plan }),
      });
      const payload = (await response.json()) as {
        error?: string;
        claim?: { id: string; checkoutExpiresAt: string; gateway: string };
      };
      if (!response.ok || !payload.claim) {
        setMessage(payload.error ?? "The founding campaign is not active yet.");
        return;
      }
      setClaimed({
        id: payload.claim.id,
        gateway: payload.claim.gateway,
        checkoutExpiresAt: payload.claim.checkoutExpiresAt,
      });
      setMessage(
        `Price claimed through ${payload.claim.gateway}. Create checkout before ${new Date(
          payload.claim.checkoutExpiresAt,
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
      );
    } catch {
      setMessage("Could not reach billing. Your price window was not started.");
    } finally {
      setLoading(null);
    }
  }

  async function createCheckout() {
    if (!claimed) return;
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          claimId: claimed.id,
          billingCountry: region === "india" ? "IN" : "US",
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        checkout?: { url?: string };
      };
      if (!response.ok || !payload.checkout) {
        setMessage(payload.error ?? "Checkout could not be created.");
        return;
      }
      if (payload.checkout.url) window.location.assign(payload.checkout.url);
      else
        setMessage(
          "Razorpay order created. The secure checkout widget opens after the publisher key is connected.",
        );
    } catch {
      setMessage(
        "Checkout could not be reached. The claim remains governed by its original expiry.",
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div>
      <div className="mx-auto grid max-w-xl grid-cols-2 rounded-full border border-[var(--ink)] bg-[var(--paper-raised)] p-1">
        {(["india", "international"] as const).map((option) => (
          <button
            aria-pressed={region === option}
            className={cn(
              "min-h-11 rounded-full text-sm font-black transition-colors",
              region === option && "bg-[var(--ink)] text-[var(--paper)]",
            )}
            key={option}
            onClick={() => {
              setRegion(option);
              setMessage(null);
            }}
            type="button"
          >
            {option === "india" ? "India · Razorpay" : "International · Stripe"}
          </button>
        ))}
      </div>

      <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-[var(--ink-faint)]">
        Gateway follows the billing country you confirm—not your IP. India
        prices are GST-inclusive; applicable international tax is shown before
        payment.
      </p>

      <div className="mt-9 grid gap-5 lg:grid-cols-3">
        {plans[region].map((plan) => (
          <article
            className={cn(
              "relative flex flex-col rounded-3xl border border-[var(--ink)] bg-[var(--paper-raised)] p-6",
              plan.best && "shadow-[7px_7px_0_var(--saffron)]",
            )}
            key={plan.key}
          >
            {plan.best ? (
              <Badge className="absolute -top-3 left-6" tone="saffron">
                Founding favorite
              </Badge>
            ) : null}
            <p className="eyebrow mt-2 text-[var(--ink-faint)]">{plan.name}</p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="display text-5xl">{plan.founding}</span>
              <span className="text-sm font-bold text-[var(--ink-faint)]">
                {plan.cadence}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--ink-faint)]">
              Published post-campaign price:{" "}
              <span className="font-black">{plan.published}</span>
            </p>
            <div className="mt-6 grid gap-3 border-t pt-6">
              {features
                .slice(0, plan.key === "monthly" ? 4 : 6)
                .map((feature) => (
                  <p className="flex items-start gap-2 text-sm" key={feature}>
                    <Check
                      className="mt-0.5 shrink-0 text-[var(--jade)]"
                      size={16}
                      strokeWidth={3}
                    />
                    {feature}
                  </p>
                ))}
            </div>
            <Button
              className="mt-7 w-full"
              disabled={Boolean(loading)}
              onClick={() => void claim(plan.key)}
              variant={plan.best ? "vermilion" : "outline"}
            >
              {loading === plan.key ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Crown size={17} />
              )}
              Lock in founding price
            </Button>
          </article>
        ))}
      </div>

      {message ? (
        <div
          aria-live="polite"
          className="mx-auto mt-6 max-w-2xl rounded-xl border bg-[var(--paper-raised)] px-4 py-3 text-center text-sm font-bold"
        >
          <p>{message}</p>
          {claimed ? (
            <Button
              className="mt-3"
              disabled={checkoutLoading}
              onClick={() => void createCheckout()}
              size="sm"
              variant="jade"
            >
              {checkoutLoading ? (
                <LoaderCircle className="animate-spin" size={15} />
              ) : (
                <ShieldCheck size={15} />
              )}{" "}
              Create secure checkout
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-12 grid gap-5 rounded-3xl border border-[var(--line)] bg-[var(--paper-deep)] p-6 sm:p-8 lg:grid-cols-3">
        {(
          [
            [
              Sparkles,
              "Founding access, honestly priced",
              "The 30-day launch offer begins at public GA, with the future price and effective date shown clearly.",
            ],
            [
              ShieldCheck,
              "No pressure tricks",
              "A 15-minute price claim begins only when you choose it. It reserves checkout creation; it never pretends your payment is expiring.",
            ],
            [
              Crown,
              "Lifetime means the life of the service",
              "One payment keeps Supporter access for as long as Anime FooDex operates, exactly as stated in the terms.",
            ],
          ] satisfies Array<[LucideIcon, string, string]>
        ).map(([Icon, title, body]) => (
          <div className="grid grid-cols-[2rem_1fr] gap-3" key={String(title)}>
            <Icon className="text-[var(--vermilion)]" size={20} />
            <div>
              <p className="font-black">{String(title)}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                {String(body)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
