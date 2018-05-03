"use strict";

const path = require("path");
const nodeExternals = require("webpack-node-externals");

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
    entry: {
      client: path.resolve(__dirname, "app", "start.client.js")
    }
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
