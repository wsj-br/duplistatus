# New Release Prompt

You are an AI coding agent preparing a new release of **duplistatus**. Follow these
instructions end to end. Work autonomously: gather the inputs, generate the release
notes, update the changelog, regenerate the README files and GitHub release notes,
and verify the build. Only stop to ask the user if you
hit an ambiguous decision that you cannot resolve from the repo itself.

---

## 1. Determine the version number

- Read the `version` field from [`package.json`](../package.json) (line 3). This is the
  **new release version** (e.g. `1.4.2`). Use it verbatim everywhere below — do **not**
  invent or bump it yourself.
- Throughout this document, `<VERSION>` means that exact string and `<VER-DASH>` means
  the same value with dots removed (e.g. `1.4.2` → `142`) for use in Markdown heading
  anchors.

## 2. Select the highlights (do not copy the changelog)

- Read [`dev/CHANGELOG.md`](./CHANGELOG.md) and use the entries under the
  **`## Unreleased`** section as the source of truth.
- **Do not** copy, paraphrase, or re-bucket every Unreleased line into the release
  notes. `dev/CHANGELOG.md` remains the complete item-by-item record. The release
  notes are a **highlights document** for operators and end users.
- From Unreleased, select only **highlights**: user-facing or structural changes that
  someone upgrading would need to know, or that define the character of the release.
  Group related changelog bullets into **one** highlight (for example several Daily
  Summary template/UI follow-ups become a single Daily Summary item).

**Treat as a highlight (include):**

- New features and settings that users can see or configure
- Security fixes or behaviour that operators must know about
- Structural changes: schema/migrations, API or auth behaviour, env vars, Docker /
  install / upgrade steps, default ports, breaking changes
- Important bug fixes that affect real workflows (backups, notifications, login,
  Docker startup, data loss, lockouts)

**Do not treat as a highlight (leave in `dev/CHANGELOG.md` only):**

- Minor UI polish (padding, colours, alignment, spinner styling)
- Docs-only editorial passes, filename/title tweaks, glossary or screenshot tooling
- Dev-only / agent-guidance / test-data / lint-config churn
- Incremental follow-ups that only refine a feature already called out as a highlight
- Dependency bumps unless they are security-relevant or change operator behaviour

Use judgement: a Docker startup crash is a highlight; a 1px card-height tweak is not.
If Unreleased is large, prefer a short overview plus a **small** set of headline
items over exhaustive coverage.

## 3. Create the release notes file

- Create `documentation/docs/release-notes/<VERSION>.md`.
- **Only edit the English docs** under `documentation/docs/`. Do **not** touch translated
  files under `documentation/i18n/` — those are produced by the i18n tooling.
- Base tone, heading style, and anchor format on these existing examples (read them
  first). **Do not** copy their bottom `## Changelog` dump of every change — that
  pattern is deprecated by this prompt:
  - [`documentation/docs/release-notes/1.4.1.md`](../documentation/docs/release-notes/1.4.1.md)
    (full feature release)
  - [`documentation/docs/release-notes/1.3.2.md`](../documentation/docs/release-notes/1.3.2.md)
    (maintenance / security release)
  - [`documentation/docs/release-notes/1.3.0.md`](../documentation/docs/release-notes/1.3.0.md)
    (feature release with API changes)

### Required structure

Every heading uses an explicit MDX comment anchor `{/* #anchor-id */}` (not `{#id}`,
which Docusaurus can leak into sidebar labels). Use this skeleton, including only the
narrative sections that have **highlights** (e.g. omit **New features** for a pure
maintenance release, omit **API Endpoints** if no endpoints changed). Always include
**Overview**, **Detailed changelog**, **Support**, and **License**.

```markdown
# Version <VERSION> {/* #version-<VER-DASH> */}

## Overview {/* #overview */}

<One short paragraph summarising the release: what kind of release it is
(feature / maintenance / security) and the headline changes. Do not list
every changelog bullet.>

---

## New features {/* #new-features */}

### <Feature group> {/* #feature-group-anchor */}

- **<Feature name>**: <user-facing description>. (reference issue #NN if applicable)

---

## Improvements {/* #improvements */}

### <Improvement group> {/* #improvement-group-anchor */}

- **<Item>**: <description>.

---

## Bug fixes {/* #bug-fixes */}

- **<Bug>**: <what was broken and how it is fixed>. (issue #NN if applicable)

---

## Security {/* #security */}

### <Security group> {/* #security-group-anchor */}

- **<Item>**: <description>.

---

## Migration notes {/* #migration-notes */}

### From version <PREVIOUS_VERSION> {/* #from-version-<prev-ver-dash> */}

When upgrading to version <VERSION>:

1. **No database migration required** (or describe required steps).
2. **Dependencies**: Run `pnpm install` to apply the updated lockfile and overrides.
3. <Any other upgrade steps the changes imply.>

---

## Support {/* #support */}

### Getting help {/* #getting-help */}

- **Documentation**: [User Guide](https://wsj-br.github.io/duplistatus/user-guide/overview)
- **Email settings**: [Email configuration guide](https://wsj-br.github.io/duplistatus/user-guide/settings/email-settings)
- **API reference**: [API documentation](https://wsj-br.github.io/duplistatus/api-reference/overview)
- **Migration guide**: [Version upgrade migration](https://wsj-br.github.io/duplistatus/migration/version_upgrade)
- **Issues**: [GitHub Issues](https://github.com/wsj-br/duplistatus/issues)

### Reporting bugs {/* #reporting-bugs */}

When reporting bugs, please include:

- Version: <VERSION>
- Operating system and version
- Docker/podman version
- Container type (Docker or podman)
- Error messages and logs
- Steps to reproduce

---

## Detailed changelog {/* #detailed-changelog */}

The sections above are the highlights of this release. The complete list of
changes is in [`dev/CHANGELOG.md`](https://github.com/wsj-br/duplistatus/blob/master/dev/CHANGELOG.md#<changelog-anchor>)
under **[<VERSION>] - <YYYY-MM-DD>**.

---

## License {/* #license */}

This project is licensed under the [Apache License 2.0](https://github.com/wsj-br/duplistatus/blob/master/LICENSE).

**Copyright © 2026 Waldemar Scudeller Jr.**
```

