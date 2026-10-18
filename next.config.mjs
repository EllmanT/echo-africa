import {withSentryConfig} from '@sentry/nextjs';
// Report-Only first: watch the browser console for violations for a week, then rename the header to
// "Content-Security-Policy" to enforce. Allow-list covers GA4, Cal.com booking, Vercel Blob images.
const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.ingest.us.sentry.io",
    "frame-src https://cal.com https://app.cal.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Content-Security-Policy-Report-Only", value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    async headers() {
        return [
            { source: "/:path*", headers: securityHeaders },
            { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
            { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
        ];
    },
    typescript:{
        ignoreBuildErrors:true
    },
    async redirects() {
        return [
            { source: "/blog", destination: "/playbook", permanent: true },
            { source: "/blog/:slug", destination: "/playbook/:slug", permanent: true },
        ];
    },
};

export default nextConfig
// export default withSentryConfig(nextConfig, {
// // For all available options, see:
// // https://github.com/getsentry/sentry-webpack-plugin#options

// // Suppresses source map uploading logs during build
// silent: true,
// org: "echo-africa",
// project: "echo-africa",
// }, {
// // For all available options, see:
// // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// // Upload a larger set of source maps for prettier stack traces (increases build time)
// widenClientFileUpload: true,

// // Transpiles SDK to be compatible with IE11 (increases bundle size)
// transpileClientSDK: true,

// // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// // This can increase your server load as well as your hosting bill.
// // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// // side errors will fail.
// // tunnelRoute: "/monitoring",

// // Hides source maps from generated client bundles
// hideSourceMaps: true,

// // Automatically tree-shake Sentry logger statements to reduce bundle size
// disableLogger: true,

// // Enables automatic instrumentation of Vercel Cron Monitors.
// // See the following for more information:
// // https://docs.sentry.io/product/crons/
// // https://vercel.com/docs/cron-jobs
// automaticVercelMonitors: true,
// });