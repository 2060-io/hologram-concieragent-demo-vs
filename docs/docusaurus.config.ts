import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { remarkKroki } from 'remark-kroki';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Hologram SDK',
  tagline: 'Open source solution for building chat-based verifiable services and verifiable AI agents, backed by decentralized identity, verifiable credentials and DIDComm.',
  favicon: 'img/favicon.ico',

  stylesheets: [
    {
      href: '/css/euclid-circular-a.css',
      type: 'text/css',
    },
  ],
  // Set the production url of your site here
  url: 'https://docs.hologram.zone',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: '2060-io', // Your GitHub organization/user name
  projectName: 'hologram-docs', // Your repository name

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

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
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: undefined,
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          includeCurrentVersion: true, // Ensure the latest docs are included
          versions: {
            current: {
              label: 'Next', // The default latest version
              path: 'next',
              banner: 'none',
            },
          },
          remarkPlugins: [
            [
              remarkKroki,
              {
                // ...options here
                alias: ['plantuml'],
                target: 'mdx3',
                server: 'https://kroki.io'
              }
            ]
          ]
        },
        //blog: {
        //  showReadingTime: true,
        //  editUrl: 'https://github.com/2060-io/verana-docs/edit/main/',
        //},
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    
    
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    image: 'img/hologram-docs-og.jpg', // Replace with your social card

    metadata: [
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: 'Hologram'},
      {name: 'twitter:description', content: 'Private messaging meets Verifiable IA'},
      {name: 'twitter:image', content: 'https://docs.hologram.zone/img/hologram-docs-og.jpg'},
  
      {property: 'og:title', content: 'Hologram'},
      {property: 'og:description', content: 'Private messaging meets Verifiable IA'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://docs.hologram.zone'},
      {property: 'og:image', content: 'https://docs.hologram.zone/img/hologram-docs-og.jpg'},
    ],

    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'Hologram',
      logo: {
        alt: 'Hologram Logo',
        src: 'img/hologram.zone.svg',
      },
      items: [
        {
          type: 'docsVersionDropdown', // This enables the version dropdown
          position: 'right',
        },
        {
          type: 'docSidebar',
          sidebarId: 'learnSidebar',
          position: 'left',
          label: 'Learn',
        },
        {
          type: 'docSidebar',
          sidebarId: 'buildSidebar',
          position: 'left',
          label: 'Build',
        },
       
        
        {
          href: 'https://github.com/2060-io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Ecosystem',
          items: [
            {
              label: 'Verana',
              href: 'https://verana.io/',
            }, {
              label: 'Trust over IP',
              href: 'https://trustoverip.org/',
            }, {
              label: 'DIF',
              href: 'https://identity.foundation/',
            },

            
          ],
        },
        
        
        {
          title: 'Community',
          items: [
            {
              label: 'Linkedin',
              href: 'https://www.linkedin.com/company/2060-io/',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/pFk6XdC28E',
            }
          ],
        },
        {
          title: 'About Hologram',
          items: [
            {
              label: 'Website',
              href: 'https://hologram.zone',
            }
            
          ],
        },
        
      ],
      copyright: `©${new Date().getFullYear()} 2060 OÜ`,
    },
   
  } satisfies Preset.ThemeConfig,
};

export default config;
