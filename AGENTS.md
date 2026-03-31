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

## Agent note

- For development workflow and Zotero API reference, agents should refer to the `zotero-plugin-template` skill.
