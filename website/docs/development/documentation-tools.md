

# Documentation Tools

## Update documentation

```bash
./scripts/update-docs.sh
```

This script updates all documentation files with the current version and regenerates table of contents:
- Updates version badges in all `.md` files to match `package.json`
- Runs `doctoc` to regenerate table of contents
- Provides feedback on updated files
- Requires `doctoc` to be installed globally

## Checking for broken links

```bash
markdown-link-check *.md docs/*.md
```
