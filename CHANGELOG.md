# Changelog

## [Unreleased]

### Added

- Added `plan.md` to `.gitignore` to exclude development planning documents from version control.

### Changed

- Cleaned up template code: removed example factories, simplified localization, minimized preferences UI, and streamlined the addon lifecycle hooks.

### Added

- Initial Zotero plugin scaffold with addon bootstrap, preferences, localization, example modules, tests, and CI/release configuration.
- Agent workflow support including the writer prompt, temporary `.pi/git` workdir guidance, and a Zotero plugin development skill with reference docs.

### Changed

- Rebranded the project from the upstream template and updated package metadata, README content, and agent instructions.
- Refined CHANGELOG format to follow conventional style with proper sections.
- Migrated the plugin template and dependency set to Zotero 8.
- Refined internal documentation and prompt formatting for agent workflows.

### Fixed

- Corrected `test/tsconfig.json` so LSP diagnostics resolve test files correctly.

### Removed

- Removed the localized `doc/README-frFR.md` and `doc/README-zhCN.md` documentation copies.
