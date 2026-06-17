#!/usr/bin/env node
/**
 * Translate documentation/docs markdown files to zh-CN locale.
 * Preserves heading IDs, code blocks, URLs, and file paths.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const EN_ROOT = join(ROOT, 'documentation/docs');
const ZH_ROOT = join(ROOT, 'documentation/i18n/zh-CN/docusaurus-plugin-content-docs/current');

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
const BASE_URL = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');

if (!API_KEY) {
  console.error('ANTHROPIC_API_KEY is required');
  process.exit(1);
}

const SYSTEM = `You are a technical translator. Translate Markdown documentation from English to Simplified Chinese (zh-CN).

Rules:
- Preserve ALL heading anchor IDs exactly, e.g. {#installation-guide}
- Do NOT translate: code blocks, inline code, URLs, file paths, env var names, API endpoints, JSON keys, YAML keys, Docker/Podman commands, version numbers in code
- Keep technical product names: Duplicati, duplistatus, NTFY, ntfy, SMTP, Docker, Podman, Portainer, Next.js, SQLite, GitHub, etc.
- Preserve Markdown structure, tables, admonitions (:::note, :::info, etc.), HTML/JSX tags like <IconButton>, <SvgButton>, <table>
- Preserve image paths and link targets unchanged; only translate link label text
- Output ONLY the translated markdown, no preamble or explanation`;

async function walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p, base)));
    else if (e.name.endsWith('.md')) files.push(relative(base, p).replace(/\\/g, '/'));
  }
  return files.sort();
}

async function translate(content, filePath) {
  const url = BASE_URL.includes('/v1/messages') ? BASE_URL : `${BASE_URL}/v1/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 16384,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Translate this file (${filePath}) to Simplified Chinese:\n\n${content}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data.content?.map((b) => b.text || '').join('') || '';
  return text.replace(/^```markdown\n?/, '').replace(/\n?```$/, '').trim() + '\n';
}

const only = process.argv.slice(2);
const allFiles = await walk(EN_ROOT);
const files = only.length ? allFiles.filter((f) => only.some((o) => f.includes(o))) : allFiles;

const results = { created: 0, updated: 0, failed: [], skipped: [] };

for (const rel of files) {
  const enPath = join(EN_ROOT, rel);
  const zhPath = join(ZH_ROOT, rel);
  try {
    const en = await readFile(enPath, 'utf8');
    console.log(`Translating: ${rel} ...`);
    const zh = await translate(en, rel);
    await mkdir(dirname(zhPath), { recursive: true });
    const existed = await readFile(zhPath, 'utf8').then(() => true).catch(() => false);
    await writeFile(zhPath, zh, 'utf8');
    if (existed) results.updated++;
    else results.created++;
    console.log(`  OK (${zh.length} chars)`);
    await new Promise((r) => setTimeout(r, 500));
  } catch (e) {
    console.error(`  FAILED: ${e.message}`);
    results.failed.push({ file: rel, error: e.message });
  }
}

console.log('\n=== Summary ===');
console.log(JSON.stringify(results, null, 2));
