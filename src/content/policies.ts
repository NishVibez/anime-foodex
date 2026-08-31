export type PolicySection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export const policies = {
  editorial: {
    title: "Editorial & rights standard",
    summary:
      "How Anime FooDex separates occurrence evidence, culinary evidence, independent authorship, kitchen review, and media rights.",
    sections: [
      {
        heading: "Two evidence tracks",
        paragraphs: [
          "Occurrence evidence proves that a dish, ingredient, menu item, or food moment appears in a work. It records a precise locator such as an episode and timecode, chapter and page, game item or quest, film scene, or park and menu location.",
          "Culinary evidence supports a safe and workable preparation. It never converts access to a cookbook, webpage, screenshot, or franchise asset into permission to copy expressive prose or media.",
        ],
      },
      {
        heading: "Publication gate",
        paragraphs: [
          "A recipe version becomes publishable only when every required sign-off is recorded.",
        ],
        bullets: [
          "Independent prose and structured quantities",
          "Completed kitchen test and culinary approval",
          "Ingredient, allergen, and unsafe-method review",
          "Verified occurrence locators and provenance",
          "Original or licensed food media",
          "IP and rights approval with an immutable version record",
        ],
      },
      {
        heading: "Research materials",
        paragraphs: [
          "Supplied cookbooks and webpages remain private research-only discovery inputs. Production Storage must never contain those files, scans, copied instructions, protected artwork, or extracted expressive prose.",
          "Candidate extraction is limited to factual dish titles, ingredient facts, aliases, and private source locators. Publication requires a fresh editorial work product.",
        ],
      },
      {
        heading: "Corrections and retirement",
        paragraphs: [
          "Published versions are immutable. A correction creates a new version and preserves the audit trail. Unsafe, misleading, or rights-contested content may be retired immediately while review continues.",
        ],
      },
    ] satisfies PolicySection[],
  },
  privacy: {
    title: "Privacy notice",
    summary:
      "What Anime FooDex needs, what stays private, and the controls available to every account.",
    sections: [
      {
        heading: "Data we use",
        paragraphs: [
          "OAuth provides an account identifier, provider email, and basic provider profile. At first login we privately collect a self-declared country and date of birth to apply account, social, and advertising age rules.",
          "We also process preferences, saves, notes, cook logs, follows, posts, reports, consent choices, security events, and payment entitlement records when you use those features.",
        ],
      },
      {
        heading: "Data we do not publish",
        paragraphs: [
          "Birth date, precise location, provider email, billing identity, private notes, private collections, consent records, and moderation history are not public profile fields.",
        ],
      },
      {
        heading: "Your controls",
        bullets: [
          "Export your account data in a portable format",
          "Delete your account and revoke non-required consent",
          "Choose public, followers-only, or private profile visibility",
          "Block accounts and review your report history",
          "Receive contextual rather than personalized advertising",
        ],
        paragraphs: [
          "Operational, fraud-prevention, financial, and legal records may be retained only as required and access remains restricted and audited.",
        ],
      },
      {
        heading: "Vendors and transfers",
        paragraphs: [
          "The service is designed around Supabase, Vercel, Google or Discord OAuth, OpenAI Moderation, Razorpay, Stripe, and a single active advertising provider. Final production regions, transfer terms, retention periods, and the monitored privacy contact must be confirmed before GA.",
        ],
      },
    ] satisfies PolicySection[],
  },
  terms: {
    title: "Terms of service",
    summary:
      "Rules for accounts, community use, cooking safety, Supporter access, and the service itself.",
    sections: [
      {
        heading: "Accounts and eligibility",
        paragraphs: [
          "You must meet the applicable digital-consent age for your self-declared country. Anime FooDex requires at least age 13 globally, the applicable 13–16 threshold in Europe, and age 18 in India because parental-consent support is not provided. Social access requires age 14 or older.",
        ],
      },
      {
        heading: "Cooking information",
        paragraphs: [
          "Recipes are general cooking information, not medical or dietary advice. Ingredient labels, cross-contamination conditions, appliances, altitude, and individual health needs vary. Verify allergens independently and follow local food-safety guidance.",
        ],
      },
      {
        heading: "Community license and rules",
        paragraphs: [
          "You retain ownership of content you create and grant the service the limited license needed to host, moderate, display, and distribute it according to your visibility choices. You must have rights to every upload.",
        ],
        bullets: [
          "No cookbook scans, screenshots, copied recipe prose, or unlicensed franchise artwork",
          "No non-food imagery, identifiable minors, personal information, sexual or violent content",
          "No harassment, spam, unsafe cooking instructions, evasion, or coordinated manipulation",
        ],
      },
      {
        heading: "Supporter and founding access",
        paragraphs: [
          "Founding prices run for 30 calendar days from GA and the future price and effective date are shown. A 15-minute offer claim is a server-side window to create checkout only; the payment processor shows its own real deadline.",
          "Lifetime means one-time access for the operating lifetime of Anime FooDex. Refunds, chargebacks, cancellations, and failed renewals affect entitlement consistently across providers. Local mandatory consumer rights continue to apply.",
        ],
      },
    ] satisfies PolicySection[],
  },
  takedown: {
    title: "Corrections, infringement & takedowns",
    summary:
      "A documented route for factual corrections, safety reports, rights claims, notices, and counter-notices.",
    sections: [
      {
        heading: "Fast safety and factual corrections",
        paragraphs: [
          "Report an incorrect locator, allergen, substitution, unsafe instruction, attribution, or media-rights concern. Credible safety issues may cause immediate reversible retirement while the evidence is reviewed.",
        ],
      },
      {
        heading: "Copyright or trademark notice",
        paragraphs: [
          "A notice should identify the protected work, the Anime FooDex material at issue, your contact details, a good-faith statement, an accuracy and authority statement, and your physical or electronic signature. The production legal contact must be monitored before launch.",
        ],
      },
      {
        heading: "Review and counter-notice",
        paragraphs: [
          "Notices, actions, restorations, appeals, and counter-notices are logged. The service may request missing information, restrict material during review, notify the contributor where lawful, and restore content only after the applicable process permits it.",
        ],
      },
      {
        heading: "No license by availability",
        paragraphs: [
          "A PDF, webpage, image, video, or franchise asset is not presumed licensed merely because it is available online or was supplied for research.",
        ],
      },
    ] satisfies PolicySection[],
  },
} as const;

export type PolicySlug = keyof typeof policies;
