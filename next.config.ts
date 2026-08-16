import type { NextConfig } from 'next'
import { IMAGE_HOSTS } from './src/lib/image-hosts'

// Node's global fetch ignores HTTP(S)_PROXY unless this flag is set, which makes
// the image optimizer and the upstream API calls time out behind a VPN or
// corporate proxy. No-op when no proxy is configured.
if ((process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY) && !process.env.NODE_USE_ENV_PROXY) {
  process.env.NODE_USE_ENV_PROXY = '1'
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: IMAGE_HOSTS.map((host) => ({
      protocol: 'https' as const,
      hostname: host.hostname,
      pathname: host.pathname,
    })),
    // Two steps is all the UI needs; every extra entry widens the optimizer surface.
    qualities: [70, 85],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Ships only the helpers actually imported instead of the barrel file.
    optimizePackageImports: ['framer-motion'],
  },
}

export default nextConfig
