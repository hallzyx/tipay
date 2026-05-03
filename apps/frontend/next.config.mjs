/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Suppress "Critical dependency" warnings from sodium-native / require-addon
    // These are harmless in browser context (Stellar SDK falls back to wasm)
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    config.module.unknownContextCritical = false;

    return config;
  },
};

export default nextConfig;
