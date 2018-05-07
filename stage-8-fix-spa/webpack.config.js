"use strict";

const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CompressionPlugin = require("compression-webpack-plugin");
const ManifestPlugin = require("webpack-assets-manifest");

const baseConfig = {
  mode: "production",
  output: {
    publicPath: "/static/"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, "app"),
        use: "babel-loader"
      },
      {
        test: /\.jpg$/,
        use: "file-loader"
      }
    ]
  }
};

module.exports = [
  {
    ...baseConfig,
    target: "web",
    output: {
      ...baseConfig.output,
      filename: "[name].[chunkhash].js"
    },
    entry: {
      client: path.resolve(__dirname, "app", "start.client.js")
    },
    plugins: [new CompressionPlugin(), new ManifestPlugin()]
  },
  {
    ...baseConfig,
    target: "node",
    entry: {
      server: path.resolve(__dirname, "app", "start.server.js")
    },
    output: {
      ...baseConfig.output,
      libraryTarget: "commonjs2"
    },
    externals: [nodeExternals()]
  }
];
