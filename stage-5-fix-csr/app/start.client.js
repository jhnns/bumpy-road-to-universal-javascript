import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

const { __PRELOADED_STATE__: initialProps = {} } = window;

ReactDOM.hydrate(<App {...initialProps} />, document.getElementById("app"));
