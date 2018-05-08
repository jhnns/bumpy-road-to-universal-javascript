import React from "react";
import ReactDOM from "react-dom";
import nanohref from "nanohref";
import router from "./router.js";

const state = window.__PRELOADED_STATE__;
let currentReq;
const req = (currentReq = { url: location.pathname });
const Component = router(req);

history.replaceState(state.initialProps, "", req.url);
ReactDOM.hydrate(<Component {...state.initialProps} />, document.getElementById("app"));

nanohref(async location => {
  const req = (currentReq = { url: location.pathname });
  const Component = router(req);

  ReactDOM.render(<Component />, document.getElementById("app"));
  history.pushState(null, "", req.url);

  if ("fetchData" in Component) {
    const newProps = await Component.fetchData();

    if (req !== currentReq) {
      return;
    }
    history.replaceState(newProps, "", req.url);
    ReactDOM.render(<Component {...newProps} />, document.getElementById("app"));
  }
});

window.addEventListener("popstate", event => {
  const req = (currentReq = { url: location.pathname });
  const Component = router(req);

  ReactDOM.render(<Component {...event.state} />, document.getElementById("app"));
});
