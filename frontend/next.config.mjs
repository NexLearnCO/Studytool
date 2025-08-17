/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // BlockNote 不兼容 React 19 / Next 15 StrictMode
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig