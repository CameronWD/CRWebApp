# 1. Worksheet formats are stamped per record, never converted

Date: 2026-09-10

## Status

Accepted

## Context

The app originally offered one worksheet structure (now "Classic"): multiple emotions,
multiple automatic thoughts with a hot thought, optional distortions, a balanced thought,
and a re-rating of the same emotions. The user's therapist works from a different paper
worksheet ("Realistic Thinking"): one thought with a 0–100% belief rating, one emotion,
evidence for/against, an alternative thought with its own belief rating, and a fresh
"emotion now" that may be a different emotion. Both formats must coexist: the therapist's
sheet as the default for new records, the original still available, and existing records
preserved.

The two shapes are not losslessly convertible in either direction: Classic has no belief
ratings; Realistic Thinking has nowhere to put non-hot thoughts or distortions.

## Decision

Every ThoughtRecord is stamped with its worksheet format at creation and keeps it for
life. The `worksheetFormat` setting only selects the format for *new* records. A record
is always viewed, completed, and edited in its native format; an Open Record completes
in the format it was started in. There is no conversion path between formats, and the
record list shows a mix.

Existing rows are backfilled to `format: 'classic'` (Dexie v3); backup files bump to
version 2, and version-1 backups import as Classic.

## Consequences

- No data loss and no migration risk when the setting changes.
- Display components (card, detail, wizard, done screen) branch on `record.format`.
- The record type carries both formats' fields, with the unused side empty/null.
- A future third format follows the same pattern: stamp, branch, never convert.
