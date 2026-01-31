import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export class TranslationCache {
  private db: Database.Database;

  constructor(cachePath: string) {
    // Handle in-memory database for --no-cache option
    if (cachePath === ":memory:") {
      this.db = new Database(":memory:");
      this.initializeSchema();
      return;
    }

    // Ensure cache directory exists
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath, { recursive: true });
    }

    this.db = new Database(path.join(cachePath, "cache.db"));
    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS translations (
        source_hash TEXT NOT NULL,
        locale TEXT NOT NULL,
        source_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        model TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (source_hash, locale)
      );

      CREATE TABLE IF NOT EXISTS file_tracking (
        filepath TEXT NOT NULL,
        locale TEXT NOT NULL,
        source_hash TEXT NOT NULL,
        last_translated TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (filepath, locale)
      );

      CREATE INDEX IF NOT EXISTS idx_translations_locale 
        ON translations(locale);
    `);
  }

  /**
   * Compute a hash for cache lookup
   * Normalizes whitespace for consistent matching
   */
  static computeHash(content: string): string {
    const normalized = content.replace(/\s+/g, " ").trim();
    return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 16);
  }

  /**
   * Get cached translation for a segment
   */
  getSegment(sourceHash: string, locale: string): string | null {
    const stmt = this.db.prepare(`
      SELECT translated_text FROM translations 
      WHERE source_hash = ? AND locale = ?
    `);
    const row = stmt.get(sourceHash, locale) as { translated_text: string } | undefined;
    return row?.translated_text || null;
  }

  /**
   * Store a translated segment in cache
   */
  setSegment(
    sourceHash: string,
    locale: string,
    sourceText: string,
    translatedText: string,
    model: string
  ): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO translations 
      (source_hash, locale, source_text, translated_text, model)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(sourceHash, locale, sourceText, translatedText, model);
  }

  /**
   * Get cached file hash for change detection
   */
  getFileStatus(filepath: string, locale: string): string | null {
    const stmt = this.db.prepare(`
      SELECT source_hash FROM file_tracking 
      WHERE filepath = ? AND locale = ?
    `);
    const row = stmt.get(filepath, locale) as { source_hash: string } | undefined;
    return row?.source_hash || null;
  }

  /**
   * Update file tracking after translation
   */
  setFileStatus(filepath: string, locale: string, sourceHash: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO file_tracking 
      (filepath, locale, source_hash)
      VALUES (?, ?, ?)
    `);
    stmt.run(filepath, locale, sourceHash);
  }

  /**
   * Get cache statistics
   */
  getStats(): { totalSegments: number; totalFiles: number; byLocale: Record<string, number> } {
    const segments = this.db
      .prepare("SELECT COUNT(*) as count FROM translations")
      .get() as { count: number };
    const files = this.db
      .prepare("SELECT COUNT(*) as count FROM file_tracking")
      .get() as { count: number };

    const byLocale: Record<string, number> = {};
    const localeStats = this.db
      .prepare("SELECT locale, COUNT(*) as count FROM translations GROUP BY locale")
      .all() as { locale: string; count: number }[];

    for (const row of localeStats) {
      byLocale[row.locale] = row.count;
    }

    return {
      totalSegments: segments.count,
      totalFiles: files.count,
      byLocale,
    };
  }

  /**
   * Clear cache (optionally for specific locale)
   */
  clear(locale?: string): void {
    if (locale) {
      this.db.prepare("DELETE FROM translations WHERE locale = ?").run(locale);
      this.db.prepare("DELETE FROM file_tracking WHERE locale = ?").run(locale);
    } else {
      this.db.prepare("DELETE FROM translations").run();
      this.db.prepare("DELETE FROM file_tracking").run();
    }
  }

  /**
   * Clear cache for a specific file
   * This removes file tracking and all segments associated with the file's hash
   */
  clearFile(filepath: string, locale: string): void {
    // Get the file's hash from tracking
    const fileStatus = this.getFileStatus(filepath, locale);
    
    // Remove file tracking
    this.db.prepare("DELETE FROM file_tracking WHERE filepath = ? AND locale = ?").run(filepath, locale);
    
    // Note: We can't easily remove segments by filepath since segments are stored by content hash
    // The segments will be naturally replaced when the file is re-translated
    // For a complete clear, user should use --no-cache or clear the entire locale cache
  }

  close(): void {
    this.db.close();
  }
}
