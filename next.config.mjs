/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.coinpaper.com',
        pathname: '/coinpaper/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/ethereum/**',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
        pathname: '/logos/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.website-files.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.optimism.io',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.arbitrum.io',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
    unoptimized: true
  },
};

export default nextConfig;