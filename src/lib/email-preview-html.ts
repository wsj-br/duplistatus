export type EmailPreviewTheme = 'light' | 'dark';

const DARK_COLOR_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ['#1f2937', '#e5e7eb'],
  ['#111827', '#f9fafb'],
  ['#1d4ed8', '#93c5fd'],
  ['#d1d5db', '#4b5563'],
  ['#f3f4f6', '#1f2937'],
];

function withColorSchemeAndBody(html: string, theme: EmailPreviewTheme): string {
  const dark = theme === 'dark';
  const colorScheme = dark ? 'dark' : 'light';
  const bodyStyle = dark
    ? 'background:#111827;margin:0;color:#e5e7eb'
    : 'background:#ffffff;margin:0;color:#1f2937';

  let result = html;
  if (/<meta\s+name=["']color-scheme["']/i.test(result)) {
    result = result.replace(
      /<meta\s+name=["']color-scheme["'][^>]*>/i,
      `<meta name="color-scheme" content="${colorScheme}">`
    );
  } else {
    result = result.replace(/<head([^>]*)>/i, `<head$1><meta name="color-scheme" content="${colorScheme}">`);
  }

  if (/<body[\s>]/i.test(result)) {
    result = result.replace(/<body([^>]*)>/i, (_match, attrs: string) => {
      const withoutStyle = String(attrs).replace(/\sstyle=(["']).*?\1/i, '');
      return `<body${withoutStyle} style="${bodyStyle}">`;
    });
  }
  return result;
}

export function themedEmailPreviewHtml(html: string, theme: EmailPreviewTheme): string {
  let colored = html;
  if (theme === 'dark') {
    for (const [from, to] of DARK_COLOR_REPLACEMENTS) {
      colored = colored.split(from).join(to);
    }
  }
  return withColorSchemeAndBody(colored, theme);
}
