"""Build the private Supabase intake migration from the safe research manifest.

The generated SQL stores only factual titles, source hashes, and PDF page
locators. It intentionally does not contain source prose, ingredients,
quantities, instructions, or media.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


MANIFEST_PATH = Path("content/research/reference-cookbook-candidates.json")


def compact_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def postgres_jsonb_literal(value: object, tag_name: str) -> str:
    """Encode JSON in a collision-free PostgreSQL dollar-quoted literal."""

    payload = compact_json(value)
    suffix = 0
    while True:
        candidate = tag_name if suffix == 0 else f"{tag_name}_{suffix}"
        delimiter = f"${candidate}$"
        if delimiter not in payload:
            return f"{delimiter}{payload}{delimiter}::jsonb"
        suffix += 1


def build_sql() -> str:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    sources = manifest["sources"]
    occurrences = manifest["occurrences"]
    expected_sources = manifest["summary"]["sourceCount"]
    expected_occurrences = manifest["summary"]["occurrenceCount"]
    sources_jsonb = postgres_jsonb_literal(sources, "reference_sources")
    candidates_jsonb = postgres_jsonb_literal(
        occurrences, "reference_candidates"
    )
    candidate_ids_jsonb = postgres_jsonb_literal(
        [row["id"] for row in occurrences], "candidate_ids"
    )

    return f"""begin;

create table catalog.source_recipe_candidates (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]*:[0-9]{{3,}}$'),
  source_id uuid not null references catalog.sources(id) on delete cascade,
  title text not null check (length(title) between 1 and 300),
  normalized_title text not null check (length(normalized_title) between 1 and 300),
  canonical_key text not null check (canonical_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  primary_collection catalog.fandom_kind not null,
  franchise_hint text not null check (length(franchise_hint) between 1 and 200),
  source_page smallint not null check (source_page > 0),
  source_locator text not null check (length(source_locator) between 3 and 100),
  candidate_kind text not null check (candidate_kind = 'recipe_or_named_component'),
  extraction_method text not null check (extraction_method in (
    'pdf_outline',
    'text_toc_or_index',
    'curated_heading_or_index_review',
    'visual_toc_or_heading_review'
  )),
  rights_status catalog.rights_status not null default 'research_only'
    check (rights_status = 'research_only'),
  editorial_state catalog.editorial_state not null default 'candidate'
    check (editorial_state = 'candidate'),
  created_at timestamptz not null default now(),
  unique (source_id, source_page, normalized_title)
);

comment on table catalog.source_recipe_candidates is
  'Private discovery queue. Factual source titles and locators only; never publish directly.';

create index source_recipe_candidates_source_id_idx
  on catalog.source_recipe_candidates(source_id);
create index source_recipe_candidates_normalized_title_idx
  on catalog.source_recipe_candidates(normalized_title);
create index source_recipe_candidates_canonical_key_idx
  on catalog.source_recipe_candidates(canonical_key);

alter table catalog.source_recipe_candidates enable row level security;
alter table catalog.source_recipe_candidates force row level security;
revoke all on table catalog.source_recipe_candidates from public, anon, authenticated;
create policy source_recipe_candidates_no_client_access
  on catalog.source_recipe_candidates
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
grant usage on schema catalog to service_role;
grant select, insert, update, delete on table catalog.source_recipe_candidates to service_role;

with source_payload as (
  select *
  from jsonb_to_recordset({sources_jsonb})
    as source_row(
      key text,
      title text,
      "fileName" text,
      sha256 text,
      "pageCount" integer,
      "primaryKind" text,
      "franchiseHint" text,
      "rightsStatus" text
    )
)
insert into catalog.sources (
  title,
  source_kind,
  file_sha256,
  rights_status,
  is_primary_verification,
  private_locator
)
select
  source_row.title,
  'research_file'::catalog.source_kind,
  source_row.sha256,
  'research_only'::catalog.rights_status,
  false,
  'user_supplied_reference:' || source_row."fileName"
from source_payload source_row
where not exists (
  select 1
  from catalog.sources existing_source
  where existing_source.file_sha256 = source_row.sha256
);

with candidate_payload as (
  select *
  from jsonb_to_recordset({candidates_jsonb})
    as candidate_row(
      id text,
      "sourceKey" text,
      title text,
      "normalizedTitle" text,
      "canonicalKey" text,
      "sourcePage" integer,
      "sourceLocator" text,
      "primaryKind" text,
      "franchiseHint" text,
      "candidateKind" text,
      "extractionMethod" text,
      "rightsStatus" text,
      "editorialState" text
    )
), source_payload as (
  select *
  from jsonb_to_recordset({sources_jsonb})
    as source_row(key text, sha256 text)
)
insert into catalog.source_recipe_candidates (
  id,
  source_id,
  title,
  normalized_title,
  canonical_key,
  primary_collection,
  franchise_hint,
  source_page,
  source_locator,
  candidate_kind,
  extraction_method,
  rights_status,
  editorial_state
)
select
  candidate_row.id,
  source_record.id,
  candidate_row.title,
  candidate_row."normalizedTitle",
  candidate_row."canonicalKey",
  candidate_row."primaryKind"::catalog.fandom_kind,
  candidate_row."franchiseHint",
  candidate_row."sourcePage"::smallint,
  candidate_row."sourceLocator",
  candidate_row."candidateKind",
  candidate_row."extractionMethod",
  candidate_row."rightsStatus"::catalog.rights_status,
  candidate_row."editorialState"::catalog.editorial_state
from candidate_payload candidate_row
join source_payload source_row on source_row.key = candidate_row."sourceKey"
cross join lateral (
  select source.id
  from catalog.sources source
  where source.file_sha256 = source_row.sha256
  order by source.created_at, source.id
  limit 1
) source_record
on conflict (id) do nothing;

do $validation$
begin
  if (
    select count(distinct source_id)
    from catalog.source_recipe_candidates
    where id in (
      select jsonb_array_elements_text({candidate_ids_jsonb})
    )
  ) <> {expected_sources} then
    raise exception 'Reference candidate migration did not link all {expected_sources} sources';
  end if;

  if (
    select count(*)
    from catalog.source_recipe_candidates
    where id in (
      select jsonb_array_elements_text({candidate_ids_jsonb})
    )
  ) <> {expected_occurrences} then
    raise exception 'Reference candidate migration did not load all {expected_occurrences} occurrences';
  end if;
end
$validation$;

commit;
"""


def main() -> None:
    output = build_sql()
    if len(sys.argv) == 2:
        Path(sys.argv[1]).write_text(output, encoding="utf-8", newline="\n")
        print(f"Wrote {sys.argv[1]}")
        return
    sys.stdout.buffer.write(output.encode("utf-8"))


if __name__ == "__main__":
    main()
