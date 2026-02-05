/**
 * Translation cache editor web server.
 * Run from documentation/: pnpm translate:edit-cache
 */

import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Command } from "commander";
import { exec } from "child_process";
import { loadConfig } from "./config";
import { TranslationCache } from "./cache";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

function findAvailablePort(startPort: number, maxAttempts = 11): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = startPort;
    let attempts = 0;

    function tryListen() {
      const server = http.createServer();
      server.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE" && attempts < maxAttempts) {
          attempts++;
          port++;
          tryListen();
        } else {
          reject(err);
        }
      });
      server.once("listening", () => {
        server.close(() => resolve(port));
      });
      server.listen(port);
    }
    tryListen();
  });
}

async function main() {
  program.option("-c, --config <path>", "Path to config file").parse(process.argv);

  const options = program.opts();
  const config = loadConfig(options.config);
  const cachePath = path.resolve(process.cwd(), config.paths.cache);

  const cache = new TranslationCache(cachePath);

  const app = express();
  app.use(express.json());

  // Serve static files from edit-cache-app
  const appDir = path.join(__dirname, "edit-cache-app");
  app.use(express.static(appDir));

  // API: List translations with filters
  app.get("/api/translations", (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 50));
      const offset = (page - 1) * pageSize;

      const { rows, total } = cache.listTranslations({
        filename: req.query.filename as string | undefined,
        locale: req.query.locale as string | undefined,
        model: req.query.model as string | undefined,
        source_hash: req.query.source_hash as string | undefined,
        source_text: req.query.source_text as string | undefined,
        translated_text: req.query.translated_text as string | undefined,
        last_hit_at_null: req.query.last_hit_at_null === "true",
        limit: pageSize,
        offset,
      });

      res.json({ rows, total, page, pageSize });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: Update translation
  app.patch("/api/translations", (req, res) => {
    try {
      const { source_hash, locale, translated_text } = req.body;
      if (!source_hash || !locale || translated_text === undefined) {
        res.status(400).json({ error: "Missing source_hash, locale, or translated_text" });
        return;
      }
      cache.updateTranslation(source_hash, locale, String(translated_text));
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: Delete single translation
  app.delete("/api/translations/:sourceHash/:locale", (req, res) => {
    try {
      const sourceHash = decodeURIComponent(req.params.sourceHash);
      const locale = decodeURIComponent(req.params.locale);
      cache.deleteTranslation(sourceHash, locale);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: Delete by filters (same params as GET /api/translations)
  app.delete("/api/translations/by-filters", (req, res) => {
    try {
      const filters = {
        filename: req.query.filename as string | undefined,
        locale: req.query.locale as string | undefined,
        model: req.query.model as string | undefined,
        source_hash: req.query.source_hash as string | undefined,
        source_text: req.query.source_text as string | undefined,
        translated_text: req.query.translated_text as string | undefined,
        last_hit_at_null: req.query.last_hit_at_null === "true",
      };
      const deleted = cache.deleteByFilters(filters);
      res.json({ ok: true, deleted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: Delete by filepath
  app.delete("/api/translations/by-filepath", (req, res) => {
    try {
      const filepath = req.query.filepath as string;
      if (!filepath) {
        res.status(400).json({ error: "Missing filepath query parameter" });
        return;
      }
      const deleted = cache.deleteByFilepath(filepath);
      res.json({ ok: true, deleted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: List unique locales
  app.get("/api/locales", (_req, res) => {
    try {
      const locales = cache.getUniqueLocales();
      res.json({ locales });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: List unique models
  app.get("/api/models", (_req, res) => {
    try {
      const models = cache.getUniqueModels();
      res.json({ models });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: List unique filepaths
  app.get("/api/filepaths", (_req, res) => {
    try {
      const filepaths = cache.getUniqueFilepaths();
      res.json({ filepaths });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // API: Log file links to server console (for terminal clickable links)
  app.post("/api/log-links", (req, res) => {
    try {
      const { filepath, start_line, locale } = req.body;
      const cwd = process.cwd();
      const lineSuffix = start_line != null ? `:${start_line}` : "";

      if (!filepath || !locale) {
        res.status(400).json({ error: "Missing filepath or locale" });
        return;
      }

      const isSvg =
        filepath.includes("static/img/") || filepath.endsWith(".svg");

      let sourcePath: string;
      let translatedPath: string;

      if (isSvg) {
        sourcePath = path.resolve(cwd, filepath);
        const basename = path.basename(filepath);
        translatedPath = path.join(
          cwd,
          config.paths.i18n,
          locale,
          "docusaurus-plugin-content-docs",
          "current",
          "assets",
          basename
        );
      } else {
        sourcePath = path.resolve(cwd, config.paths.docs, filepath);
        translatedPath = path.join(
          cwd,
          config.paths.i18n,
          locale,
          "docusaurus-plugin-content-docs",
          "current",
          filepath
        );
      }

      const sourceUrl = pathToFileURL(sourcePath).href + lineSuffix;
      const translatedUrl = pathToFileURL(translatedPath).href;

      console.log(`[edit-cache] Source: ${sourceUrl}`);
      console.log(`[edit-cache] Translated: ${translatedUrl}`);
      console.log(`------`);

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: String(err) });
    }
  });

  // SPA fallback: serve index.html for root
  app.get("/", (_req, res) => {
    res.sendFile(path.join(appDir, "index.html"));
  });

  const port = await findAvailablePort(4000);
  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\nTranslation cache editor: ${url}\n`);
    
    // Open browser using $BROWSER environment variable
    const browser = process.env.BROWSER;
    if (browser) {
      exec(`${browser} ${url}`, (error) => {
        if (error) {
          console.error(`Failed to open browser: ${error.message}`);
        }
      });
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
