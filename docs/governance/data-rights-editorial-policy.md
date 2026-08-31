# Data, rights, and editorial policy

**Status:** Pre-GA operating policy  
**Owner:** Product owner; designated privacy, culinary, and IP reviewers must be named before GA  
**Review cadence:** Before every release rehearsal and quarterly after GA

This policy turns source discovery into independently authored, safe editorial content. It does not declare that any candidate, recipe, source, image, or franchise use has passed legal or culinary review.

## 1. Data classification

| Class             | Examples                                                                                                                               | Storage and access rule                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Public            | Published preview fields, public profile name, approved post, public collection                                                        | Explicit public view/bucket only; safe for indexing and shared caching.                                   |
| Member-private    | Saves, cook history, private notes, preferences, private collections, personal progress                                                | Owner and narrowly authorized staff only; never shared-cache or public analytics payload.                 |
| Restricted        | Birth date, declared country, consent history, provider email, billing customer ID, entitlement, report/block history, moderation case | `private` schema or equivalent restricted system; field-level redaction in logs and exports.              |
| Security-critical | Roles, service credentials, webhook secrets, raw signature material, audit history, incident evidence                                  | Server/operator only; least privilege, immutable audit where possible, no client delivery.                |
| Quarantined       | Unreviewed upload, submitted source, suspicious file, raw moderation payload                                                           | Non-public isolated location; scanner/reviewer only; delete on schedule or incident hold.                 |
| Research-only     | Supplied cookbooks, webpage captures, private locators, factual extraction notes                                                       | Isolated research workspace, never production Storage, public repo, client bundle, or publication output. |

Collect the minimum fields needed for a documented purpose. Date of birth is private and used for eligibility; the public profile stores only the resulting eligibility state needed by a feature. Do not infer or publish precise location. Do not put private values in error monitoring, product analytics, ad parameters, URLs, or support screenshots.

## 2. Source intake and research isolation

All supplied PDFs and cited webpages are candidate-discovery inputs, not publication licenses.

1. Create an intake record with an opaque source ID, submitter, source declaration, acquisition date, expected type, and reason for use.
2. Hash the original and record byte size. Preserve the original only in the isolated research workspace for the shortest necessary period.
3. Malware-scan it; reject or isolate encrypted, malformed, executable, embedded-file, JavaScript, macro, or launch-action content. The FFXV source specifically requires removal of its embedded print action before private analysis.
4. Parse only in an isolated, non-production process with no service credentials and bounded CPU, memory, pages, recursion, and output size.
5. Extract only factual leads: dish/recipe title, ingredient names, measurements as facts, aliases, work/episode candidates, and a private locator. Do not extract or retain expressive instructions, headnotes, scans, page artwork, photographs, layout, or long prose.
6. Store the lead as `research_only` or `rights_unknown`. A lead never becomes publishable merely because multiple sources repeat it.
7. Never upload a supplied source, scan, page image, or protected extracted text to Supabase Storage, GitHub, the public site, an LLM training corpus, or a user-visible moderation record.

The research workspace is not a production content source of truth. A clean editorial record must be independently authored and linked to evidence by private locator, not by copied text.

## 3. Two-track evidence model

Every publication candidate has two independent evidence tracks:

### Occurrence evidence

Occurrence evidence establishes the food-to-work connection. It must record the work, appearance type, source, a precise locator appropriate to the medium, verifier, verification date, and confidence. Examples are episode plus timecode, chapter plus page, game item plus quest, film scene description, or park/menu location.

Aggregator articles and the supplied candidate links can suggest records but do not verify them. Prefer an official work, licensed release, official publisher registry, official companion material, or direct observation by an editor with a lawful copy. A recipe source is not automatically occurrence evidence.

### Culinary evidence

Culinary evidence establishes that the independently authored preparation is safe and workable. It must record recipe version, test date, tester, equipment and market, actual yield, timing, temperatures, deviations, outcome, allergen review, and required corrections. Published claims must be supported by the test record or a cited authoritative food-safety source.

Neither track substitutes for the other. Both must be complete before publication.

## 4. Editorial state and publication gate

The allowed progression is:

`candidate → evidence_verified → drafted → test_cooked → culinary_reviewed → rights_cleared → published → retired`

Skipping a state requires a recorded reason and the same underlying evidence. The publishing function must reject a version unless all of the following records are complete:

- at least one verified occurrence locator for the canonical dish/work connection;
- independently written title, teaser, ingredient quantities, steps, substitutions, and safety notes;
- structured metric quantities plus reviewed imperial conversions;
- dietary and allergen review, including cross-contact caveats where appropriate;
- India, North America, Europe, and configured-market availability/substitution review;
- completed kitchen test against the exact candidate version;
- culinary reviewer approval by someone other than the author/tester where staffing allows;
- original or licensed food media with creator, license scope, territory, term, and source file recorded;
- IP/rights decision for names, context, quotations, logos, trade dress, screenshots, and artwork;
- rights status other than `research_only` or `rights_unknown`;
- canonical slug, access tier, quota-counting primary collection, source locators, and audit request ID; and
- automated content CI pass.

A checkbox is not a review. Each sign-off stores reviewer identity, role, timestamp, recipe-version digest, decision, and notes. The owner cannot mark missing specialist review as complete. If a specialist is unavailable, publication remains blocked.

