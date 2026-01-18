#!/usr/bin/env tsx
/**
 * Verification script for Phase 4.3: Component Integration Testing
 * 
 * This script checks:
 * 1. All content files exist for components that need translations
 * 2. Components are using useIntlayer hook correctly
 * 3. Common content is being used appropriately
 * 
 * Run with: pnpm tsx dev/verify-i18n-integration.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const SRC_DIR = join(PROJECT_ROOT, 'src');

interface ComponentInfo {
  name: string;
  path: string;
  hasContentFile: boolean;
  usesUseIntlayer: boolean;
  usesCommon: boolean;
  contentKey?: string;
  isServerComponent?: boolean; // Server components that don't render content directly
}

// Components that should have content files
const EXPECTED_COMPONENTS = [
  // Dashboard
  { name: 'dashboard-table', path: 'components/dashboard/dashboard-table.tsx', contentKey: 'dashboard-table' },
  { name: 'server-cards', path: 'components/dashboard/server-cards.tsx', contentKey: 'server-cards' },
  { name: 'overview-cards', path: 'components/dashboard/overview-cards.tsx', contentKey: 'overview-cards' },
  { name: 'overview-charts-panel', path: 'components/dashboard/overview-charts-panel.tsx', contentKey: 'overview-charts-panel' },
  { name: 'dashboard-summary-cards', path: 'components/dashboard/dashboard-summary-cards.tsx', contentKey: 'dashboard-summary-cards' },
  
  // Settings
  { name: 'server-settings-form', path: 'components/settings/server-settings-form.tsx', contentKey: 'server-settings-form' },
  { name: 'email-configuration-form', path: 'components/settings/email-configuration-form.tsx', contentKey: 'email-configuration-form' },
  { name: 'ntfy-form', path: 'components/settings/ntfy-form.tsx', contentKey: 'ntfy-form' },
  { name: 'notification-templates-form', path: 'components/settings/notification-templates-form.tsx', contentKey: 'notification-templates-form' },
  { name: 'overdue-monitoring-form', path: 'components/settings/overdue-monitoring-form.tsx', contentKey: 'overdue-monitoring-form' },
  { name: 'user-management-form', path: 'components/settings/user-management-form.tsx', contentKey: 'user-management-form' },
  { name: 'audit-log-viewer', path: 'components/settings/audit-log-viewer.tsx', contentKey: 'audit-log-viewer' },
  { name: 'database-maintenance-form', path: 'components/settings/database-maintenance-form.tsx', contentKey: 'database-maintenance-form' },
  
  // Server Details
  { name: 'server-backup-table', path: 'components/server-details/server-backup-table.tsx', contentKey: 'server-backup-table' },
  { name: 'server-detail-summary-items', path: 'components/server-details/server-detail-summary-items.tsx', contentKey: 'server-detail-summary-items' },
  { name: 'server-details-content', path: 'components/server-details/server-details-content.tsx', contentKey: 'server-details-content' },
  
  // UI Components
  { name: 'backup-tooltip-content', path: 'components/ui/backup-tooltip-content.tsx', contentKey: 'backup-tooltip-content' },
  { name: 'available-backups-modal', path: 'components/ui/available-backups-modal.tsx', contentKey: 'available-backups-modal' },
  
  // Pages
  // Note: page.tsx is a server component that doesn't render content directly
  // It only passes data to client components, so it doesn't need useIntlayer/getContent
  { name: 'page', path: 'app/[locale]/page.tsx', contentKey: 'dashboard-page', isServerComponent: true },
  { name: 'login-page', path: 'app/[locale]/login/page.tsx', contentKey: 'login-page' },
];

function checkComponent(component: typeof EXPECTED_COMPONENTS[0]): ComponentInfo {
  const componentPath = join(SRC_DIR, component.path);
  const contentPath = componentPath.replace(/\.tsx$/, '.content.ts');
  
  const info: ComponentInfo = {
    name: component.name,
    path: component.path,
    hasContentFile: existsSync(contentPath),
    usesUseIntlayer: false,
    usesCommon: false,
    contentKey: component.contentKey,
    isServerComponent: component.isServerComponent || false,
  };
  
  if (existsSync(componentPath)) {
    const content = readFileSync(componentPath, 'utf-8');
    // Check for both useIntlayer (client) and getContent (server)
    // Note: getContent doesn't exist in Intlayer, so we only check for useIntlayer
    info.usesUseIntlayer = /useIntlayer\(/.test(content);
    info.usesCommon = /useIntlayer\(['"]common['"]/.test(content);
  }
  
  return info;
}

function verifyContentFile(path: string, expectedKey: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!existsSync(path)) {
    errors.push('Content file does not exist');
    return { valid: false, errors };
  }
  
  const content = readFileSync(path, 'utf-8');
  
  // Check for key definition
  if (!new RegExp(`key:\\s*['"]${expectedKey}['"]`).test(content)) {
    errors.push(`Content key should be '${expectedKey}' but not found or incorrect`);
  }
  
  // Check for all 5 languages
  // Content files use t({ en: '...', de: '...', ... }) format
  const languages = ['en', 'de', 'fr', 'es', 'pt-BR'];
  for (const lang of languages) {
    // Match patterns like: en: '...' or "en": '...' or 'pt-BR': '...'
    // The colon can have spaces around it: en : or en:
    const escapedLang = lang.replace('-', '\\-');
    const patterns = [
      new RegExp(`\\b${escapedLang}\\s*:`, 'i'),  // en: or en :
      new RegExp(`['"]${escapedLang}['"]\\s*:`, 'i'),  // 'en': or "en":
    ];
    
    const found = patterns.some(pattern => pattern.test(content));
    if (!found) {
      errors.push(`Missing translation for language: ${lang}`);
    }
  }
  
  // Check for Dictionary type
  if (!content.includes('Dictionary') && !content.includes('satisfies Dictionary')) {
    errors.push('Content file should use Dictionary type');
  }
  
  return { valid: errors.length === 0, errors };
}

function main() {
  console.log('🔍 Verifying i18n Integration (Phase 4.3)\n');
  console.log('='.repeat(60));
  
  const results: ComponentInfo[] = [];
  let totalIssues = 0;
  
  for (const component of EXPECTED_COMPONENTS) {
    const info = checkComponent(component);
    results.push(info);
    
    const issues: string[] = [];
    
    if (!info.hasContentFile) {
      issues.push('❌ Missing content file');
      totalIssues++;
    }
    
    // Server components that don't render content directly don't need useIntlayer
    // They only pass data to client components which handle i18n
    if (!info.usesUseIntlayer && !info.isServerComponent) {
      issues.push('❌ Not using useIntlayer hook');
      totalIssues++;
    } else if (!info.usesUseIntlayer && info.isServerComponent) {
      // This is expected for server components that don't render content
      // Content is used by client components they render
    }
    
    // Common content check only applies to components that use useIntlayer
    if (!info.usesCommon && info.usesUseIntlayer) {
      issues.push('⚠️  Not using common content (may be intentional)');
    }
    
    if (issues.length > 0) {
      console.log(`\n📦 ${info.name}`);
      console.log(`   Path: ${info.path}`);
      issues.forEach(issue => console.log(`   ${issue}`));
    }
  }
  
  // Verify content files
  console.log('\n\n📋 Content File Verification');
  console.log('='.repeat(60));
  
  for (const result of results) {
    if (result.hasContentFile && result.contentKey) {
      const contentPath = join(SRC_DIR, result.path.replace(/\.tsx$/, '.content.ts'));
      const verification = verifyContentFile(contentPath, result.contentKey);
      
      if (!verification.valid) {
        console.log(`\n❌ ${result.name}.content.ts`);
        verification.errors.forEach(error => {
          console.log(`   ${error}`);
          totalIssues++;
        });
      }
    }
  }
  
  // Summary
  console.log('\n\n📊 Summary');
  console.log('='.repeat(60));
  
  const componentsWithContent = results.filter(r => r.hasContentFile).length;
  const componentsUsingHook = results.filter(r => r.usesUseIntlayer).length;
  const componentsUsingCommon = results.filter(r => r.usesCommon).length;
  
  console.log(`Total components checked: ${results.length}`);
  console.log(`Components with content files: ${componentsWithContent}/${results.length}`);
  console.log(`Components using useIntlayer: ${componentsUsingHook}/${results.length}`);
  console.log(`Components using common content: ${componentsUsingCommon}/${results.length}`);
  console.log(`Total issues found: ${totalIssues}`);
  
  if (totalIssues === 0) {
    console.log('\n✅ All checks passed! Ready for Phase 4.3 testing.');
  } else {
    console.log('\n⚠️  Some issues found. Please fix before proceeding to testing.');
    process.exit(1);
  }
}

main();
