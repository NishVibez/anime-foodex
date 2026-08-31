export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FandomKind = "anime" | "animation" | "game" | "film" | "theme_park";
export type AppearanceType =
  | "shown"
  | "mentioned"
  | "official_inspired"
  | "game_item"
  | "menu_item"
  | "adjacent_media";
export type AccessTier = "guest" | "member" | "supporter";
export type Difficulty = "easy" | "medium" | "advanced";
export type MarketCode = "IN" | "NA" | "EU" | "OTHER";

type View<Row> = {
  Row: Row;
  Relationships: [];
};

export type Database = {
  api: {
    Tables: Record<never, never>;
    Views: {
      recipe_previews: View<{
        id: string;
        slug: string;
        primary_collection: FandomKind;
        access_tier: AccessTier;
        dish_id: string;
        dish_title: string;
        dish_title_ja: string | null;
        dish_aliases: string[];
        recipe_version_id: string;
        version_number: number;
        locale: string;
        title: string;
        teaser: string;
        prep_minutes: number;
        cook_minutes: number;
        difficulty: Difficulty;
        dietary_tags: string[];
        allergen_summary: string[];
        hero_image_path: string | null;
        fandom_context: string | null;
        published_at: string;
      }>;
      recipe_details: View<{
        id: string;
        slug: string;
        primary_collection: FandomKind;
        access_tier: AccessTier;
        dish_id: string;
        dish_title: string;
        dish_title_ja: string | null;
        dish_aliases: string[];
        recipe_version_id: string;
        version_number: number;
        locale: string;
        title: string;
        teaser: string;
        prep_minutes: number;
        cook_minutes: number;
        difficulty: Difficulty;
        dietary_tags: string[];
        allergen_summary: string[];
        hero_image_path: string | null;
        fandom_context: string | null;
        published_at: string;
        description: string;
        yield_quantity: number;
        yield_unit: string;
        skill_notes: string;
        provenance_note: string;
        content_hash: string;
      }>;
      recipe_ingredients: View<{
        id: number;
        recipe_version_id: string;
        position: number;
        ingredient_id: string;
        ingredient_slug: string;
        name: string;
        name_ja: string | null;
        aliases: string[];
        quantity_min: number | null;
        quantity_max: number | null;
        unit_code: string | null;
        preparation: string;
        optional: boolean;
        group_label: string;
      }>;
      recipe_steps: View<{
        id: number;
        recipe_version_id: string;
        position: number;
        instruction: string;
        timer_seconds: number | null;
        temperature_c: number | null;
        safety_note: string;
        group_label: string;
      }>;
      appearances: View<{
        id: string;
        dish_id: string;
        primary_collection: FandomKind;
        appearance_type: AppearanceType;
        evidence_locator: string;
        evidence_note: string;
        confidence: number;
        verified_at: string;
        work_id: string | null;
        work_slug: string | null;
        work_title: string | null;
        entry_number: string | null;
        entry_title: string | null;
        location_name: string | null;
      }>;
      regional_substitutions: View<{
        id: string;
        ingredient_id: string;
        market: MarketCode;
        substitute_ingredient_id: string | null;
        substitute_name: string;
        ratio: number;
        note: string;
        priority: number;
      }>;
      public_profiles: View<{
        user_id: string;
        username: string;
        display_name: string;
        bio: string;
        avatar_object_path: string | null;
        profile_visibility: "public" | "followers" | "private";
        created_at: string;
      }>;
      following_feed: View<{
        id: string;
        author_id: string;
        username: string;
        display_name: string;
        recipe_id: string | null;
        body: string;
        published_at: string | null;
        created_at: string;
        reaction_count: number;
        comment_count: number;
      }>;
      my_notifications: View<{
        id: string;
        actor_id: string | null;
        kind: string;
        object_type: string;
        object_id: string | null;
        payload: Json;
        read_at: string | null;
        created_at: string;
      }>;
      my_progress: View<{
        user_id: string;
        total_xp: number;
        level: number;
        current_streak: number;
        longest_streak: number;
        last_cook_on: string | null;
        updated_at: string;
      }>;
      my_entitlement: View<{
        id: string;
        gateway: "razorpay" | "stripe";
        plan: "monthly" | "yearly" | "lifetime";
        status: string;
        effective_from: string;
        effective_until: string | null;
        lifetime: boolean;
      }>;
      my_collections: View<{
        id: string;
        slug: string;
        title: string;
        description: string;
        visibility: "public" | "followers" | "private";
        created_at: string;
        updated_at: string;
      }>;
      my_saves: View<{
        recipe_id: string;
        slug: string;
        title: string;
        offline_requested: boolean;
        saved_at: string;
      }>;
      my_cook_logs: View<{
        id: string;
        recipe_id: string;
        recipe_version_id: string;
        slug: string;
        title: string;
        completed_at: string | null;
        servings: number | null;
        rating: number | null;
        created_at: string;
      }>;
    };
    Functions: {
      get_my_account_context: {
        Args: Record<PropertyKey, never>;
        Returns: {
          account_state: string;
          country_code: string | null;
          social_eligible: boolean;
          advertising_eligible: boolean;
          entitlement_id: string | null;
          entitlement_status: string | null;
          entitlement_effective_from: string | null;
          entitlement_effective_until: string | null;
          entitlement_lifetime: boolean | null;
        }[];
      };
      get_my_ad_context: {
        Args: Record<PropertyKey, never>;
        Returns: {
          advertising_eligible: boolean;
          personalized_consent: boolean;
        }[];
      };
      react_to_post: {
        Args: {
          p_post_id: string;
          p_kind: "like" | "yum" | "inspired";
          p_active?: boolean;
        };
        Returns: boolean;
      };
      report_content: {
        Args: {
          p_target_type: string;
          p_target_id: string;
          p_reason: string;
          p_detail?: string;
        };
        Returns: string;
      };
      submit_recipe_suggestion: {
        Args: {
          p_title: string;
          p_source_declaration: string;
          p_payload: Json;
          p_license_accepted: boolean;
        };
        Returns: string;
      };
      create_private_collection: {
        Args: { p_title: string; p_description?: string };
        Returns: string;
      };
      record_personalized_ads_consent: {
        Args: {
          p_granted: boolean;
          p_policy_version: string;
          p_request_id?: string | null;
        };
        Returns: string;
      };
      request_account_deletion: {
        Args: { p_request_id?: string | null };
        Returns: string;
      };
      export_account_data: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      apply_entitlement_reconciliation: {
        Args: {
          p_entitlement_id: string;
          p_status: string;
          p_effective_until: string | null;
          p_request_id: string;
        };
        Returns: boolean;
      };
      has_studio_access: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_post_submission: {
        Args: { p_body: string; p_visibility?: string };
        Returns: { post_id: string; requires_owner_approval: boolean }[];
      };
      apply_post_moderation: {
        Args: {
          p_post_id: string;
          p_outcome: string;
          p_quarantine_path?: string | null;
          p_sanitized_path?: string | null;
          p_sha256?: string | null;
          p_mime_type?: string | null;
          p_width?: number | null;
          p_height?: number | null;
          p_alt_text?: string;
        };
        Returns: { final_state: string; published_at: string | null }[];
      };
      search_catalog: {
        Args: {
          search_query: string;
          result_limit?: number;
          after_slug?: string | null;
        };
        Returns: {
          entity_kind: string;
          entity_id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          rank: number;
        }[];
      };
      complete_cook: {
        Args: {
          p_recipe_id: string;
          p_recipe_version_id: string;
          p_idempotency_key: string;
          p_servings?: number | null;
        };
        Returns: {
          cook_log_id: string;
          awarded_xp: number;
          total_xp: number;
          was_duplicate: boolean;
        }[];
      };
      claim_supporter_offer: {
        Args: { offer_code: string };
        Returns: {
          claim_id: string;
          amount_minor: number;
          currency: string;
          gateway: string;
          checkout_expires_at: string;
          already_claimed: boolean;
        }[];
      };
      save_recipe: {
        Args: { p_recipe_id: string; p_offline_requested?: boolean };
        Returns: boolean;
      };
      follow_user: {
        Args: { target_user_id: string; should_follow?: boolean };
        Returns: boolean;
      };
      block_user: {
        Args: { target_user_id: string; should_block?: boolean };
        Returns: boolean;
      };
      mark_notification_read: {
        Args: { p_notification_id: string };
        Returns: boolean;
      };
      complete_age_gate: {
        Args: { p_country_code: string; p_date_of_birth: string };
        Returns: {
          account_state: string;
          minimum_age: number;
          social_eligible: boolean;
          advertising_eligible: boolean;
        }[];
      };
      publish_recipe_version: {
        Args: { p_recipe_version_id: string; p_request_id?: string | null };
        Returns: string;
      };
      get_checkout_claim: {
        Args: { p_claim_id: string };
        Returns: {
          claim_id: string;
          offer_code: string;
          amount_minor: number;
          currency: string;
          gateway: "razorpay" | "stripe";
          plan_interval: "monthly" | "yearly" | "lifetime";
          checkout_expires_at: string;
        }[];
      };
      consume_checkout_claim: {
        Args: {
          p_claim_id: string;
          p_user_id: string;
          p_external_checkout_id: string;
        };
        Returns: {
          claim_id: string;
          offer_code: string;
          amount_minor: number;
          currency: string;
          gateway: "razorpay" | "stripe";
          plan_interval: "monthly" | "yearly" | "lifetime";
          checkout_expires_at: string;
          already_consumed: boolean;
        }[];
      };
      record_verified_webhook: {
        Args: {
          p_gateway: "razorpay" | "stripe";
          p_external_event_id: string;
          p_event_type: string;
          p_external_occurred_at: string;
          p_raw_payload: Json;
          p_signature_verified: boolean;
        };
        Returns: {
          webhook_event_id: string;
          processing_state: string;
          was_duplicate: boolean;
        }[];
      };
      apply_entitlement_webhook: {
        Args: {
          p_webhook_event_id: string;
          p_user_id: string;
          p_external_customer_id: string | null;
          p_external_purchase_id: string;
          p_plan: "monthly" | "yearly" | "lifetime";
          p_status: string;
          p_effective_from: string;
          p_effective_until: string | null;
          p_lifetime: boolean;
          p_revoked_reason?: string | null;
        };
        Returns: {
          entitlement_id: string;
          applied: boolean;
          processing_state: string;
        }[];
      };
      entitlement_reconciliation_candidates: {
        Args: { p_before?: string; p_result_limit?: number };
        Returns: {
          entitlement_id: string;
          user_id: string;
          gateway: "razorpay" | "stripe";
          external_purchase_id: string;
          plan: "monthly" | "yearly" | "lifetime";
          status: string;
          effective_until: string | null;
          source_occurred_at: string;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
