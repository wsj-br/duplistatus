import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkGithubAlerts from 'remark-github-alerts';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Get the BASE_URL from the environment variables, 
// defaulting to '/duplistatus/' for GitHub Pages deployment.
const baseUrl = process.env.BASE_URL || '/duplistatus/';

const config: Config = {
  title: 'duplistatus',
  tagline: 'A dashboard to monitor your Duplicati backups',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://wsj-br.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served|
  baseUrl: baseUrl,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'wsj-br', // Usually your GitHub org/user name.
  projectName: 'duplistatus', // Usually your repo name.

  // The branch that Docusaurus will push the build output to.
  deploymentBranch: 'gh-pages', 
  
  // It's recommended to set a trailingSlash for consistent links on GH Pages
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    '@docusaurus/theme-mermaid',
    'docusaurus-plugin-image-zoom',
  ],

  themes: [
    [
      '@cmfcmf/docusaurus-search-local',
      {
        // Options for the search plugin
        indexDocs: true,
        indexBlog: false,
        indexPages: false,
        language: ['en'],
        style: undefined,
        maxSearchResults: 8,
        lunr: {
          // Use English language for better search results
          tokenizerSeparator: /[\s\-]+/,
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Point to your existing docs folder
          path: './docs',
          // Make docs the default route
          routeBasePath: '/',
          // Disable edit links - remove editUrl property
          // Enable table of contents
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
          // Add GitHub alerts plugin
          remarkPlugins: [remarkGithubAlerts],
        },
        // Disable blog completely
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],


  themeConfig: {
    // Replace with your project's social card
    image: 'img/duplistatus_banner.png',
    // Enable dark mode
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        autoCollapseCategories: true,
        hideable: true,
      },
    },
    navbar: {
      title: 'duplistatus',
      logo: {
        alt: 'duplistatus Logo',
        src: 'img/duplistatus_logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          type: 'html',
          position: 'right',
          value: '<a href="https://github.com/wsj-br/duplistatus" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" class="navbar__item navbar__link github-icon-link"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>',
        },
      ],
    },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'Installation',
                to: '/installation/',
              },
              {
                label: 'User Guide',
                to: '/user-guide/overview',
              },
              {
                label: 'Migration',
                to: '/migration/version_upgrade',
              }
            ],
          },
          {
            title: 'Development',
            items: [
              {
                label: 'Development Setup',
                to: 'development/setup',
              },
              {
                label: 'API Reference',
                to: 'api-reference/overview',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                html: '<a href="https://github.com/wsj-br/duplistatus" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" class="footer__link-item github-icon-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="vertical-align: middle; margin-right: 0.5rem;"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>GitHub</a>',
              },
              {
                html: '<a href="https://hub.docker.com/r/wsjbr/duplistatus" target="_blank" rel="noopener noreferrer" aria-label="Docker Hub repository" class="footer__link-item docker-icon-link"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="vertical-align: middle; margin-right: 0.5rem;"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.12a.186.186 0 00-.185.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/></svg>Docker Hub</a>',
              },
            ],
          },
        ],
        copyright: `Copyright © Waldemar Scudeller Jr.`,
      },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.nightOwl,
      additionalLanguages: ['bash', 'yaml', 'docker', 'json', 'python', 'sql'],
    },
    zoom: {
      selector: '.markdown img:not(.no-zoom)',
      background: {
        light: 'rgb(255, 255, 255)',
        dark: 'rgb(50, 50, 50)',
      },
      config: {
        // Additional options from medium-zoom can be specified here
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
