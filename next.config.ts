import type {NextConfig} from 'next';

import { version } from './package.json';
// Use require for webpack to avoid missing type declarations
const webpack = require('webpack');

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Configure webpack to handle binary files
  webpack: (config, { isServer }) => {
    // Add support for better-sqlite3
    if (isServer) {
      config.externals.push('better-sqlite3');
    }

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
      new webpack.NormalModuleReplacementPlugin(/^node:(.+)$/, (resource: any) => {
        resource.request = resource.request.replace(/^node:/, '');
      })
    );

    // Return the modified config
    return config;
  },
  
  allowedDevOrigins: ['192.168.1.20', 'g5-server'],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
