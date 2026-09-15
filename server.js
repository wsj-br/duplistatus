performance.mark('next-start');
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import module from 'node:module'
const require = module.createRequire(import.meta.url)
const __dirname = fileURLToPath(new URL('.', import.meta.url))


const dir = path.join(__dirname)

process.env.NODE_ENV = 'production'
process.chdir(__dirname)

const currentPort = parseInt(process.env.PORT, 10) || 3000
const hostname = process.env.HOSTNAME || '0.0.0.0'

let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10)
const nextConfig = {"env":{"NEXT_PUBLIC_APP_VERSION":"1.5.0"},"typescript":{"ignoreBuildErrors":false},"typedRoutes":false,"distDir":"./.next","cleanDistDir":true,"assetPrefix":"","cacheMaxMemorySize":52428800,"configOrigin":"next.config.ts","useFileSystemPublicRoutes":true,"generateEtags":true,"pageExtensions":["ts","tsx","js","jsx","md","mdx"],"instrumentationClientInject":[],"poweredByHeader":true,"compress":true,"images":{"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","loaderFile":"","domains":[],"disableStaticImages":false,"minimumCacheTTL":14400,"formats":["image/webp"],"maximumRedirects":3,"maximumResponseBody":50000000,"dangerouslyAllowLocalIP":false,"dangerouslyAllowSVG":false,"contentSecurityPolicy":"script-src 'none'; frame-src 'none'; sandbox;","contentDispositionType":"attachment","localPatterns":[{"pathname":"**","search":""}],"remotePatterns":[{"protocol":"https","hostname":"picsum.photos","port":"","pathname":"/**"}],"qualities":[75],"unoptimized":false,"customCacheHandler":false},"devIndicators":false,"onDemandEntries":{"maxInactiveAge":60000,"pagesBufferLength":5},"basePath":"","sassOptions":{},"trailingSlash":false,"i18n":null,"productionBrowserSourceMaps":false,"excludeDefaultMomentLocales":true,"reactProductionProfiling":false,"reactStrictMode":null,"reactMaxHeadersLength":6000,"httpAgentOptions":{"keepAlive":true},"logging":{"serverFunctions":true,"browserToTerminal":"warn"},"compiler":{},"expireTime":31536000,"staticPageGenerationTimeout":60,"output":"standalone","modularizeImports":{"@mui/icons-material":{"transform":"@mui/icons-material/{{member}}"},"lodash":{"transform":"lodash/{{member}}"}},"outputFileTracingRoot":"/home/wsj/src/duplistatus","allowedDevOrigins":["127.0.0.1","192.168.1.20","g5-server"],"enablePrerenderSourceMaps":true,"cacheComponents":false,"cacheLife":{"default":{"stale":300,"revalidate":900,"expire":4294967294},"seconds":{"stale":30,"revalidate":1,"expire":60},"minutes":{"stale":300,"revalidate":60,"expire":3600},"hours":{"stale":300,"revalidate":3600,"expire":86400},"days":{"stale":300,"revalidate":86400,"expire":604800},"weeks":{"stale":300,"revalidate":604800,"expire":2592000},"max":{"stale":300,"revalidate":2592000,"expire":31536000}},"cacheHandlers":{},"experimental":{"appNewScrollHandler":true,"coldCacheBadge":false,"devValidationWorker":true,"useSkewCookie":false,"cssChunking":true,"multiZoneDraftMode":false,"appNavFailHandling":false,"prerenderEarlyExit":true,"serverMinification":true,"linkNoTouchStart":false,"caseSensitiveRoutes":false,"cachedNavigations":false,"dynamicOnHover":false,"useOffline":false,"varyParams":true,"optimisticRouting":true,"instrumentationClientRouterTransitionEvents":false,"prefetchInlining":{"maxSize":2048,"maxBundleSize":10240},"preloadEntriesOnStart":true,"clientRouterFilter":true,"clientRouterFilterRedirects":false,"fetchCacheKeyPrefix":"","proxyPrefetch":"flexible","optimisticClientCache":true,"manualClientBasePath":false,"cpus":11,"memoryBasedWorkersCount":false,"imgOptConcurrency":null,"imgOptOperationCache":null,"imgOptTimeoutInSeconds":7,"imgOptMaxInputPixels":268402689,"imgOptSequentialRead":null,"isrFlushToDisk":true,"workerThreads":false,"optimizeCss":false,"nextScriptWorkers":false,"scrollRestoration":false,"externalDir":false,"devMemoryThresholdRestart":true,"disableOptimizedLoading":false,"gzipSize":true,"craCompat":false,"esmExternals":true,"fullySpecified":false,"swcTraceProfiling":false,"forceSwcTransforms":false,"requestInsights":false,"largePageDataBytes":128000,"typedEnv":false,"parallelServerCompiles":false,"parallelServerBuildTraces":false,"ppr":false,"authInterrupts":false,"webpackMemoryOptimizations":false,"optimizeServerReact":true,"strictRouteTypes":false,"useTypeScriptCli":true,"removeUncaughtErrorAndRejectionListeners":false,"validateRSCRequestHeaders":true,"staleTimes":{"dynamic":0,"static":300},"reactDebugChannel":true,"serverComponentsHmrCache":true,"serverComponentsHmrCancellation":false,"staticGenerationMaxConcurrency":8,"staticGenerationMinPagesPerWorker":25,"transitionIndicator":false,"gestureTransition":false,"inlineCss":false,"useCache":false,"globalNotFound":false,"browserDebugInfoInTerminal":"warn","lockDistDir":true,"proxyClientMaxBodySize":10485760,"hideLogsAfterAbort":false,"mcpServer":true,"turbopackFileSystemCacheForDev":true,"turbopackFileSystemCacheForBuild":true,"turbopackInferModuleSideEffects":true,"turbopackPluginRuntimeStrategy":"childProcesses","optimizePackageImports":["@radix-ui/react-icons","lucide-react","date-fns","lodash-es","ramda","antd","react-bootstrap","ahooks","@ant-design/icons","@headlessui/react","@headlessui-float/react","@heroicons/react/20/solid","@heroicons/react/24/solid","@heroicons/react/24/outline","@visx/visx","@tremor/react","rxjs","@mui/material","@mui/icons-material","recharts","react-use","effect","@effect/schema","@effect/platform","@effect/platform-node","@effect/platform-browser","@effect/platform-bun","@effect/sql","@effect/sql-mssql","@effect/sql-mysql2","@effect/sql-pg","@effect/sql-sqlite-node","@effect/sql-sqlite-bun","@effect/sql-sqlite-wasm","@effect/sql-sqlite-react-native","@effect/rpc","@effect/rpc-http","@effect/typeclass","@effect/experimental","@effect/opentelemetry","@material-ui/core","@material-ui/icons","@tabler/icons-react","mui-core","react-icons/ai","react-icons/bi","react-icons/bs","react-icons/cg","react-icons/ci","react-icons/di","react-icons/fa","react-icons/fa6","react-icons/fc","react-icons/fi","react-icons/gi","react-icons/go","react-icons/gr","react-icons/hi","react-icons/hi2","react-icons/im","react-icons/io","react-icons/io5","react-icons/lia","react-icons/lib","react-icons/lu","react-icons/md","react-icons/pi","react-icons/ri","react-icons/rx","react-icons/si","react-icons/sl","react-icons/tb","react-icons/tfi","react-icons/ti","react-icons/vsc","react-icons/wi"],"turbopackMemoryEvictionMode":"auto","useCacheTimeout":54,"instantInsights":{"validationLevel":"warning"},"trustHostHeader":false,"isExperimentalCompile":false},"htmlLimitedBots":"[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight","bundlePagesRouterDependencies":false,"configFileName":"next.config.ts","turbopack":{"root":"/home/wsj/src/duplistatus"},"outputFileTracingExcludes":{"*":["**/data/**","**/.next/standalone/**","**/node_modules/webpack/**","**/node_modules/webpack-sources/**","**/node_modules/minimizer-webpack-plugin/**","**/node_modules/@swc/core/**","**/node_modules/@swc/core-*/**","**/node_modules/@swc/html/**","**/node_modules/@swc/html-*/**","**/node_modules/@esbuild/**","**/node_modules/esbuild/**","**/node_modules/terser/**","**/node_modules/html-minifier-terser/**","**/node_modules/svgo/**","**/node_modules/csso/**","**/node_modules/clean-css/**","**/node_modules/css-tree/**","**/node_modules/mdn-data/**","**/node_modules/better-sqlite3/prebuilds/darwin-*","**/node_modules/better-sqlite3/prebuilds/win32-*","**/node_modules/@swc/helpers/src/**","**/node_modules/@swc/helpers/scripts/**"]},"outputFileTracingIncludes":{"*":["./node_modules/@swc/helpers/**/*"]},"repoRoot":"/home/wsj/src/duplistatus","distDirRoot":".next","supportsImmutableAssets":false}

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)

require('next')
const { startServer } = require('next/dist/server/lib/start-server')

if (
  Number.isNaN(keepAliveTimeout) ||
  !Number.isFinite(keepAliveTimeout) ||
  keepAliveTimeout < 0
) {
  keepAliveTimeout = undefined
}

startServer({
  dir,
  isDev: false,
  config: nextConfig,
  hostname,
  port: currentPort,
  allowRetry: false,
  keepAliveTimeout,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});