# Documentation Tools

The documentation is built using [Docusaurus](https://docusaurus.io/) and is located in the `website` folder.

## Folder Structure

```
website/
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

All commands should be run from the `website` directory:

### Development

Start the development server with hot-reload:

```bash
cd website
pnpm start
```

The site will be available at `http://localhost:3000` (or the next available port).

### Build

Build the documentation site for production:

```bash
cd website
pnpm build
```

This generates static HTML files in the `website/build` directory.

### Serve Production Build

Preview the production build locally:

```bash
cd website
pnpm serve
```

This serves the built site from the `website/build` directory.

### Other Useful Commands

- `pnpm clear` - Clear Docusaurus cache
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm write-heading-ids` - Add heading IDs to markdown files for anchor links

## Generating README.md

The project's `README.md` file is automatically generated from `website/docs/intro.md` to keep the GitHub repository README synchronised with the Docusaurus documentation.

To generate or update the README.md file:

```bash
./scripts/generate-readme-from-intro.sh
```

This script:
- Extracts the current version from `package.json` and adds a version badge
- Copies content from `website/docs/intro.md`
- Converts all relative Docusaurus links to absolute GitHub docs URLs (`https://wsj-br.github.io/duplistatus/...`)
- Converts image paths from `/img/` to `docs/img/` for GitHub compatibility
- Removes the migration IMPORTANT block and adds a Migration Information section with a link to the Docusaurus docs
- Generates a table of contents using `doctoc`
- Automatically runs `update-readme-for-dockerhub.sh` to create `README.tmp` for Docker Hub

**Note:** You need to have `doctoc` installed globally for the TOC generation:
```bash
npm install -g doctoc
```

## Deploying the Documentation


To deploy the documentation to Github pages, we will need to generate a GitHub Personal Access Token, go to [GitHub Personal Access Tokens](https://github.com/settings/tokens) and create a new token with the `repo` scope.

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

- Documentation files are written in Markdown (`.md`) and located in `website/docs/`
- The sidebar navigation is configured in `website/sidebars.ts`
- Docusaurus configuration is in `website/docusaurus.config.ts`
- Custom React components can be added to `website/src/components/`
- Static assets (images, PDFs, etc.) go in `website/static/`
- The main documentation homepage is `website/docs/intro.md`, which is used as the source for generating `README.md`
