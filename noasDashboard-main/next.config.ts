import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, opts) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        __dirname: JSON.stringify("/"),
        __filename: JSON.stringify("app"),
      })
    );
    return config;
  },
};

export default nextConfig;
