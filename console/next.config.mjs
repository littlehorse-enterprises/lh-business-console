/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  ...(process.env.LH_FORM_BUILDER_DEMO === "1" ? { devIndicators: false } : {}),
  serverExternalPackages: ["@opentelemetry/instrumentation"],
  env: {
    NEXT_PUBLIC_API_CLIENT_VERSION: "v0.0.0-dev",
  },
};
export default nextConfig;
