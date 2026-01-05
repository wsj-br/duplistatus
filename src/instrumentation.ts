export async function register() {
  // Only run in Node.js runtime, not Edge Runtime
  // Use conditional import to avoid Edge Runtime static analysis
  if (process.env.NEXT_RUNTIME === 'nodejs' || !process.env.NEXT_RUNTIME) {
    // Default to Node.js if NEXT_RUNTIME is not set (development)
    const { clearSessionsOnStartup } = await import('./instrumentation-node.server');
    await clearSessionsOnStartup();
  }
  // If Edge Runtime, do nothing (instrumentation doesn't need to run there)
}
