# Documentation Tools

The documentation is built using [Docusaurus](https://docusaurus.io/) and is located in the `documentation` folder. The documentation is hosted on [GitHub Pages](https://wsj-br.github.io/duplistatus/) and is no longer included in the Docker container image.

## Folder Structure

```
documentation/
├── docs/              # Documentation markdown files
│   ├── api-reference/
│   ├── development/
│   ├── installation/
│   ├── migration/
│   ├── release-notes/
│   └── user-guide/
├── src/               # React components and pages
│   ├── components/    # Custom React components
│   ├── css/           # Custom styles
│   └── pages/         # Additional pages (e.g., 404)
├── static/            # Static assets (images, files)
├── docusaurus.config.ts  # Docusaurus configuration
├── sidebars.ts        # Sidebar navigation configuration
└── package.json       # Dependencies and scripts
```

## Common Commands

All commands should be run from the `documentation` directory:

### Development

Start the development server with hot-reload:

```bash
cd documentation
pnpm start
```

The site will be available at `http://localhost:3000` (or the next available port).

### Build

Build the documentation site for production:

```bash
cd documentation
pnpm build
```

This generates static HTML files in the `documentation/build` directory.

### Serve Production Build

Preview the production build locally:

```bash
cd documentation
pnpm serve
```

This serves the built site from the `documentation/build` directory.

### Other Useful Commands

- `pnpm clear` - Clear Docusaurus cache
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm write-heading-ids` - Add heading IDs to markdown files for anchor links

## Generating README.md

The project's `README.md` file is automatically generated from `documentation/docs/intro.md` to keep the GitHub repository README synchronised with the Docusaurus documentation.

To generate or update the README.md file:

```bash
./scripts/generate-readme-from-intro.sh
```

This script:
- Extracts the current version from `package.json` and adds a version badge
- Copies content from `documentation/docs/intro.md`
- Converts all relative Docusaurus links to absolute GitHub docs URLs (`https://wsj-br.github.io/duplistatus/...`)
- Converts image paths from `/img/` to `documentation/img/` for GitHub compatibility
- Removes the migration IMPORTANT block and adds a Migration Information section with a link to the Docusaurus docs
- Generates a table of contents using `doctoc`
- Automatically runs `update-readme-for-dockerhub.sh` to create `README.tmp` for Docker Hub

**Note:** You need to have `doctoc` installed globally for the TOC generation:
```bash
npm install -g doctoc
```

## Update README for Docker Hub

```bash
./scripts/update-readme-for-dockerhub.sh
```

This script creates a Docker Hub-compatible version of the README (`README_dockerhub.md`). It:
- Copies `README.md` to `README_dockerhub.md`
- Converts relative image paths to absolute GitHub raw URLs
- Converts relative document links to absolute GitHub blob URLs
- Ensures all images and links work correctly on Docker Hub

This script is automatically called by `generate-readme-from-intro.sh`.

## Generate GitHub Release Notes

Before creating a GitHub release, generate a GitHub-compatible version of your release notes:

```bash
./scripts/generate-release-notes-github.sh VERSION
```

Replace `VERSION` with your release version (e.g., `1.1.x` or `1.2.0`).

**Example:**
```bash
./scripts/generate-release-notes-github.sh 1.1.x
```

This script:
- Reads the release notes from `documentation/docs/release-notes/VERSION.md`
- Converts relative markdown links to absolute GitHub docs URLs (`https://wsj-br.github.io/duplistatus/...`)
- Converts image paths to GitHub raw URLs (`https://raw.githubusercontent.com/wsj-br/duplistatus/main/documentation/static/img/...`) for proper display in release descriptions
- Preserves absolute URLs (http:// and https://) unchanged
- Creates `RELEASE_NOTES_github_VERSION.md` in the project root

The generated file can be copied and pasted directly into the GitHub release description. All links and images will work correctly in the GitHub release context.

**Note:** The generated file is temporary and can be deleted after creating the GitHub release. It's recommended to add `RELEASE_NOTES_github_*.md` to `.gitignore` if you don't want to commit these files.

## Take screenshots for documentation

```bash
tsx scripts/take-screenshots.ts
```

This script automatically takes screenshots of the application for documentation purposes. It:
- Launches a headless browser (Puppeteer)
- Logs in as admin and regular user
- Navigates through various pages (dashboard, server details, settings, etc.)
- Takes screenshots at different viewport sizes
- Saves screenshots to `documentation/static/img/`

**Requirements:**
- The development server must be running on `http://localhost:8666`
- Environment variables must be set:
  - `ADMIN_PASSWORD`: Password for admin account
  - `USER_PASSWORD`: Password for regular user account

**Example:**
```bash
export ADMIN_PASSWORD="your-admin-password"
export USER_PASSWORD="your-user-password"
tsx scripts/take-screenshots.ts
```

**Generated Screenshots:**

The script generates the following screenshots (saved to `documentation/static/img/`):

**Dashboard Screenshots:**
- `screen-main-dashboard-card-mode.png` - Dashboard in card/overview mode
- `screen-main-dashboard-table-mode.png` - Dashboard in table mode
- `screen-overdue-backup-hover-card.png` - Overdue backup hover card/tooltip
- `screen-backup-tooltip.png` - Regular backup tooltip (hover over backup in cards view)

**Server Details Screenshots:**
- `screen-server-backup-list.png` - Server backup list page
- `screen-backup-history.png` - Backup history table section
- `screen-backup-detail.png` - Individual backup detail page
- `screen-metrics.png` - Metrics chart showing backup metrics over time

**Collect/Configuration Screenshots:**
- `screen-collect-button-popup.png` - Collect backup logs popup
- `screen-collect-button-right-click-popup.png` - Collect all right-click menu
- `screen-collect-backup-logs.png` - Collect backup logs interface
- `screen-duplicati-configuration.png` - Duplicati configuration dropdown

**Settings Screenshots:**
- `screen-settings-left-panel-admin.png` - Settings sidebar (admin view)
- `screen-settings-left-panel-non-admin.png` - Settings sidebar (non-admin view)
- `screen-settings-{tab}.png` - Individual settings pages for each tab:
  - `screen-settings-notifications.png`
  - `screen-settings-overdue.png`
  - `screen-settings-server.png`
  - `screen-settings-ntfy.png`
  - `screen-settings-email.png`
  - `screen-settings-templates.png`
  - `screen-settings-users.png`
  - `screen-settings-audit.png`
  - `screen-settings-audit-retention.png`
  - `screen-settings-display.png`
  - `screen-settings-database-maintenance.png`
- `screen-settings-ntfy-configure-device-popup.png` - NTFY configure device popup
- `screen-settings-backup-notifications-detail.png` - Backup notifications detail page

## Deploying the Documentation


To deploy the documentation to GitHub Pages, you will need to generate a GitHub Personal Access Token. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens) and create a new token with the `repo` scope.

When you have the token, run the following command to store the token in the Git credential store:
```bash
./setup-git-credentials.sh
```

Then, to deploy the documentation to GitHub Pages, run the following command:

```bash
pnpm run deploy
```

This will build the documentation and push it to the `gh-pages` branch of the repository, and the documentation will be available at [https://wsj-br.github.io/duplistatus/](https://wsj-br.github.io/duplistatus/).

## Working with Documentation

- Documentation files are written in Markdown (`.md`) and located in `documentation/docs/`
- The sidebar navigation is configured in `documentation/sidebars.ts`
- Docusaurus configuration is in `documentation/docusaurus.config.ts`
- Custom React components can be added to `documentation/src/components/`
- Static assets (images, PDFs, etc.) go in `documentation/static/`
- The main documentation homepage is `documentation/docs/intro.md`, which is used as the source for generating `README.md`
