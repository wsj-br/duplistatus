# Migration plan: Docusaurus -> MkDocs Material

This document summarises the initial automated migration work and lists files that still require manual attention.

Nav mapping (sourced from `website/sidebars.ts`):

- Home: `intro.md` -> `index.md`
- Getting Started:
  - `getting-started/installation.md`
  - `getting-started/configuration.md`
  - `getting-started/first-steps.md`
- User Guide:
  - `user-guide/overview.md`
  - `user-guide/dashboard.md`
  - `user-guide/server-management.md`
  - `user-guide/notifications.md`
  - `user-guide/backup-monitoring.md`
  - `user-guide/troubleshooting.md`
- Development:
  - `development/setup.md`
  - `development/scripts.md`
  - `development/testing.md`
  - `development/database.md`
  - `development/ai-development.md`
- Migration:
  - `migration/overview.md`
  - `migration/version-0.7.md`
  - `migration/api-changes.md`
- Release Notes:
  - `release-notes/0.8.10.md`
  - `release-notes/0.7.27.md`

Automated work performed so far:

- Created `docs-site/mkdocs.yml` with an initial `nav` based on `sidebars.ts`.
- Created `docs-site/docs/` tree and copied/converted a subset of Docusaurus docs using `docs-site/scripts/convert_docs.py`.
- Copied images from `website/docs/img` and `website/static/img` into `docs-site/docs/img` via `docs-site/copy-images.sh`.

Files automatically converted: 20 markdown files (see `docs-site/scripts/convert_docs.py` run output).

Files requiring manual review / conversion:

- Any MDX/React snippets or examples embedded in markdown. Notable files flagged by automated scans:
  - `website/docs/development/testing.md` — contains JS/TS `import` statements and React testing examples. Convert code blocks and remove inlined imports or move examples into fenced code blocks.
  - `website/docs/development/ai-development.md` — contains TypeScript/React component fragments; these should be wrapped as code fences or removed if they are example snippets.

- Frontmatter/versioning:
  - Docusaurus used frontmatter for `sidebar_position` and `versions` in the config. The conversion script strips YAML frontmatter; if you rely on versioned routes, consider using MkDocs versioning plugins (e.g., mike) and map versions accordingly.

- Custom shortcodes and remark plugins:
  - Docusaurus used `remark-github-alerts`. The conversion script converted common admonitions, but verify that any custom shortcodes are handled.

Next recommended manual steps:

1. Review the placeholder pages in `docs-site/docs` and replace `... (content trimmed)` with full converted content where required.
2. Manually edit `development/testing.md` and `ai-development.md` to remove inline `import`/JSX code or move them into proper fenced code blocks.
3. Validate all internal links — MkDocs resolves relative links; run `mkdocs serve` locally after installing `mkdocs-material`.
4. (Optional) Add MkDocs plugins: `mike` for versioning, `awesome-pages` for automated nav, and `git-revision-date` if you want last update timestamps.

How to preview locally:

1. Install dependencies (Python + MkDocs Material):

   pip install mkdocs-material

2. Copy images:

   ./docs-site/copy-images.sh

3. Serve:

   mkdocs serve -f docs-site/mkdocs.yml

Notes: `mkdocs` is not installed in this environment (checked during migration). Install it locally or in a virtualenv to preview the site.
