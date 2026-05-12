import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, opts) => {
    // Access webpack from opts if available
    const webpack = opts.webpack;
    if (webpack) {
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify("/"),
          __filename: JSON.stringify("app"),
        })
      );
    }
    return config;
  },
};

export default nextConfig;
