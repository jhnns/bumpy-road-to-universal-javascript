"use strict";

const streamTemplate = require("stream-template");
const serialize = require("serialize-javascript");
const startApp = require("../dist/server.js").default;
const manifest = require("../dist/manifest.json");

async function embedApp() {
  const { app, state } = await startApp();

  return `<div id="app">${app}</div>
<script>
    window.__PRELOADED_STATE__ = ${serialize(state)};
</script>`;
}

module.exports = () => streamTemplate`<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>🦊 Random Fox 🦊</title>
    <style>
        main {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            padding: 10vh;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 2vw;
            text-align: center;
            background-size: cover;
        }

        img {
            max-width: 50vw;
            max-height: 50vh;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        }
    </style>
    <script defer src="/static/${manifest["client.js"]}"></script>
</head>

<body>
    ${embedApp()}
</body>

</html>`;
