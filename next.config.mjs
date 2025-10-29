/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false,
    useLightningcss: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable webpack CSS optimization that uses lightningcss
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Disable lightningcss
    config.resolve.alias = {
      ...config.resolve.alias,
      'lightningcss': false,
      'lightningcss-linux-x64-gnu': false,
      'lightningcss-linux-x64-musl': false,
      '@next/swc-linux-x64-gnu': false,
      '@next/swc-linux-x64-musl': false,
    }
    
    // Find CSS rule and modify it
    config.module.rules.forEach(rule => {
      if (rule.test && rule.test.toString().includes('css')) {
        rule.use = rule.use.map(use => {
          if (typeof use === 'object' && use.loader && use.loader.includes('css-loader')) {
            return {
              ...use,
              options: {
                ...use.options,
                importLoaders: 1
              }
            }
          }
          return use
        })
      }
    })
    
    return config
  }
}

export default nextConfig