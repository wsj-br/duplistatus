#!/bin/bash
set -e

echo "=== Building all locales ==="
pnpm build:all

echo "=== Preparing GitHub Pages ==="
# The build:all command creates build/ with all locales
# GitHub Pages will serve from build/

echo "=== Deploying to GitHub Pages ==="
# Use Docusaurus deploy which handles gh-pages branch
GIT_USER=wsj-br pnpm deploy

echo "=== Deployment complete ==="
echo "Access your docs at: https://wsj-br.github.io/duplistatus/"
echo "Available locales: /en, /fr, /de, /es, /pt-br"
