# Zotero Extra

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Bootstrapped%20from-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

Zotero Extra is a Zotero plugin project intended to fetch, process, and save useful information into Zotero items' **Extra** fields.

> [!note]
> The current code base is still the default scaffold generated from `zotero-plugin-template` and does **not** provide the actual Zotero Extra functionality yet.

## Status

This project is currently in the bootstrap stage.

Planned direction:

- Fetch useful metadata or derived information for Zotero items
- Process and normalize that information
- Save the results into each item's **Extra** field

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
