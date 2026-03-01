# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2]

### Fixed
- **application-logs-viewer useEffect exhaustive-deps**: Resolved react-hooks/exhaustive-deps warning for the auto-scroll effect. `logData` is intentionally omitted from the dependency array so we only scroll when auto-scroll or selected file changes, not on every poll; new-line scrolling is handled in loadLogs. Added an eslint-disable-next-line with a short comment.
- **Build warning vscode-languageserver-types (documentation)**: Suppressed Webpack "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted" for transitive dependency `vscode-languageserver-types` (from intlayer-editor) in the **documentation** (Docusaurus) build via an inline plugin in `documentation/docusaurus.config.ts` that adds `ignoreWarnings`. The warning occurs during the docs build only, not the main app.

### Security
- **Dependabot dependency updates (documentation)**: Merged two Dependabot PRs to address vulnerabilities in the documentation workspace: (1) bump `ajv` in `/documentation` (8.17.1→8.18.0 and 6.12.6→6.14.0); (2) bump `fast-xml-parser` in `/documentation` (5.3.5→5.3.6). Both were merged via the dependabot multi-update for /documentation.
- **Dependency vulnerabilities**: Fixed 4 high-severity vulnerabilities by adding pnpm overrides:
  - `minimatch >=3.1.4`: Fixes GHSA-3ppc-4f35-3m26 (ReDoS via repeated wildcards), GHSA-7r86-cg39-jmmj (combinatorial backtracking), and GHSA-23c5-xmqv-rm74 (nested extglobs backtracking) in documentation>@docusaurus/core>serve-handler>minimatch.
  - `serialize-javascript >=7.0.3`: Fixes GHSA-5c6j-r48x-rmvq (RCE via RegExp.flags and Date.prototype.toISOString()) in webpack>terser-webpack-plugin>serialize-javascript.

### Fixed

### Changed
- **Release notes**: Added documentation/docs/release-notes/1.3.2.md and linked it in the release notes sidebar (sidebars.ts).
- **Documentation**: Updated Docker script names to match package.json: `docker-up` → `docker:up`, `docker-down` → `docker:down`, `docker-clean` → `docker:clean`, `docker-devel` → `docker:devel` in AGENTS.md and documentation/docs (setup.md, devel.md, release-management.md).
- **Documentation**: Updated package versions to match package.json in AGENTS.md, documentation/docs/development/setup.md, documentation/docs/development/development-guidelines.md, and .cursor/rules/project-rule.mdc: pnpm 10.30.3, TypeScript ^5.9.3, Next.js ^16.1.6, React ^19.2.4, Tailwind CSS ^4.2.1, intlayer family ^8.1.8, lucide-react ^0.575.0, react-day-picker ^9.14.0, react-hook-form ^7.71.2, ESLint ^9.16.0, webpack ^5.105.3.


### Added

### Changed

### Fixed



### Changed


### Improved


### Removed
