/**
 * Tee stdout and stderr to a log file in .translation-cache.
 * Call setupLogOutput() at script start; call the returned cleanup on exit.
 */

import fs from "fs";
import path from "path";

const DEFAULT_CACHE_DIR = ".translation-cache";

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

export function setupLogOutput(
  options?: { cacheDir?: string; prefix?: string }
): { logPath: string; cleanup: () => void } {
  const cacheDir = options?.cacheDir ?? path.join(process.cwd(), DEFAULT_CACHE_DIR);
  const prefix = options?.prefix ?? "translate";
  const dir = path.resolve(cacheDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const logPath = path.join(dir, `${prefix}_${timestamp()}.log`);

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  /** Skip progress lines (carriage-return overwrites) - show in console only, not in log */
  function isProgressLine(chunk: unknown): boolean {
    if (typeof chunk === "string") return chunk.startsWith("\r");
    if (Buffer.isBuffer(chunk)) return chunk[0] === 0x0d;
    return false;
  }

  function tee(
    original: NodeJS.WritableStream["write"],
    chunk: unknown,
    encodingOrCallback?: BufferEncoding | ((err?: Error) => void),
    callback?: (err?: Error) => void
  ): boolean {
    const enc = typeof encodingOrCallback === "string" ? encodingOrCallback : undefined;
    const cb = typeof encodingOrCallback === "function" ? encodingOrCallback : callback;
    try {
      if (!isProgressLine(chunk)) {
        const s = typeof chunk === "string" ? chunk : (chunk as Buffer).toString(enc ?? "utf8");
        fs.appendFileSync(logPath, s, "utf8");
      }
    } catch {
      // ignore log write errors
    }
    if (cb) {
      return (original as (c: unknown, e?: BufferEncoding, cb?: (err?: Error) => void) => boolean)(
        chunk,
        enc,
        cb
      );
    }
    return (original as (c: unknown, e?: BufferEncoding) => boolean)(chunk, enc);
  }

  process.stdout.write = function (
    chunk: unknown,
    encodingOrCallback?: BufferEncoding | ((err?: Error) => void),
    callback?: (err?: Error) => void
  ): boolean {
    return tee(originalStdoutWrite, chunk, encodingOrCallback, callback);
  };

  process.stderr.write = function (
    chunk: unknown,
    encodingOrCallback?: BufferEncoding | ((err?: Error) => void),
    callback?: (err?: Error) => void
  ): boolean {
    return tee(originalStderrWrite, chunk, encodingOrCallback, callback);
  };

  const cleanup = () => {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  };

  process.once("exit", () => cleanup());
  process.once("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.once("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });

  return { logPath, cleanup };
}
