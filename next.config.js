const { version } = require("./package.json");
const { format } = require("date-fns");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",
  images: { unoptimized: true },
  reactStrictMode: false,
  trailingSlash: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{ loader: "@svgr/webpack", options: { icon: "100%" } }],
    });
    return config;
  },
  env: {
    version: `v${version}#${format(new Date(), "yyyyMMdd-HHmmss")}`,
  },
};

module.exports = nextConfig;
