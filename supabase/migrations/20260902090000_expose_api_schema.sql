-- Keep the hosted Data API aligned with supabase/config.toml: only the
-- explicitly reviewed API facade is exposed. Internal schemas remain private.
alter role authenticator set pgrst.db_schemas = 'api';
alter role authenticator set pgrst.db_extra_search_path = 'api, extensions';

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
