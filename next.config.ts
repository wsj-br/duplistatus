import type { NextConfig } from "next";
import { withIntlayerSync } from "next-intlayer/server";
import { version } from "./package.json";

/**
 * Our webpack customizations (better-sqlite3, watchOptions, resolve, rules, etc.).
 * Composed with Intlayer's webpack in the final config so both run: ours first, then Intlayer.
 */
const ourWebpack: NextConfig["webpack"] = (config, { isServer, webpack }) => {
    // Add support for better-sqlite3
    if (isServer) {
      config.externals.push('better-sqlite3');
    }

    // Exclude data directory from webpack file system scanning
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/data/**',
        '**/.git/**',
        '**/.next/**',
      ],
      // Poll for changes (helps with file watching reliability)
      poll: 1000,
    };
    
    // In development, make webpack re-read intlayer dictionary files on changes
    if (process.env.NODE_ENV === 'development') {
      // Add .intlayer dictionary directory to webpack's watch list
      if (!config.watchOptions.ignored) {
        config.watchOptions.ignored = [];
      }
      // Don't ignore .intlayer dictionary files - we want to watch them
      // But we do want to ignore the cache
      if (Array.isArray(config.watchOptions.ignored)) {
        config.watchOptions.ignored = config.watchOptions.ignored.filter(
          (pattern: string) => !pattern.includes('.intlayer/dictionary')
        );
      }
    }

    // Additional configuration to prevent webpack from scanning these directories
    config.resolve = config.resolve || {};
    config.resolve.symlinks = false;

    // Configure support for *.node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    });

    // Stub out Node.js core modules for bundling (browser and server)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      child_process: false,
      stream: false,
      url: false,
    };
    // Alias node:crypto scheme to stub
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:crypto': false,
    };
    // Replace 'node:' scheme to load core modules properly
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:(.+)$/, (resource: { request: string }) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );

    // Optimize bundle splitting to reduce preload warnings
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
    }

    // Suppress critical dependency warnings from dependencies that use dynamic requires
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /react-datepicker/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /@ts-morph\/common/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // In development, ensure webpack watches intlayer dictionary files and invalidates cache
    if (process.env.NODE_ENV === 'development') {
      const path = require('path');
      const fs = require('fs');
      
      // Add a plugin to watch dictionary files and invalidate webpack cache
      config.plugins = config.plugins || [];
      config.plugins.push(
        new (class {
          apply(compiler: any) {
            compiler.hooks.afterCompile.tap('IntlayerDictionaryWatcher', (compilation: any) => {
              const dictPath = path.join(process.cwd(), '.intlayer', 'dictionary');
              const dictMjsPath = path.join(process.cwd(), '.intlayer', 'main', 'dictionaries.mjs');
              
              // Add dictionary directory and main file to dependencies
              if (fs.existsSync(dictPath)) {
                const files = fs.readdirSync(dictPath)
                  .filter((file: string) => file.endsWith('.json'))
                  .map((file: string) => path.join(dictPath, file));
                
                files.forEach((file: string) => {
                  if (fs.existsSync(file)) {
                    compilation.fileDependencies.add(file);
                  }
                });
              }
              
              // Also watch the dictionaries.mjs file itself
              if (fs.existsSync(dictMjsPath)) {
                compilation.fileDependencies.add(dictMjsPath);
              }
            });
          }
        })()
      );
    }


  return config;
};

/** Next.js config without webpack (webpack is composed below with Intlayer). */
const configWithoutWebpack: NextConfig = {
  output: "standalone",
  devIndicators: false,
  turbopack: {},
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
  transpilePackages: [
    "@intlayer/config",
    "@intlayer/core",
    "@intlayer/types",
    "intlayer",
    "react-intlayer",
    "next-intlayer",
  ],
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  distDir: ".next",
  outputFileTracingExcludes: {
    "*": [
      "**/data/**",
    ],
  },
  allowedDevOrigins: ["192.168.1.20", "g5-server"],
  typescript: { ignoreBuildErrors: false },
  env: { NEXT_PUBLIC_APP_VERSION: version },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", port: "", pathname: "/**" },
    ],
  },
};

/** Intlayer-wrapped config: webpack, aliases, IntlayerPlugin, optional SWC build optimization. */
const base = withIntlayerSync(configWithoutWebpack);

/** Final config: our webpack runs first, then Intlayer's (preserves better-sqlite3, etc.). */
const nextConfig: NextConfig = {
  ...base,
  webpack: (config, options) => {
    ourWebpack?.(config, options);
    base.webpack?.(config, options);
    return config;
  },
};

export default nextConfig;
