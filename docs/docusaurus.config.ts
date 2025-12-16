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
        // Disable blog for now
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
          href: 'https://github.com/wsj-br/duplistatus',
          label: 'GitHub',
          position: 'right',
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
                label: 'GitHub',
                href: 'https://github.com/wsj-br/duplistatus',
              },
              {
                label: 'Docker Hub',
                href: 'https://hub.docker.com/r/wsjbr/duplistatus',
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
