import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkGithubAlerts from 'remark-github-alerts';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

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
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Waldemar Scudeller Jr.', // Usually your GitHub org/user name.
  projectName: 'duplistatus', // Usually your repo name.

  onBrokenLinks: 'throw',
  markdown: {
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
          // Enable versioning
          versions: {
            current: {
              label: '0.8',
              path: '0.8',
            },
          },
          // Disable edit links - remove editUrl property
          // Enable table of contents
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
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
    // Enable local search
    search: {
      provider: 'local',
    },
    // Enable dark mode
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'duplistatus Documentation',
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
          type: 'docsVersionDropdown',
          position: 'right',
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
                label: 'Getting Started',
                to: '/0.8/getting-started/installation',
              },
              {
                label: 'User Guide',
                to: '/0.8/user-guide/overview',
              },
            ],
          },
          {
            title: 'Development',
            items: [
              {
                label: 'Development Setup',
                to: '/0.8/development/setup',
              },
              {
                label: 'API Reference',
                to: '/0.8/api-reference/overview',
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
        copyright: `Copyright © Waldemar Scudeller Jr. Built with Docusaurus.`,
      },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
