/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Nonaktifkan double-render dev mode untuk performa lebih cepat
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
    ],
  },
  // Kompresi respons
  compress: true,
  // Cache header yang optimal
  poweredByHeader: false,
};

export default nextConfig;
