import React from "react";
import ReactDOMServer from "react-dom/server";
import router from "./router.js";

export default req => {
  const routePromise = router(req);
  const routeNamePromise = routePromise.then(route => route.routeName);
  const componentPromise = routePromise.then(route => route.Component);
  const initialPropsPromise = componentPromise.then(Component => ("fetchData" in Component ? Component.fetchData() : {}));
  const htmlPromise = Promise.all([componentPromise, initialPropsPromise]).then(([Component, initialProps]) => ReactDOMServer.renderToString(<Component {...initialProps} />));
  const statePromise = initialPropsPromise.then(initialProps => ({
    initialProps
  }));

  return {
    routeName: routeNamePromise,
    html: htmlPromise,
    state: statePromise
  };
};
