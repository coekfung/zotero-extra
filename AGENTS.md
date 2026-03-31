# AGENTS

## Project

- Name: Zotero Extra
- Stack: Zotero plugin template + TypeScript
- Target: Zotero 8 only

## Current direction

- Use the item's `extra` field to store derived or fetched metadata.
- Build the plugin as an extensible collection of `extra`-field-powered features over time.

## Working style

- Keep hooks thin and put feature logic in modules.
- Prefer incremental, easy-to-review changes.
- Keep user-facing copy branded as `Zotero Extra`.

## Planning & PR workflow

- Default: keep plans in PR text, not repo files.
- Put implementation plans, deferred work, and follow-up ideas in the PR description or PR comments.
- Do not add `PLAN.md`, `TODO.md`, `ROADMAP.md`, scratch notes, or similar planning files for normal feature work.
- Discover scope first, then choose the smallest coherent PR cut.
- Split work explicitly into:
  - Current PR: required to deliver the change cleanly now
  - Later PRs: useful but not required, dependent, risky, or too large for the current diff
- Record that split in the PR body under short sections such as `## Plan`, `## Deferred` / `## Follow-ups`, and `## Out of scope`.
- Update PR text as understanding changes; do not leave stale plans behind.
- Avoid repo pollution:
  - no standalone planning files for one-off work
  - no agent scratch files, dated notes, or temporary checklists
  - no orphaned TODOs in code for work that belongs in a later PR; put that context in the PR instead
- Create a persistent repo doc only when the note is durable across multiple PRs, useful to future implementers/reviewers, and substantive enough to live with the codebase.
- Good candidates for repo docs: architecture decisions, data or `extra`-field schema/contracts, migration behavior, and user-visible behavior that future work must follow.
- Not good candidates for repo docs: phase plans, feature task lists, session notes, and single-PR implementation checklists.
- Rule of thumb: if the note is mainly about what to do next for this PR series, keep it in the PR; if it explains how the system should work over time, make it a repo doc.

## Agent note

- For development workflow and Zotero API reference, agents should refer to the `zotero-plugin-template` skill.
