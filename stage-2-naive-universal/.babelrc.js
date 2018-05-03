"use strict";

const path = require("path");
const IS_NODE = process.env.BABEL_ENV === "node";

module.exports = {
  presets: (IS_NODE
    ? [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "current"
            }
          }
        ]
      ]
    : []
  ).concat("@babel/preset-react"),
  plugins: IS_NODE
    ? [
        [
          "babel-plugin-file-loader",
          {
            outputPath: "../dist",
            publicPath: "/static"
          }
        ]
      ]
    : []
};
