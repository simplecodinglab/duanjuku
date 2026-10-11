const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 注：部署到 Cloudflare Workers 走 @opennextjs/cloudflare，
  // 不要加 output: "standalone"，由 adapter 处理输出。
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pstatic.xiaozi.cc",
        port: "",
        pathname: "/covers/**",
      },
      {
        protocol: "https",
        hostname: "cdn1.cdn-telegram.org",
        port: "",
        pathname: "/file/**",
      },
      {
        protocol: "https",
        hostname: "cdn5.cdn-telegram.org",
        port: "",
        pathname: "/file/**",
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
