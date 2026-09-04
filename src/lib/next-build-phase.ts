/**
 * True while Next.js is compiling (`next build` page-data / static generation workers).
 * Those workers import server modules in parallel and must not open the on-disk SQLite file.
 */
export function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}
