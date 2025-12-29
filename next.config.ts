import type {NextConfig} from 'next';
import { version } from './package.json';

const nextConfig: NextConfig = {
  output: "standalone",  // Enable standalone output to reduce Docker image size
  devIndicators: false,
  
  // Disable Turbopack to use webpack configuration
  turbopack: {},
  
  // Optimize preloading to reduce warnings
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  
  // Exclude data directory from file system scanning
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Configure what Next.js should ignore during build
  distDir: '.next',
  
  // Configure webpack to handle binary files
  webpack: (config, { isServer, webpack }) => {
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
    };

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

    // Return the modified config
    return config;
  },
  
  allowedDevOrigins: ['192.168.1.20', 'g5-server'],
  typescript: {
    ignoreBuildErrors: false,
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
