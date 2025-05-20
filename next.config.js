/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // this tells Next to do a static export into “out/”
  output: 'export',
  // if you’re using next/image for external URLs, allow them here:
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
