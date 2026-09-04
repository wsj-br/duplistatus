import { isNextProductionBuild } from '@/lib/next-build-phase';

export async function register() {
  // `next build` page-data workers also invoke instrumentation. Skip so we
  // do not open SQLite or clear sessions while compiling.
  if (isNextProductionBuild()) {
    return;
  }

  // Only run in Node.js runtime, not Edge Runtime
  // Use conditional import to avoid Edge Runtime static analysis
  if (process.env.NEXT_RUNTIME === 'nodejs' || !process.env.NEXT_RUNTIME) {
    // Default to Node.js if NEXT_RUNTIME is not set (development)
    const { clearSessionsOnStartup } = await import('./instrumentation-node.server');
    await clearSessionsOnStartup();
  }
  // If Edge Runtime, do nothing (instrumentation doesn't need to run there)
}