## 5. Authorship and version integrity

- Authors may use factual ingredients and measurements as research, but must write selection, ordering, explanations, substitutions, headnotes, and instructions independently.
- Do not imitate a supplied author's expression or lightly paraphrase a protected recipe. When in doubt, restart from factual notes and an independent kitchen test.
- Never publish franchise artwork, screenshots, scans, character likenesses, logos, or trade dress without a documented license or counsel-approved basis.
- Food photography must be original or explicitly licensed for the intended commercial, derivative, promotional, and archival uses.
- A published recipe version is immutable. A correction creates a successor version linked to the predecessor with a change reason. Old versions remain auditable but are not served as current.
- Search previews and metadata include preview fields only. Full quantities and steps are authorized data, regardless of access tier.

## 6. User submissions and contributor license

The submission form must obtain:

- a source declaration and precise locator;
- confirmation that the user wrote the text and owns or is authorized to license uploaded media;
- a non-exclusive license sufficient to review, moderate, edit, publish, display, distribute, and remove the submitted material;
- consent to moderation and retention needed for disputes; and
- an acknowledgement that scans, screenshots, copied instructions, franchise artwork, personal information, and media without contributor rights are prohibited.

Submissions are suggestions. They do not publish directly and do not guarantee credit, payment, acceptance, or continuing availability. Preserve the contributor's declared attribution when publishing permitted content. Reject suspicious ownership or copied-expression cases into the rights queue.

## 7. Corrections, safety reports, and rights complaints

Provide public, accessible paths for factual correction, food-safety concern, privacy request, and infringement/takedown request. Before GA, configure monitored addresses and legal notices; placeholders must not be presented as working contacts.

1. Acknowledge and assign a case ID.
2. Preserve the challenged version, relevant audit history, and evidence under a restricted legal/incident hold.
3. If the report alleges imminent cooking danger, private-data exposure, or clearly unauthorized media, unpublish or restrict the item while triaging.
4. Keep the complainant's identity and evidence restricted. Do not copy the full complaint into public tickets.
5. Route food safety to the culinary reviewer, privacy to the privacy owner, and rights/takedown matters to qualified counsel or the designated rights reviewer.
6. Record the decision, basis, scope, timestamps, and corrective version or removal action. Notify affected parties where lawful and safe.
7. Provide a counter-notice path only after counsel approves the jurisdiction-specific workflow. Do not improvise legal advice or restore disputed material automatically.

## 8. Retention and deletion schedule

The following are provisional operating defaults, not claims about statutory periods. Counsel and the Indian accountant must approve them before GA, and provider/legal holds override routine deletion.

| Record                                                |                                  Provisional default | Deletion behavior                                                                                          |
| ----------------------------------------------------- | ---------------------------------------------------: | ---------------------------------------------------------------------------------------------------------- |
| Rejected ordinary upload in quarantine                |                                              30 days | Delete object and transient parser/moderation output; retain minimal decision hash and reason for 90 days. |
| Flagged upload, appeal, safety, or abuse case         |                                 1 year after closure | Restrict access; retain longer only for documented repeat-abuse or legal hold.                             |
| Raw webhook request body                              |                             Do not retain by default | Store provider, event ID, digest, outcome, timestamps, and minimal normalized fields.                      |
| Payment, invoice, refund, tax, and remittance records |                                   Accountant-defined | Delete only after approved statutory/accounting period and dispute hold.                                   |
| Consent history and policy version                    |        Account lifetime plus approved dispute period | Retain proof of withdrawal minimally; remove unrelated personal detail.                                    |
| Date of birth and declared country                    |                                     Account lifetime | Delete with account after eligibility/accounting holds; public export never includes another user's data.  |
| Audit and moderation ledger                           |                                  2 years provisional | Append-only; redact unnecessary payloads; extend for active incident or legal hold.                        |
| Deleted-account public content                        |                        User-selected where available | Remove or anonymize according to product promise and legal obligations; propagate to search/cache.         |
| Research source originals                             | Shortest research period, maximum 90 days by default | Delete after factual lead extraction unless documented rights/legal hold requires isolation.               |

Deletion must cover database rows, Storage objects, derived thumbnails, search indexes, CDN caches, offline leases, background queues, and analytics identifiers. Backups expire through their documented lifecycle; do not silently restore deleted accounts during a disaster recovery.

## 9. Access, separation of duties, and audit

- Editors draft; culinary reviewers approve culinary evidence; rights reviewers approve rights; publishers perform the final state transition. Combining roles is a recorded pre-GA exception, not silent approval.
- Moderators cannot change billing entitlements. Billing operators cannot publish recipes. Support staff cannot read birth dates or provider/billing identity unless the case requires it.
- Service credentials do not represent a human role. Administrative tools must still record the initiating human and request ID.
- Every publish, unpublish, takedown, role change, moderation action, entitlement override, refund synchronization, and destructive repair is audited.
- Audit access is itself audited and limited to incident, compliance, or owner review.

## 10. Quality review

At each release rehearsal, sample records from every primary collection and access tier. Compare served preview/detail payloads, rights records, exact published recipe version, media object, allergen summary, evidence locator, and CI result. A discrepancy blocks promotion. The GA catalog gate is defined separately in [`../release/ga-content-gate.md`](../release/ga-content-gate.md).
