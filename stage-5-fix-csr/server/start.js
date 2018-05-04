"use strict";

require("isomorphic-fetch");
const express = require("express");
const fs = require("fs");
const indexHtml = require("./index.html.js");

const RANDOM_FOX_URL = "https://randomfox.ca/floof/";
const app = express();

app.get("/api/fox", async (req, res) => {
  const response = await fetch(RANDOM_FOX_URL);
  res.send(await response.json());
});
app.use("/static", express.static("dist"));
app.get("/*", (req, res) => {
  indexHtml().pipe(res);
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
