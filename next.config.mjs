/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: fontFix(),
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

function fontFix() {
  return true;
}

export default nextConfig;
