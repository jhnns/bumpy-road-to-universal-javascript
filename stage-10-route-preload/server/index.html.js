"use strict";

const streamTemplate = require("stream-template");
const serialize = require("serialize-javascript");
const startApp = require("../dist/server.js").default;
const manifest = require("../dist/manifest.json");

async function embedApp(app) {
  const [html, state] = await Promise.all([app.html, app.state]);

  return `<div id="app">${html}</div>
<script>
    window.__PRELOADED_STATE__ = ${serialize(state)};
</script>`;
}

async function includeRouteChunk(app) {
  const routeName = await app.routeName;
  const routeChunk = manifest[routeName + ".js"];

  return `<script defer src="/static/${routeChunk}"></script>`;
}

module.exports = app => streamTemplate`<!doctype html>
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
            padding: 50px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 2vw;
            background-size: cover;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        img {
            max-width: 50vw;
            max-height: 50vh;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            margin-bottom: 25px;
        }

        a {
            color: inherit;
        }
    </style>
    <script defer src="/static/${manifest["client.js"]}"></script>
    ${includeRouteChunk(app)}
</head>

<body>
    ${embedApp(app)}
</body>

</html>`;
