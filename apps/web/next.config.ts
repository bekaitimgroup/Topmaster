import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Gzip responses from the Node server. This is the default, but we run
  // standalone behind Railway's proxy — keep it explicit so nobody "cleans
  // it up" assuming the proxy compresses (it doesn't re-compress app bodies).
  compress: true,

  images: {
    // Serve AVIF first, fall back to WebP for older browsers.
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        // Public static assets (logos, icons, fonts). Next only fingerprints
        // /_next/static — files in /public are served under their real names,
        // so we can't use `immutable` here or a logo swap would never reach
        // returning visitors. 7 days + SWR is the safe middle.
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Fingerprinted build assets — content-hashed filenames, safe to
        // cache forever. Next sets this itself for `next start`, but the
        // standalone server behind a proxy has bitten teams before; explicit
        // costs nothing.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
