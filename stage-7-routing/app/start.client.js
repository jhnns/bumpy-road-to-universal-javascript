import React from "react";
import ReactDOM from "react-dom";
import router from "./router.js";

const state = window.__PRELOADED_STATE__;
const req = { url: location.pathname };
const Component = router(req);

ReactDOM.hydrate(<Component {...state.initialProps} />, document.getElementById("app"));
