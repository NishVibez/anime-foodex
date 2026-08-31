begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('editorial-media', 'editorial-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('ugc-quarantine', 'ugc-quarantine', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('ugc-sanitized', 'ugc-sanitized', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "editorial media is publicly readable" on storage.objects;
create policy "editorial media is publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'editorial-media');

drop policy if exists "sanitized ugc is publicly readable" on storage.objects;
create policy "sanitized ugc is publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'ugc-sanitized');

drop policy if exists "users can upload only to their quarantine prefix" on storage.objects;
create policy "users can upload only to their quarantine prefix"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ugc-quarantine'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  and private.is_social_eligible()
);

-- Quarantine intentionally has no client SELECT, UPDATE, or DELETE policy. The
-- sanitizer reads it with a server-only secret, writes a new raster object to
-- ugc-sanitized, then deletes the original. SVG and animated formats are not
-- accepted by the bucket. Client-side upsert is deliberately unsupported.

commit;
