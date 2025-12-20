// bundle-cron-service.cjs
//
// This script bundles the cron service into a single JS file for production runtime.
//

/* eslint-disable no-console */

const path = require('node:path');
const process = require('node:process');
const fs = require('node:fs');

// Resolve esbuild from a global install in the Docker build stage.
// (NODE_PATH will be set to /usr/local/lib/node_modules)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const esbuild = require('esbuild');

function aliasAtToSrcPlugin() {
  const projectRoot = process.cwd();
  const srcRoot = path.join(projectRoot, 'src');

  const resolveWithExtensions = (basePath) => {
    // If caller already included an extension, use as-is.
    if (path.extname(basePath)) {
      return fs.existsSync(basePath) ? basePath : null;
    }

    const candidates = [
      `${basePath}.ts`,
      `${basePath}.tsx`,
      `${basePath}.js`,
      `${basePath}.mjs`,
      `${basePath}.cjs`,
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    // Directory imports: try index.*
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      const indexCandidates = [
        path.join(basePath, 'index.ts'),
        path.join(basePath, 'index.tsx'),
        path.join(basePath, 'index.js'),
        path.join(basePath, 'index.mjs'),
        path.join(basePath, 'index.cjs'),
      ];
      for (const candidate of indexCandidates) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }

    return null;
  };

  return {
    name: 'alias-at-to-src',
    setup(build) {
      build.onResolve({ filter: /^@\// }, (args) => {
        const rel = args.path.slice(2); // remove "@/"
        const basePath = path.join(srcRoot, rel);
        const resolved = resolveWithExtensions(basePath);
        if (!resolved) {
          return {
            errors: [
              {
                text: `Unable to resolve aliased import '${args.path}' -> '${basePath}{.ts,.tsx,.js...}'`,
              },
            ],
          };
        }
        return { path: resolved };
      });
    },
  };
}

async function main() {
  await esbuild.build({
    entryPoints: ['src/cron-service/index.ts'],
    outfile: 'dist/cron-service.cjs',
    bundle: true,
    platform: 'node',
    target: 'node24',
    format: 'cjs',
    sourcemap: false,
    minify: true,
    plugins: [aliasAtToSrcPlugin()],
    // Native addons must remain external.
    external: ['better-sqlite3', 'bcrypt'],
  });

  console.log('[bundle-cron-service] Wrote dist/cron-service.cjs');
}

main().catch((err) => {
  console.error('[bundle-cron-service] Failed:', err && err.message ? err.message : String(err));
  process.exit(1);
});
