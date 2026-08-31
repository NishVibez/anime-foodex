# Moderation and upload runbook

**Applies to:** cook photos, profile images, comments, reviews, posts, recipe suggestions, and staff source intake  
**Rule:** Nothing moves from quarantine to a public bucket or feed until every required automated and human gate has passed.

## State machine

`received → validating → quarantined → automated_review → human_review → approved → sanitized_publishable`

Terminal or holding states are `rejected`, `appealed`, `removed`, `legal_hold`, and `error_closed`. A retry creates an audited attempt; it must not bypass a failed gate.

## Upload acceptance

Before issuing an upload path, authenticate the account, confirm age/social eligibility for the surface, enforce block/report restrictions, and reserve a per-user opaque object key. Apply account, IP, and device rate limits. Do not trust filename, extension, browser MIME, dimensions, or a client-side moderation result.

The server-side processor must:

1. verify bucket and user-bound object prefix;
2. cap bytes before fully buffering and reject partial/oversized content;
3. identify magic bytes and allow only supported JPEG, PNG, or WebP raster input;
4. reject SVG, PDF, archives, videos, animated images, embedded files, and decoder errors;
5. decode with a patched library under pixel, dimension, frame, memory, and time limits;
6. normalize orientation, strip EXIF/ICC/comment/application metadata, flatten unsupported alpha behavior, and re-encode a new raster object;
7. compute hashes for the original bytes and sanitized pixels for duplicate/known-abuse detection;
8. run local spam, URL, profanity, duplicate, and prohibited-file rules;
9. submit the sanitized raster and relevant text to `omni-moderation-2024-09-26` using a server-held key;
10. write only the moderation categories, scores needed for review, model version, request ID, and decision—not an unnecessary copy of private input; and
11. delete the quarantined original after approval/rejection retention rules allow, never by client request.

If moderation times out, is rate-limited, errors, returns an unknown schema, or ceases to meet the approved no-cost constraint, set `error_closed` and route to the owner queue. Never auto-publish on service failure.

## Decision matrix

| Condition                                                                        | Automated disposition       | Human action                                                        |
| -------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| Invalid bytes, disallowed type, decoder failure, size/pixel limit                | Reject                      | Review only if appeal alleges a processor defect.                   |
| Malware, executable behavior, known abuse hash                                   | Reject and restrict account | Owner/security review; consider incident response.                  |
| Sexual, violent, harassment, personal-data, minor, or non-food signal            | Hold                        | Owner review required; reject if policy applies.                    |
| Suspected infringement, screenshot, scan, franchise artwork, copied instructions | Rights hold                 | Rights reviewer decides; never publish while unknown.               |
| Unsafe cooking instruction or allergen claim                                     | Culinary hold               | Culinary reviewer decides; preserve exact submitted version.        |
| Spam/link/profanity/duplicate threshold                                          | Hold or reject              | Moderator reviews context and repeat behavior.                      |
| Automated pass from a user's first three UGC items                               | Hold                        | Owner approval required.                                            |
| Automated pass from established user, no flag                                    | Eligible                    | Publish only after sanitation transaction and random-sample policy. |
| Any appeal, takedown, or previous removal                                        | Hold                        | Owner or designated specialist required.                            |

## Human review procedure

1. Open the case through the Studio queue; never download the original to a personal device.
2. Confirm the reviewer is allowed to view the class of content. Recuse on personal conflict.
3. Review the sanitized preview, text, automated reasons, prior relevant actions, ownership declaration, and surface context. Do not browse unrelated private account data.
4. Select a policy reason, scope, duration, and reversible action. Free-text notes must be factual and omit unnecessary sensitive detail.
5. For approval, verify the publish object is the sanitized digest reviewed—not the quarantined bytes.
6. For removal, invalidate feed/search/CDN references and revoke offline access where applicable.
7. Notify the contributor in plain language, with an appeal path, except where notification would compromise an active safety/security investigation.

## Blocks, reports, and propagation

- A block immediately prevents new follows, comments, reactions, mentions, and visibility where the product promises it. Invalidate feed materialization and notification candidates.
- Reports are private and do not disclose the reporter to the reported user. Duplicate reports may group for triage but retain each reporter's record.
- Removing a post also removes its media from public access and suppresses dependent comments/reactions in user surfaces while preserving restricted audit evidence.
- Reversible moderation uses a new action referencing the prior action. Do not edit history in place.

## Appeals and sampling

Appeals must be assigned to a reviewer other than the original reviewer where staffing allows. Record whether the policy, evidence, or enforcement was wrong; reinstate only the same sanitized digest or send the content through processing again.

Audit a random sample of automated passes from every surface and language cohort. Track false-pass, false-hold, reversal, time-to-decision, repeat-offender, and queue-age rates. A rising false-pass rate or queue age over the configured limit disables automatic eligibility and alerts the owner.

## Emergency actions

Invoke the incident runbook when there is public access to quarantine, a moderation fail-open, widespread unsafe content, decoder compromise, personal-data leakage, suspected child-safety content, or a malicious file reaching staff systems. Preserve hashes and audit events; do not redistribute the material in tickets or chat.

## Pre-GA evidence

- [ ] Magic-byte/type/size/pixel/animation tests pass for allowed and adversarial fixtures.
- [ ] EXIF and embedded metadata are absent from published objects.
- [ ] Quarantine has no client read/update/delete policy.
- [ ] Sanitized public object digest binds to the reviewed digest.
- [ ] Provider outage and rate-limit tests enter `error_closed`.
- [ ] First-three-item and flagged-content owner queues are enforced.
- [ ] Block/report/removal propagation is verified end to end.
- [ ] Queue metrics and alerts reach the designated owner.
- [ ] Retention deletion removes original, derivatives, indexes, and caches.
