import React from "react";
import ReactDOM from "react-dom";
import nanohref from "nanohref";
import router from "./router.js";

const state = window.__PRELOADED_STATE__;
const req = {
  url: location.pathname
};
const Component = router(req);
let currentReq = req;

ReactDOM.hydrate(<Component {...state.initialProps} />, document.getElementById("app"));

nanohref(async location => {
  const req = {
    url: location.pathname
  };
  const Component = router(req);

  currentReq = req;
  ReactDOM.render(<Component />, document.getElementById("app"));
  history.pushState(null, null, req.url);

  if ("fetchData" in Component) {
    const newProps = await Component.fetchData();

    if (req === currentReq) {
      ReactDOM.render(<Component {...newProps} />, document.getElementById("app"));
    }
  }
});
