import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export interface TranslationRow {
  source_hash: string;
  locale: string;
  source_text: string;
  translated_text: string;
  model: string | null;
  filepath: string | null;
  created_at: string | null;
  last_hit_at: string | null;
  start_line: number | null;
}

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
        filepath TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        last_hit_at TEXT,
        start_line INTEGER,
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

      CREATE INDEX IF NOT EXISTS idx_translations_filepath 
        ON translations(filepath);
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
   * Get cached translation for a segment.
   * When filepath is provided and the row has filepath IS NULL, updates filepath.
   * When startLine is provided and the row has start_line IS NULL, updates start_line.
   */
  getSegment(
    sourceHash: string,
    locale: string,
    filepath?: string,
    startLine?: number
  ): string | null {
    const selectStmt = this.db.prepare(`
      SELECT translated_text FROM translations 
      WHERE source_hash = ? AND locale = ?
    `);
    const row = selectStmt.get(sourceHash, locale) as { translated_text: string } | undefined;
    if (row) {
      const updates: string[] = ["last_hit_at = datetime('now')"];
      const params: (string | number)[] = [];

      if (filepath) {
        updates.push("filepath = CASE WHEN (filepath IS NULL OR filepath = '') THEN ? ELSE filepath END");
        params.push(filepath);
      }
      if (startLine !== undefined && startLine !== null) {
        updates.push("start_line = CASE WHEN start_line IS NULL THEN ? ELSE start_line END");
        params.push(startLine);
      }

      params.push(sourceHash, locale);
      this.db
        .prepare(
          `UPDATE translations SET ${updates.join(", ")} WHERE source_hash = ? AND locale = ?`
        )
        .run(...params);

      return row.translated_text;
    }
    return null;
  }

  /**
   * Store a translated segment in cache
   */
  setSegment(
    sourceHash: string,
    locale: string,
    sourceText: string,
    translatedText: string,
    model: string,
    filepath?: string,
    startLine?: number
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO translations (source_hash, locale, source_text, translated_text, model, filepath, created_at, last_hit_at, start_line)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
      ON CONFLICT(source_hash, locale) DO UPDATE SET
        source_text = excluded.source_text,
        translated_text = excluded.translated_text,
        model = excluded.model,
        filepath = excluded.filepath,
        last_hit_at = datetime('now'),
        start_line = CASE WHEN translations.start_line IS NULL THEN excluded.start_line ELSE translations.start_line END
    `);
    stmt.run(
      sourceHash,
      locale,
      sourceText,
      translatedText,
      model,
      filepath ?? null,
      startLine ?? null
    );
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
   * Get source hashes that have at least one row with null/empty filepath
   */
  getSourceHashesWithNullFilepath(): Set<string> {
    const rows = this.db
      .prepare(
        `SELECT DISTINCT source_hash FROM translations WHERE filepath IS NULL OR filepath = ''`
      )
      .all() as { source_hash: string }[];
    return new Set(rows.map((r) => r.source_hash));
  }

  /**
   * Update filepath for rows with the given source_hash where filepath is null/empty.
   * Returns the number of rows updated.
   */
  backfillFilepath(sourceHash: string, filepath: string): number {
    const result = this.db
      .prepare(
        `UPDATE translations SET filepath = ?
      WHERE source_hash = ? AND (filepath IS NULL OR filepath = '')`
      )
      .run(filepath, sourceHash);
    return result.changes;
  }

  /**
   * Set last_hit_at = NULL for markdown entries (filepath IS NULL or filepath NOT LIKE '%.svg').
   * Returns the number of rows updated.
   * @deprecated Use resetLastHitAtForUnhitMarkdown instead to avoid clearing hits before they're used.
   */
  resetLastHitAtForMarkdown(): number {
    const result = this.db
      .prepare(
        `UPDATE translations SET last_hit_at = NULL 
       WHERE filepath IS NULL OR filepath NOT LIKE '%.svg'`
      )
      .run();
    return result.changes;
  }

  /**
   * Set last_hit_at = NULL only for markdown segments that were NOT hit this run.
   * Call at the end of a translate run so cleanup can later remove unused segments.
   * Avoids the window where all segments have last_hit_at=NULL (which would cause
   * translate:cleanup to delete everything if run in parallel).
   */
  resetLastHitAtForUnhitMarkdown(hitKeys: Set<string>): number {
    if (hitKeys.size === 0) return 0;
    const keys = Array.from(hitKeys);
    const flatParams = keys.flatMap((k) => {
      const [h, l] = k.split("|");
      return [h, l];
    });
    this.db.exec("CREATE TEMP TABLE IF NOT EXISTS _hit_keys (source_hash TEXT, locale TEXT)");
    const insertPlaceholders = keys.map(() => "(?, ?)").join(", ");
    this.db.prepare(`INSERT INTO _hit_keys VALUES ${insertPlaceholders}`).run(...flatParams);
    const result = this.db
      .prepare(
        `UPDATE translations SET last_hit_at = NULL 
       WHERE (filepath IS NULL OR filepath NOT LIKE '%.svg')
       AND (source_hash, locale) NOT IN (SELECT source_hash, locale FROM _hit_keys)`
      )
      .run();
    this.db.exec("DROP TABLE IF EXISTS _hit_keys");
    return result.changes;
  }

  /**
   * Set last_hit_at = NULL for SVG entries (filepath LIKE '%.svg').
   * Returns the number of rows updated.
   */
  resetLastHitAtForSvg(): number {
    const result = this.db
      .prepare(`UPDATE translations SET last_hit_at = NULL WHERE filepath LIKE '%.svg'`)
      .run();
    return result.changes;
  }

  /**
   * Clean up translations whose filepath points to a deleted file.
   * If the segment exists elsewhere, update filepath; otherwise delete.
   * Also removes file_tracking entries for deleted filepaths.
   * When dryRun is true, reports what would be done without making changes.
   */
  cleanupOrphanedFileTranslations(
    existingFilepaths: Set<string>,
    hashToFilepath: Map<string, string>,
    dryRun = false
  ): {
    deleted: number;
    updated: number;
    deletedFilepaths: string[];
    deletedTranslations: { source_hash: string; locale: string; filepath: string }[];
  } {
    const rows = this.db
      .prepare(
        `SELECT source_hash, locale, filepath FROM translations WHERE filepath IS NOT NULL AND filepath != ''`
      )
      .all() as { source_hash: string; locale: string; filepath: string }[];

    let deleted = 0;
    let updated = 0;
    const deletedTranslations: { source_hash: string; locale: string; filepath: string }[] = [];

    const updateStmt = this.db.prepare(
      `UPDATE translations SET filepath = ? WHERE source_hash = ? AND locale = ?`
    );
    const deleteStmt = this.db.prepare(`DELETE FROM translations WHERE source_hash = ?`);

    const hashesToDelete = new Set<string>();
    const hashesToUpdate = new Map<string, string>();

    for (const row of rows) {
      if (existingFilepaths.has(row.filepath)) continue;

      const newFilepath = hashToFilepath.get(row.source_hash);
      if (newFilepath) {
        hashesToUpdate.set(row.source_hash, newFilepath);
      } else {
        hashesToDelete.add(row.source_hash);
        deletedTranslations.push({
          source_hash: row.source_hash,
          locale: row.locale,
          filepath: row.filepath,
        });
      }
    }

    if (!dryRun) {
      for (const sourceHash of hashesToDelete) {
        const result = deleteStmt.run(sourceHash);
        deleted += result.changes;
      }

      for (const [sourceHash, newFilepath] of hashesToUpdate) {
        const localeRows = this.db
          .prepare(`SELECT locale FROM translations WHERE source_hash = ?`)
          .all(sourceHash) as { locale: string }[];
        for (const { locale } of localeRows) {
          updateStmt.run(newFilepath, sourceHash, locale);
          updated++;
        }
      }
    } else {
      deleted = deletedTranslations.length;
      for (const sourceHash of hashesToUpdate.keys()) {
        const localeRows = this.db
          .prepare(`SELECT locale FROM translations WHERE source_hash = ?`)
          .all(sourceHash) as { locale: string }[];
        updated += localeRows.length;
      }
    }

    const fileTrackingRows = this.db
      .prepare(`SELECT DISTINCT filepath FROM file_tracking`)
      .all() as { filepath: string }[];
    const deletedFilepaths = fileTrackingRows
      .map((r) => r.filepath)
      .filter((fp) => !existingFilepaths.has(fp));

    if (!dryRun && deletedFilepaths.length > 0) {
      const placeholders = deletedFilepaths.map(() => "?").join(",");
      this.db.prepare(`DELETE FROM file_tracking WHERE filepath IN (${placeholders})`).run(...deletedFilepaths);
    }

    return { deleted, updated, deletedFilepaths, deletedTranslations };
  }

  /**
   * Delete translations where last_hit_at is NULL or filepath is NULL/empty.
   * Returns the number of rows deleted and the deleted row details for logging.
   * When dryRun is true, reports what would be deleted without making changes.
   */
  cleanupStaleTranslations(dryRun = false): {
    count: number;
    deletedRows: { source_hash: string; locale: string; filepath: string | null }[];
  } {
    const deletedRows = this.db
      .prepare(
        `SELECT source_hash, locale, filepath FROM translations 
       WHERE last_hit_at IS NULL OR filepath IS NULL OR filepath = ''`
      )
      .all() as { source_hash: string; locale: string; filepath: string | null }[];

    if (!dryRun) {
      this.db
        .prepare(
          `DELETE FROM translations 
         WHERE last_hit_at IS NULL OR filepath IS NULL OR filepath = ''`
        )
        .run();
    }

    return { count: deletedRows.length, deletedRows };
  }

  /**
   * List translations with optional filters and pagination.
   * Returns { rows, total }.
   */
  listTranslations(filters?: {
    filename?: string;
    locale?: string;
    source_hash?: string;
    source_text?: string;
    translated_text?: string;
    last_hit_at_null?: boolean;
    limit?: number;
    offset?: number;
  }): { rows: TranslationRow[]; total: number } {
    const limit = filters?.limit ?? 50;
    const offset = filters?.offset ?? 0;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters?.filename?.trim()) {
      conditions.push("filepath LIKE ?");
      params.push(`%${filters.filename.trim()}%`);
    }
    if (filters?.locale?.trim()) {
      conditions.push("locale = ?");
      params.push(filters.locale.trim());
    }
    if (filters?.source_hash?.trim()) {
      conditions.push("source_hash LIKE ?");
      params.push(`%${filters.source_hash.trim()}%`);
    }
    if (filters?.source_text?.trim()) {
      conditions.push("source_text LIKE ?");
      params.push(`%${filters.source_text.trim()}%`);
    }
    if (filters?.translated_text?.trim()) {
      conditions.push("translated_text LIKE ?");
      params.push(`%${filters.translated_text.trim()}%`);
    }
    if (filters?.last_hit_at_null === true) {
      conditions.push("last_hit_at IS NULL");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const countStmt = this.db.prepare(
      `SELECT COUNT(*) as count FROM translations ${whereClause}`
    );
    const total = (countStmt.get(...params) as { count: number }).count;

    const selectStmt = this.db.prepare(
      `SELECT source_hash, locale, source_text, translated_text, model, filepath, created_at, last_hit_at, start_line
       FROM translations ${whereClause}
       ORDER BY filepath, locale, source_hash
       LIMIT ? OFFSET ?`
    );
    const rows = selectStmt.all(...params, limit, offset) as TranslationRow[];

    return { rows, total };
  }

  /**
   * Update translated_text for a segment.
   */
  updateTranslation(sourceHash: string, locale: string, translatedText: string): void {
    this.db
      .prepare(
        `UPDATE translations SET translated_text = ? WHERE source_hash = ? AND locale = ?`
      )
      .run(translatedText, sourceHash, locale);
  }

  /**
   * Delete a single translation and any file_tracking rows referencing that hash+locale.
   */
  deleteTranslation(sourceHash: string, locale: string): void {
    this.db.prepare("DELETE FROM translations WHERE source_hash = ? AND locale = ?").run(sourceHash, locale);
    this.db.prepare("DELETE FROM file_tracking WHERE source_hash = ? AND locale = ?").run(sourceHash, locale);
  }

  /**
   * Delete all translations matching the given filters (same as listTranslations).
   * Also removes file_tracking rows for deleted (source_hash, locale) pairs.
   * Returns the number of translation rows deleted.
   */
  deleteByFilters(filters?: {
    filename?: string;
    locale?: string;
    source_hash?: string;
    source_text?: string;
    translated_text?: string;
    last_hit_at_null?: boolean;
  }): number {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters?.filename?.trim()) {
      conditions.push("filepath LIKE ?");
      params.push(`%${filters.filename.trim()}%`);
    }
    if (filters?.locale?.trim()) {
      conditions.push("locale = ?");
      params.push(filters.locale.trim());
    }
    if (filters?.source_hash?.trim()) {
      conditions.push("source_hash LIKE ?");
      params.push(`%${filters.source_hash.trim()}%`);
    }
    if (filters?.source_text?.trim()) {
      conditions.push("source_text LIKE ?");
      params.push(`%${filters.source_text.trim()}%`);
    }
    if (filters?.translated_text?.trim()) {
      conditions.push("translated_text LIKE ?");
      params.push(`%${filters.translated_text.trim()}%`);
    }
    if (filters?.last_hit_at_null === true) {
      conditions.push("last_hit_at IS NULL");
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Remove file_tracking rows for the (source_hash, locale) pairs we're about to delete
    this.db
      .prepare(
        `DELETE FROM file_tracking WHERE (source_hash, locale) IN (SELECT source_hash, locale FROM translations ${whereClause})`
      )
      .run(...params);

    const result = this.db.prepare(`DELETE FROM translations ${whereClause}`).run(...params);
    return result.changes;
  }

  /**
   * Delete all translations for a filepath and file_tracking entries.
   * Returns the number of translation rows deleted.
   */
  deleteByFilepath(filepath: string): number {
    const result = this.db.prepare("DELETE FROM translations WHERE filepath = ?").run(filepath);
    this.db.prepare("DELETE FROM file_tracking WHERE filepath = ?").run(filepath);
    return result.changes;
  }

  /**
   * Get distinct locales for the locale filter dropdown.
   */
  getUniqueLocales(): string[] {
    const rows = this.db
      .prepare(`SELECT DISTINCT locale FROM translations ORDER BY locale`)
      .all() as { locale: string }[];
    return rows.map((r) => r.locale);
  }

  /**
   * Get distinct filepaths for the delete-by-filepath dropdown.
   */
  getUniqueFilepaths(): string[] {
    const rows = this.db
      .prepare(
        `SELECT DISTINCT filepath FROM translations WHERE filepath IS NOT NULL AND filepath != '' ORDER BY filepath`
      )
      .all() as { filepath: string }[];
    return rows.map((r) => r.filepath);
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
