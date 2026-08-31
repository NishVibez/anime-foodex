begin;

create policy game_events_no_client_access on private.game_events for all to anon, authenticated using (false) with check (false);
create policy webhook_events_no_client_access on private.webhook_events for all to anon, authenticated using (false) with check (false);
create policy xp_ledger_no_client_access on private.xp_ledger for all to anon, authenticated using (false) with check (false);
create policy xp_rules_no_client_access on private.xp_rules for all to anon, authenticated using (false) with check (false);

create index appearances_verified_by_idx on catalog.appearances(verified_by);
create index editorial_reviews_reviewer_id_idx on catalog.editorial_reviews(reviewer_id);
create index ingredients_default_unit_code_idx on catalog.ingredients(default_unit_code);
create index media_assets_approved_by_idx on catalog.media_assets(approved_by);
create index recipe_ingredients_unit_code_idx on catalog.recipe_ingredients(unit_code);
create index recipe_versions_authored_by_idx on catalog.recipe_versions(authored_by);
create index rights_records_reviewed_by_idx on catalog.rights_records(reviewed_by);
create index sources_created_by_idx on catalog.sources(created_by);
create index test_sessions_tested_by_idx on catalog.test_sessions(tested_by);
create index unit_conversions_to_unit_code_idx on catalog.unit_conversions(to_unit_code);
create index notifications_actor_id_idx on community.notifications(actor_id);
create index entitlements_source_webhook_event_id_idx on private.entitlements(source_webhook_event_id);
create index moderation_actions_reversed_by_idx on private.moderation_actions(reversed_by_action_id);
create index offer_claims_offer_id_idx on private.offer_claims(offer_id);
create index role_assignments_granted_by_idx on private.role_assignments(granted_by);
create index subscriptions_source_webhook_event_id_idx on private.subscriptions(source_webhook_event_id);
create index user_achievements_game_event_id_idx on private.user_achievements(game_event_id);
create index xp_ledger_xp_rule_id_idx on private.xp_ledger(xp_rule_id);

commit;
