import fs from "fs";
import path from "path";

export type IgnoreMatcher = {
  ignores: (posixRelativePath: string) => boolean;
};

function toPosixPath(p: string): string {
  return p.split(path.sep).join("/");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function globToRegExp(pattern: string): RegExp {
  // Very small glob-to-regex converter for gitignore-like patterns.
  // Supports: **, *, ?, and path separators (/). Always matches whole string.
  let p = pattern;

  // Normalize Windows backslashes just in case.
  p = p.replace(/\\/g, "/");

  // If pattern starts with "/", anchor to root (relative path start)
  const anchored = p.startsWith("/");
  if (anchored) p = p.slice(1);

  // Escape everything, then convert glob tokens.
  let re = escapeRegex(p);

  // Convert escaped glob tokens back into glob semantics:
  // \*\* -> .*
  re = re.replace(/\\\*\\\*/g, "§§DOUBLESTAR§§");
  // \* -> [^/]* (single segment)
  re = re.replace(/\\\*/g, "[^/]*");
  // \? -> [^/]
  re = re.replace(/\\\?/g, "[^/]");
  // restore ** as .*
  re = re.replace(/§§DOUBLESTAR§§/g, ".*");

  // If anchored, match from beginning; else allow anywhere in path by prefixing .*/
  if (!anchored) {
    re = `(?:^|.*/)${re}`;
  } else {
    re = `^${re}`;
  }

  return new RegExp(`${re}$`);
}

export function loadTranslateIgnoreFile(cwd: string): IgnoreMatcher | null {
  const ignorePath = path.join(cwd, ".translate.ignore");
  if (!fs.existsSync(ignorePath)) return null;

  const raw = fs.readFileSync(ignorePath, "utf-8");
  const patterns = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (patterns.length === 0) return null;

  const rules = patterns.map((p) => {
    const normalized = p.replace(/\\/g, "/");
    const isBasenameOnly = !normalized.includes("/");
    return { isBasenameOnly, re: globToRegExp(normalized) };
  });

  return {
    ignores: (posixRelativePath: string) => {
      const rel = toPosixPath(posixRelativePath);
      const base = path.posix.basename(rel);
      for (const rule of rules) {
        if (rule.isBasenameOnly) {
          if (rule.re.test(base)) return true;
          continue;
        }
        if (rule.re.test(rel)) return true;
      }
      return false;
    },
  };
}

/**
 * Load .translate-svg.ignore from cwd (e.g. documentation/).
 * Returns a function that returns true if the SVG basename should be ignored.
 * Uses same gitignore-style patterns as .translate.ignore.
 */
export function loadTranslateSvgIgnoreFile(cwd: string): ((basename: string) => boolean) | null {
  const ignorePath = path.join(cwd, ".translate-svg.ignore");
  if (!fs.existsSync(ignorePath)) return null;

  const raw = fs.readFileSync(ignorePath, "utf-8");
  const patterns = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (patterns.length === 0) return null;

  const rules = patterns.map((p) => {
    const normalized = p.replace(/\\/g, "/");
    return { re: globToRegExp(normalized) };
  });

  return (basename: string) => {
    for (const rule of rules) {
      if (rule.re.test(basename)) return true;
    }
    return false;
  };
}

export function isIgnoredDocFile(filepath: string, docsDir: string, ig: IgnoreMatcher): boolean {
  const relativeToDocs = path.relative(docsDir, filepath);
  const isInsideDocs =
    !!relativeToDocs && !relativeToDocs.startsWith("..") && !path.isAbsolute(relativeToDocs);

  if (isInsideDocs) {
    // Use gitignore-style relative matching against docs root
    return ig.ignores(toPosixPath(relativeToDocs));
  }

  // If the file is outside docs root, fall back to basename-only matching
  return ig.ignores(path.basename(filepath));
}

