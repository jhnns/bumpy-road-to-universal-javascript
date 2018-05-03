"use strict";

const path = require("path");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "app", "start.client.js"),
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
