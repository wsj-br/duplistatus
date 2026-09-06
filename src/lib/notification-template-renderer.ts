import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import juice from 'juice';
import { convert } from 'html-to-text';
import {
  EMAIL_HTML_MAX_BYTES,
  sanitizePlainSubject,
  utf8ByteLength,
} from '@/lib/notification-template-validation';

const TOKEN_START = '\uE000';
const TOKEN_END = '\uE001';

export const BLOCK_PLACEHOLDERS = new Set(['problem_table', 'all_jobs_table', 'log_list', 'duplistatus_link']);

export type PlaceholderValues = Record<string, string>;

export interface RenderedEmailContent {
  subject: string;
  html: string;
  text: string;
}

const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
  typographer: false,
});

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'em', 'strong', 'b', 'i',
    'ul', 'ol', 'li',
    'code', 'pre', 'blockquote',
    'a',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href'],
    th: ['align'],
    td: ['align'],
    table: ['class'],
    thead: ['class'],
    tbody: ['class'],
    tr: ['class'],
  },
  allowedSchemes: ['http', 'https'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
};

const EMAIL_CSS = `
.email-shell { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5; font-size: 15px; }
.email-shell h1, .email-shell h2, .email-shell h3 { color: #111827; margin: 1.2em 0 0.6em; }
.email-shell p { margin: 0.6em 0; }
.email-shell a { color: #1d4ed8; }
.email-table { border-collapse: collapse; width: 100%; max-width: 100%; margin: 0.8em 0; }
.email-table th, .email-table td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; vertical-align: top; word-break: break-word; }
.email-table th { background: #f3f4f6; font-weight: 600; }
.email-table td.numeric, .email-table th.numeric { text-align: right; }
`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tokenFor(name: string): string {
  return `${TOKEN_START}${name}${TOKEN_END}`;
}

function tokenizeKnownPlaceholders(source: string, values: PlaceholderValues): string {
  return source.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(values, name) || BLOCK_PLACEHOLDERS.has(name)) {
      return tokenFor(name);
    }
    return match;
  });
}

function scalarHtml(value: string): string {
  return escapeHtml(value).replace(/\r\n|\n|\r/g, '<br>');
}

function replaceTokens(html: string, values: PlaceholderValues): string {
  let result = html;
  const names = new Set([...Object.keys(values), ...BLOCK_PLACEHOLDERS]);
  for (const name of names) {
    const token = tokenFor(name);
    const raw = values[name] ?? '';
    if (BLOCK_PLACEHOLDERS.has(name)) {
      const block = raw;
      const wrapped = new RegExp(`<p>\\s*${token}\\s*</p>`, 'g');
      if (wrapped.test(result)) {
        result = result.replace(wrapped, block);
      } else {
        result = result.split(token).join(block);
      }
    } else {
      result = result.split(token).join(scalarHtml(raw));
    }
  }
  return result;
}

function wrapEmailShell(fragment: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<div class="email-shell">${fragment}</div>
</body>
</html>`;
}

function decorateTables(fragment: string): string {
  return fragment.replace(/<table(?![^>]*class=)/g, '<table class="email-table"');
}

export function renderMarkdownEmail(
  subjectTemplate: string,
  bodyTemplate: string,
  values: PlaceholderValues
): RenderedEmailContent {
  const subjectSource = tokenizeKnownPlaceholders(subjectTemplate, values);
  let subject = subjectSource;
  for (const [name, value] of Object.entries(values)) {
    subject = subject.split(tokenFor(name)).join(value);
  }
  subject = sanitizePlainSubject(subject);

  const tokenizedBody = tokenizeKnownPlaceholders(bodyTemplate, values);
  const markdownHtml = markdown.render(tokenizedBody);
  const withValues = replaceTokens(markdownHtml, values);
  const sanitized = sanitizeHtml(decorateTables(withValues), SANITIZE_OPTIONS);
  const inlined = juice.inlineContent(wrapEmailShell(sanitized), EMAIL_CSS, {
    removeStyleTags: true,
    preserveMediaQueries: false,
    preserveFontFaces: false,
  });

  let html = inlined;
  if (utf8ByteLength(html) > EMAIL_HTML_MAX_BYTES) {
    html = inlined;
  }

  const text = convert(sanitized, {
    wordwrap: 80,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'table', format: 'dataTable' },
    ],
  }).trim();

  return { subject, html, text };
}

export function renderMarkdownNtfyText(bodyTemplate: string, values: PlaceholderValues): string {
  const rendered = renderMarkdownEmail('unused', bodyTemplate, values);
  return rendered.text;
}

export function substitutePlainTemplate(template: string, values: PlaceholderValues): string {
  return template.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(values, name)) {
      return values[name];
    }
    return match;
  });
}

export function htmlTable(headers: string[], rows: string[][]): string {
  const head = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join('');
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="email-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function textTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) {
    return '';
  }
  const lines = [
    headers.join(' | '),
    headers.map(() => '---').join(' | '),
    ...rows.map((row) => row.join(' | ')),
  ];
  return lines.join('\n');
}

export function htmlList(items: string[]): string {
  if (items.length === 0) {
    return '';
  }
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

export function escapeHtmlText(value: string): string {
  return escapeHtml(value);
}
