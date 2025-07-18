import type {NextConfig} from 'next';

import { version } from './package.json';


const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.*', '192.168.1.20'],
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
