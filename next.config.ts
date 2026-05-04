import type { NextConfig } from "next";
import { version } from "./package.json";

const ourWebpack: NextConfig["webpack"] = (config, { isServer, webpack }) => {
  if (isServer) {
    config.externals.push("better-sqlite3");
  }

  config.watchOptions = {
    ...config.watchOptions,
    ignored: [
      "**/node_modules/**",
      "**/data/**",
      "**/.git/**",
      "**/.next/**",
    ],
    poll: 1000,
  };

  config.resolve = config.resolve || {};
  config.resolve.symlinks = false;

  config.module.rules.push({
    test: /\.node$/,
    use: "raw-loader",
  });

  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    crypto: false,
    child_process: false,
    stream: false,
    url: false,
  };
  config.resolve.alias = {
    ...config.resolve.alias,
    "node:crypto": false,
  };
  config.plugins = config.plugins || [];
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(/^node:(.+)$/, (resource: { request: string }) => {
      resource.request = resource.request.replace(/^node:/, "");
    })
  );

  if (!isServer) {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        chunks: "all",
        cacheGroups: {
          ...config.optimization?.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          ui: {
            test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
            name: "ui",
            chunks: "all",
            priority: 20,
          },
        },
      },
    };
  }

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

  return config;
};

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  turbopack: {},
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  distDir: ".next",
  outputFileTracingExcludes: {
    "*": ["**/data/**"],
  },
  allowedDevOrigins: ["192.168.1.20", "g5-server"],
  typescript: { ignoreBuildErrors: false },
  env: { NEXT_PUBLIC_APP_VERSION: version },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", port: "", pathname: "/**" },
    ],
  },
  webpack: (config, options) => {
    ourWebpack?.(config, options);
    return config;
  },
};

export default nextConfig;
