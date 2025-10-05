import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/configuration',
        'getting-started/first-steps',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/overview',
        'user-guide/dashboard',
        'user-guide/server-management',
        'user-guide/notifications',
        'user-guide/backup-monitoring',
        'user-guide/troubleshooting',
      ],
    },
    // API Reference section removed - files not found in docs
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/setup',
        'development/scripts',
        'development/testing',
        'development/database',
        'development/ai-development',
      ],
    },
    {
      type: 'category',
      label: 'Migration',
      items: [
        'migration/overview',
        'migration/version-0.7',
        'migration/api-changes',
      ],
    },
    {
      type: 'category',
      label: 'Release Notes',
      items: [
        'release-notes/0.8.x',
        'release-notes/0.7.27',
      ],
    },
  ],
};

export default sidebars;
