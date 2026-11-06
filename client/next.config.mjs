import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: clientRoot,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server-mu-seven-27.vercel.app/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://server-mu-seven-27.vercel.app/api/:path*',
      },
      {
        source: '/health',
        destination: 'https://server-mu-seven-27.vercel.app/health',
      },
      {
        source: '/metrics',
        destination: 'https://server-mu-seven-27.vercel.app/metrics',
      },
    ];
  },
};

export default nextConfig;
