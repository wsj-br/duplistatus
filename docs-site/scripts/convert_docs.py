#!/usr/bin/env python3
"""Convert Docusaurus markdown to MkDocs-friendly markdown.

Features:
- Removes YAML frontmatter blocks (--- ... ---)
- Converts Docusaurus admonitions written as blockquotes with [!TYPE]
  into MkDocs Material admonitions (!!! type)
- Fixes image references that use //img or absolute paths to relative
  paths pointing to the central docs/img folder in docs-site

This is a best-effort automated conversion; some MDX/React components
or complex shortcodes may still require manual intervention.
"""
import sys
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'website' / 'docs'
DST = ROOT / 'docs-site' / 'docs'

TYPE_MAP = {
    'NOTE': 'note',
    'IMPORTANT': 'warning',
    'CAUTION': 'caution',
    'TIP': 'tip',
    'WARNING': 'warning',
}


def remove_frontmatter(text: str) -> str:
    if text.lstrip().startswith('---'):
        # remove from first --- to the next ---
        parts = text.split('---', 2)
        if len(parts) == 3:
            return parts[2].lstrip('\n')
    return text


def convert_admonitions(lines, depth):
    out = []
    i = 0
    while i < len(lines):
        m = re.match(r'^>\s*\[!([A-Z]+)\]\s*$', lines[i])
        if m:
            dtype = m.group(1)
            mk = TYPE_MAP.get(dtype, dtype.lower())
            out.append(f"!!! {mk}\n")
            i += 1
            # consume following > lines
            while i < len(lines) and lines[i].startswith('>'):
                # strip leading '> ' (one or more) and append indented
                content = re.sub(r'^>\s?', '', lines[i])
                if content.strip() == '':
                    out.append('\n')
                else:
                    out.append('    ' + content + '\n')
                i += 1
            continue
        else:
            out.append(lines[i])
            i += 1
    return out


def fix_image_paths(text: str, rel_prefix: str) -> str:
    # Replace occurrences like ![](//img/foo.png) or ![](/img/foo.png) or ![](///img/foo.png)
    text = re.sub(r"\(/{2,}img/", f"({rel_prefix}img/", text)
    text = re.sub(r"\(\/img/", f"({rel_prefix}img/", text)
    # also replace src="/img/..."
    text = re.sub(r'src=\"/{2,}img/', f'src="{rel_prefix}img/', text)
    text = re.sub(r'src=\"/img/', f'src="{rel_prefix}img/', text)
    return text


def process_file(src_path: Path, dst_path: Path):
    text = src_path.read_text(encoding='utf-8')
    text = remove_frontmatter(text)
    lines = text.splitlines(keepends=True)

    # compute relative prefix from dst_path to central img folder
    # dst_path is under docs-site/docs/... ; central img is docs-site/docs/img
    rel = Path(dst_path.parent).relative_to(DST)
    depth = len(rel.parts) if str(rel) != '.' else 0
    rel_prefix = '../' * depth

    lines = convert_admonitions(lines, depth)

    text2 = ''.join(lines)
    text2 = fix_image_paths(text2, rel_prefix)

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    dst_path.write_text(text2, encoding='utf-8')


def main():
    if not SRC.exists():
        print('Source docs folder not found:', SRC)
        sys.exit(1)
    count = 0
    for src in SRC.rglob('*.md'):
        rel = src.relative_to(SRC)
        dst = DST / rel
        process_file(src, dst)
        count += 1
    print(f'Converted {count} markdown files to {DST}')


if __name__ == '__main__':
    main()
