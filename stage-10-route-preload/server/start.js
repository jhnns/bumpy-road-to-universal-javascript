"use strict";

require("isomorphic-fetch");
const express = require("express");
const fs = require("fs");
const connectGzipStatic = require("connect-gzip-static");
const startApp = require("../dist/server.js").default;
const indexHtml = require("./index.html.js");

const RANDOM_FOX_URL = "https://randomfox.ca/floof/";
const STATIC_MAX_AGE = 365 * 24 * 60 * 60 * 1000;
const app = express();

app.get("/api/fox", async (req, res) => {
  const response = await fetch(RANDOM_FOX_URL);
  res.send(await response.json());
});
app.use(
  "/static",
  connectGzipStatic("dist", {
    maxAge: STATIC_MAX_AGE
  })
);
app.get("/*", (req, res) => {
  indexHtml(startApp(req)).pipe(res);
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
