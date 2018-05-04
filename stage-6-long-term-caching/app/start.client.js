import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

const state = window.__PRELOADED_STATE__;

ReactDOM.hydrate(<App {...state.initialProps} />, document.getElementById("app"));
