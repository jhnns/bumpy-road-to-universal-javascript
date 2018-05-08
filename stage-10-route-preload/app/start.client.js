import React from "react";
import ReactDOM from "react-dom";
import nanohref from "nanohref";
import router from "./router.js";
import Loading from "./Loading";

const state = window.__PRELOADED_STATE__;
let currentReq;
const req = (currentReq = { url: location.pathname });

history.replaceState(state.initialProps, "", req.url);

router(req).then(({ Component }) => {
  if (req !== currentReq) {
    return;
  }
  ReactDOM.hydrate(<Component {...state.initialProps} />, document.getElementById("app"));
});

nanohref(async location => {
  ReactDOM.render(<Loading />, document.getElementById("app"));

  const req = (currentReq = { url: location.pathname });
  const { Component } = await router(req);

  if (req !== currentReq) {
    return;
  }
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

window.addEventListener("popstate", async event => {
  ReactDOM.render(<Loading />, document.getElementById("app"));

  const req = (currentReq = { url: location.pathname });
  const { Component } = await router(req);

  if (req !== currentReq) {
    return;
  }
  ReactDOM.render(<Component {...event.state} />, document.getElementById("app"));
});
