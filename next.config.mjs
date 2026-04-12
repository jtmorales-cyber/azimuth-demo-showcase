/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for kiosk deployment — generates `out/` directory
  // that can be served from USB drive, local static server, or Vercel.
  // Compatible with: next/dynamic (ssr: false), next/font/google, client components
  // Incompatible with: API routes, middleware, Image Optimization (disabled below)
  output: 'export',

  // Next.js Image Optimization requires a server — disable for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes match static server expectations (e.g. `/about/` → `/about/index.html`)
  trailingSlash: true,

  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
  ],

  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
