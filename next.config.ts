import type { NextConfig } from "next";

// Set by npm/pnpm when running package scripts (e.g. `pnpm build`). Avoid importing package.json here — that retriggers Turbopack NFT “whole project traced” warnings tied to next.config.
const version = process.env.npm_package_version ?? "dev";

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
  // Keep runtime-only paths out of the standalone trace. Excluding the
  // `.next/standalone` output itself stops Turbopack's tracer from pulling
  // `.next/standalone/server.js` into route traces and then failing to copy it
  // into a nested `.next/standalone` path (ENOENT). Do NOT exclude all of
  // `.next` — that drops the Turbopack SSR runtime chunks the standalone server
  // needs (`chunks/ssr/[turbopack]_runtime.js`). `data` is runtime state.
  outputFileTracingExcludes: {
    "*": ["**/data/**", "**/.next/standalone/**"],
  },
  // Force the full `@swc/helpers` package (including its `esm/` build) into the
  // standalone output. Next's file tracing otherwise copies only the `cjs/`
  // variant, but the standalone `require-hook` resolves the ESM entry
  // (`esm/_interop_require_default.js`), crashing the container at startup.
  // Relies on `nodeLinker: hoisted` (pnpm-workspace.yaml) so the package lives
  // at top-level `node_modules`. See vercel/next.js#48017, #65636, #50072.
  outputFileTracingIncludes: {
    "*": ["./node_modules/@swc/helpers/**/*"],
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