### Content rules for the release notes

- Write for **end users** and operators: describe the effect of each **highlight**,
  not implementation detail. Expand a terse changelog line into readable prose only
  for items you selected as highlights.
- **Never** add a `## Changelog` (or similar) section that restates every Unreleased
  bullet, even as a “concise” Added/Changed/Fixed/Security list. That duplicates
  `dev/CHANGELOG.md`.
- Keep **Detailed changelog** as a pointer only: one or two sentences plus a GitHub
  link to the version heading in `dev/CHANGELOG.md`. Do not paste changelog entries
  there. The repository default branch is **`master`**. A `blob/main` URL 404s.
  After step 5, the heading is `## [<VERSION>] - <YYYY-MM-DD>`. Link it as
  `https://github.com/wsj-br/duplistatus/blob/master/dev/CHANGELOG.md#<changelog-anchor>`.
  Build `<changelog-anchor>` from that heading by removing `[`, `]`, and `.`, then
  replacing each space with `-`. Example: `## [1.5.1] - 2026-10-26` →
  `#151---2026-10-26`.
- **Support** links must be the absolute documentation-site URLs in the skeleton
  (`https://wsj-br.github.io/duplistatus/...`). Do not use relative `../….md` paths
  or root-relative `/user-guide/…` paths: GitHub release notes are generated from
  this file, and those paths do not open the documentation site. Do not add a
  GitHub Discussions link; Discussions is not enabled on the repository. The
  license link uses `blob/master`, the same as the changelog.
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
- After this conversion, confirm the release-notes **Detailed changelog** pointer names
  the new `## [<VERSION>]` section (do not copy its bullets into the notes).

## 6. Regenerate README.md, the Docker Hub README, and the GitHub release notes

Run this from the repository root, with no extra flags, after the docs release notes
and the changelog heading exist:

```bash
./scripts/generate-readme-from-intro.sh
```

That script reads `version` from `package.json` and `documentation/docs/intro.md`, then
rewrites all three files:

- `README.md` — GitHub repository README (version badge, banner, table of contents,
  documentation links as absolute URLs).
- `README_dockerhub.md` — Docker Hub README (absolute image and document URLs, Docker
  Hub alert formatting).
- `RELEASE_NOTES_github_<VERSION>.md` — GitHub release body, generated from
  `documentation/docs/release-notes/<VERSION>.md`. This file is gitignored. Do not pass
  `--notes-only`; that flag skips the two README files.

If the script fails, fix the source (`documentation/docs/intro.md` or the release notes)
and run it again. Do not hand-edit the three generated files.

## 7. Verify the build (run these in order, fix failures before continuing)

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

## 8. Final review

Before finishing, confirm:

- [ ] `documentation/docs/release-notes/<VERSION>.md` exists, follows the structure, and
      reads cleanly for end users as **highlights**, not a changelog dump.
- [ ] The notes do **not** restate every `dev/CHANGELOG.md` Unreleased/version bullet
      (no mirroring Added/Changed/Fixed/Security list).
- [ ] **Detailed changelog** points at
      `https://github.com/wsj-br/duplistatus/blob/master/dev/CHANGELOG.md#<changelog-anchor>`
      for the `## [<VERSION>] - <YYYY-MM-DD>` heading (`master`, not `main`).
- [ ] **Support** uses the absolute `https://wsj-br.github.io/duplistatus/…` URLs
      from the skeleton and does not mention GitHub Discussions. The license link
      uses `blob/master`.
- [ ] The new file is listed in `documentation/sidebars.ts` (newest first).
- [ ] `dev/CHANGELOG.md` has the new `## [<VERSION>] - <date>` section and a fresh empty
      `## Unreleased` section.
- [ ] `./scripts/generate-readme-from-intro.sh` has been run, and `README.md`,
      `README_dockerhub.md`, and `RELEASE_NOTES_github_<VERSION>.md` match the current
      version. The GitHub notes still use the absolute documentation URLs, the
      `master` changelog anchor, and no GitHub Discussions link.
- [ ] `pnpm install`, `pnpm lint`, `pnpm build` and `cd documentation && pnpm build` all succeed.

Then summarise what you changed and the result of each verification command.
