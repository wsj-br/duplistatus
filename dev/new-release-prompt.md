# New Release Prompt

You are an AI coding agent preparing a new release of **duplistatus**. Follow these
instructions end to end. Work autonomously: gather the inputs, generate the release
notes, update the changelog, and verify the build. Only stop to ask the user if you
hit an ambiguous decision that you cannot resolve from the repo itself.

---

## 1. Determine the version number

- Read the `version` field from [`package.json`](../package.json) (line 3). This is the
  **new release version** (e.g. `1.4.2`). Use it verbatim everywhere below — do **not**
  invent or bump it yourself.
- Throughout this document, `<VERSION>` means that exact string and `<VER-DASH>` means
  the same value with dots removed (e.g. `1.4.2` → `142`) for use in Markdown heading
  anchors.

## 2. Collect the user-facing changes

- Read [`dev/CHANGELOG.md`](./CHANGELOG.md) and use the entries under the
  **`## Unreleased`** section as the source of truth.
- Select only the **user-facing** changes: new features, security fixes, backend fixes
  that affect behaviour, and notable changes. Skip purely internal/dev-tooling churn
  that has no user impact (use judgement — e.g. "dev request logs timestamp" is minor;
  a Docker startup crash fix is user-facing and important).
- Group what you find by the same buckets used in the changelog: **Security**,
  **Fixed**, **Changed**, **Added**, **Removed**, **Deprecated** (only the ones that
  actually have entries).

## 3. Create the release notes file

- Create `documentation/docs/release-notes/<VERSION>.md`.
- **Only edit the English docs** under `documentation/docs/`. Do **not** touch translated
  files under `documentation/i18n/` — those are produced by the i18n tooling.
- Base the structure on these existing examples (read them first to match tone, heading
  style, and anchor format):
  - [`documentation/docs/release-notes/1.4.1.md`](../documentation/docs/release-notes/1.4.1.md)
    (full feature release)
  - [`documentation/docs/release-notes/1.3.2.md`](../documentation/docs/release-notes/1.3.2.md)
    (maintenance / security release)
  - [`documentation/docs/release-notes/1.3.0.md`](../documentation/docs/release-notes/1.3.0.md)
    (feature release with API changes)

### Required structure

Every heading uses an explicit anchor in the form `{#anchor-id}`. Use this skeleton,
including only the sections that have content (e.g. omit **New features** for a pure
maintenance release, omit **API Endpoints** if no endpoints changed):

```markdown
# Version <VERSION> {#version-<VER-DASH>}

## Overview {#overview}

<One short paragraph summarising the release: what kind of release it is
(feature / maintenance / security) and the headline changes.>

---

## New features {#new-features}

### <Feature group> {#feature-group-anchor}

- **<Feature name>**: <user-facing description>. (reference issue #NN if applicable)

---

## Improvements {#improvements}

### <Improvement group> {#improvement-group-anchor}

- **<Item>**: <description>.

---

## Bug fixes {#bug-fixes}

- **<Bug>**: <what was broken and how it is fixed>. (issue #NN if applicable)

---

## Security {#security}

### Dependency vulnerability fixes {#dependency-vulnerability-fixes}

- **<Item>**: <description>.

---

## Migration notes {#migration-notes}

### From version <PREVIOUS_VERSION> {#from-version-<prev-ver-dash>}

When upgrading to version <VERSION>:

1. **No database migration required** (or describe required steps).
2. **Dependencies**: Run `pnpm install` to apply the updated lockfile and overrides.
3. <Any other upgrade steps the changes imply.>

---

## Support {#support}

### Getting help {#getting-help}

- **Documentation**: [User Guide](../user-guide/overview.md)
- **Email settings**: [Email configuration guide](../user-guide/settings/email-settings.md)
- **API reference**: [API documentation](../api-reference/overview.md)
- **Migration guide**: [Version upgrade migration](../migration/version_upgrade.md)
- **Community**: [GitHub Discussions](https://github.com/wsj-br/duplistatus/discussions)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)

### Reporting bugs {#reporting-bugs}

When reporting bugs, please include:

- Version: <VERSION>
- Operating system and version
- Docker/podman version
- Container type (Docker or podman/Pod)
- Error messages and logs
- Steps to reproduce

---

## Changelog {#changelog}

### Version <VERSION> changes {#version-<VER-DASH>-changes}

- **Added**: <one line per change, mirroring the changelog buckets>
- **Changed**: ...
- **Fixed**: ...
- **Security**: ...

---

## License {#license}

This project is licensed under the [Apache License 2.0](https://github.com/wsj-br/duplistatus/blob/main/LICENSE).

**Copyright © 2026 Waldemar Scudeller Jr.**
```

### Content rules for the release notes

- Write for **end users**, not developers: describe the effect of each change, not the
  implementation detail. (The terse changelog lines can be expanded into readable prose.)
- Keep the `## Changelog` section at the bottom as a concise bulleted summary that
  mirrors the changelog buckets.
- Set the previous version in **Migration notes** to the most recent existing release
  notes file (the highest version currently in `documentation/docs/release-notes/`).
- Use British/repo-consistent spelling to match existing notes (e.g. "internationalisation").

## 4. Register the release notes in the docs sidebar

- Edit [`documentation/sidebars.ts`](../documentation/sidebars.ts) and add the new entry
  `'release-notes/<VERSION>'` at the **top** of the release-notes `items` array (newest
  first), e.g. above `'release-notes/1.4.1'`.

## 5. Update the changelog

- In [`dev/CHANGELOG.md`](./CHANGELOG.md), convert the `## Unreleased` section into a
  released section for this version, following the existing format:
  - Change the heading to `## [<VERSION>] - <YYYY-MM-DD>` using today's date.
  - Keep the bucket sub-sections (`### Added`, `### Changed`, `### Fixed`, `### Security`,
    etc.) and their entries.
  - Leave a fresh, empty `## Unreleased` section at the top (above the new version
    section) so future changes have a home. Keep the file header and the
    "**Instructions:**" note intact.
- Follow the Keep a Changelog format and Semantic Versioning conventions already used in
  the file. Be concise; only record user-facing changes.

## 6. Verify the build (run these in order, fix failures before continuing)

Run each command and **fix any failures** before moving on. Do not skip a step because a
previous one passed. There is **no automated unit/integration test suite** in this repo
(`pnpm test` is a stub) — do not assume or invent test commands.

1. `pnpm install` — install dependencies and apply the lockfile/overrides.
2. `pnpm lint` — must pass with no errors. Fix lint issues.
3. `pnpm build` — production build (`next build --webpack` with pre-checks). Must succeed.
4. `pnpm docker:devel` — smoke test the Docker image build. Must build successfully.

If any command fails:

- Read the error output carefully and fix the root cause in the code/config.
- Re-run that command (and any earlier dependent command) until it passes.
- If a failure is clearly unrelated to your changes and pre-existing, note it explicitly
  rather than silently working around it.

## 7. Final review

Before finishing, confirm:

- [ ] `documentation/docs/release-notes/<VERSION>.md` exists, follows the structure, and
      reads cleanly for end users.
- [ ] The new file is listed in `documentation/sidebars.ts` (newest first).
- [ ] `dev/CHANGELOG.md` has the new `## [<VERSION>] - <date>` section and a fresh empty
      `## Unreleased` section.
- [ ] `pnpm install`, `pnpm lint`, and `pnpm build` all succeed.

Then summarise what you changed and the result of each verification command.
