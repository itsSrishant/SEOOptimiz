import type { NextConfig } from "next";

// No nonce/proxy setup (see node_modules/next/dist/docs/01-app/02-guides/
// content-security-policy.md) — that requires opting every page into
// dynamic rendering, which would throw away this site's static generation
// for no real gain here. This follows that same doc's "Without Nonces"
// baseline instead: 'unsafe-inline' on script-src is required because the
// App Router's own hydration payload ships as inline <script> tags with no
// nonce attached when none is configured; 'unsafe-eval' is dev-only, for
// React's dev-mode error-stack reconstruction.
const isDev = process.env.NODE_ENV === 'development';
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  // A stray package-lock.json in the home directory makes Turbopack guess the
  // wrong workspace root. Pin it to this project.
  turbopack: { root: import.meta.dirname },

  // Hides the floating dev-tools badge in the corner during `next dev`.
  // It never ships to production, but it sits over the hero while designing.
  devIndicators: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Only meaningful once the site is actually served over HTTPS in
          // production — harmless to send from a plain-HTTP dev server,
          // since browsers ignore Strict-Transport-Security on http://.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
