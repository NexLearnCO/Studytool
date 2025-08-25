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
  transpilePackages: [
    'markmap-common',
    'markmap-lib',
    'markmap-view',
    'markmap-html-parser',
  ],
}

export default nextConfig