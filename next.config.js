/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Keep Chromium + puppeteer-core out of the bundle so native binaries resolve correctly.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // @sparticuz/chromium loads brotli-packed binaries from node_modules/.../bin at runtime;
  // tracing often misses them, which breaks PDF on Vercel/Lambda (/var/task/...).
  outputFileTracingIncludes: {
    "/api/generate-pdf": [
      "./node_modules/@sparticuz/chromium/**/*",
    ],
  },
}

module.exports = nextConfig