MkDocs site (docs-site)

This folder contains a work-in-progress migration of the Docusaurus documentation (`./website`) to MkDocs Material.

Steps to preview locally:

1. Install MkDocs and mkdocs-material:

   pip install mkdocs-material

2. Copy images and static assets from `website` (helper script):

   ./docs-site/copy-images.sh

3. Serve locally:

   mkdocs serve -f mkdocs.yml --dev-addr 127.0.0.1:8001

Notes:
- The original `website` folder is preserved. This migration currently copies many docs as placeholders; review and convert MDX/React-only content manually.

Publishing / Deploy
-------------------

Recommended steps to publish:

- Use `mkdocs build -f mkdocs.yml` to create the static `site/` directory.
- For GitHub Pages you can use `gh-pages` or `mike` for versioned docs. Example (simple):

  1. mkdocs build -f mkdocs.yml
  2. git checkout -B gh-pages
  3. cp -r site/* .
  4. git add -A && git commit -m "Publish docs"
  5. git push -f origin gh-pages

For full versioning support, install `mike` (pip install mike) and follow its docs to publish multiple versions.
