# Zotero Extra

[![zotero target version](https://img.shields.io/badge/Zotero-8-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)

Zotero Extra is a Zotero plugin project focused on enriching an item's `extra` field with useful derived metadata and surfacing that metadata back into the library UI.

The overall direction is to use the `extra` field as a durable place for plugin-managed metadata, starting with venue information and leaving room for more future features.

## Plan

- [ ] Venue alias lookup: fetch a venue's short alias, save it into `extra`, and display it in a custom column for quick library scanning.

## Current scope

- Based on `zotero-plugin-template`
- TypeScript plugin for Zotero 8 only
- Early-stage project setup and rebranding

## Development

### Requirements

1. Install Zotero 8
2. Install the latest LTS version of Node.js

### Setup

```sh
npm install
cp .env.example .env
```

Then update `.env` with your local Zotero executable and profile paths.

### Commands

- `npm start` — run Zotero in development mode with hot reload
- `npm run build` — build the plugin bundle
- `npm run lint:check` — run Prettier and ESLint checks
- `npm run test` — run plugin tests

## Notes

- This repository is being adapted from the template into a concrete plugin project.
- This repository currently supports Zotero 8 only.
