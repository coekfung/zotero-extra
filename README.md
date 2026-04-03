# Zotero Extra

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Bootstrapped%20from-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

Zotero Extra is a Zotero plugin that fetches, processes, and saves useful information into Zotero items' **Extra** fields.

## Features

### Semantic Scholar Conference Names

Automatically fetches short conference names from [Semantic Scholar](https://www.semanticscholar.org) and saves them to items' **Extra** field.

- Works with items that have a DOI
- Rate-limited API calls (3.5s without API key, 1s with API key)
- Optional API key support for faster requests (configure in preferences)
- Short conference names stored as `shortConferenceName: <short name>` in the Extra field

## Development

This project was bootstrapped from the Zotero Plugin Template and keeps the standard development workflow.

Before running the plugin, make sure you set up the development environment by following the instructions in `.env.example` and creating your local `.env` file.

```sh
cp .env.example .env
# edit .env and configure your local Zotero executable/profile paths
npm install
```

Useful commands:

```sh
npm start       # start development server and load the plugin in Zotero
npm run build   # build the plugin
npm run lint:check
npm run lint:fix
npm test
```

> FOR AGENTS: NEVER run `npm start` as it requires user interaction.

## Template Credits

This project is based on:

- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- [Zotero Plugin Toolkit](https://github.com/windingwind/zotero-plugin-toolkit)
- [Zotero Plugin Scaffold](https://github.com/northword/zotero-plugin-scaffold)

## License

AGPL-3.0-or-later
