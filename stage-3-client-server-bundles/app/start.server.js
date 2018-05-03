import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App.js";

export default () => ReactDOMServer.renderToString(<App />);
