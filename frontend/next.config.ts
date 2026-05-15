import type { NextConfig } from "next";

const KEYCLOAK_BASE = process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL ?? "http://localhost:8180";

// Content-Security-Policy:
//  - default-src 'self' locks everything down by default.
//  - style-src 'unsafe-inline' is required by Next's runtime style injection; script-src
//    stays strict.
//  - img-src allows TMDB posters + data: (Next/Image inlines tiny placeholders).
//  - connect-src 'self' covers the BFF proxy; Keycloak is reached server-side from
//    route handlers, so it doesn't need to be in connect-src.
//  - form-action allows POSTs to the IdP for the few flows that use form-based posts;
//    same-origin POSTs (logout) are covered by 'self'.
//  - frame-ancestors 'none' + X-Frame-Options DENY: clickjacking off.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://image.tmdb.org data:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  `form-action 'self' ${KEYCLOAK_BASE}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
