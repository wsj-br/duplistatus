import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

const rootDir = join(__dirname, '..');

// Directories and files to clean
const itemsToRemove = [
  '.next',
  'node_modules',
  'dist',
  '.turbo',
  'pnpm-lock.yaml'
];

console.log('🧹 Cleaning build artifacts and dependencies...');

// Remove directories and files
itemsToRemove.forEach(item => {
  const path = join(rootDir, item);
  if (existsSync(path)) {
    try {
      rmSync(path, { recursive: true, force: true });
      console.log(`✅ Removed ${item}`);
    } catch (error) {
      console.error(`❌ Error removing ${item}:`, error);
    }
  } else {
    console.log(`ℹ️ ${item} not found, skipping...`);
  }
});

// Clear pnpm store cache
try {
  console.log('🧹 Clearing pnpm store cache...');
  execSync('pnpm store prune', { stdio: 'inherit' });
  console.log('✅ pnpm store cache cleared');
} catch (error) {
  console.error('❌ Error clearing pnpm store cache:', error);
}

console.log('✨ Clean completed!'); 