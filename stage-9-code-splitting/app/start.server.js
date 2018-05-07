import React from "react";
import ReactDOMServer from "react-dom/server";
import router from "./router.js";

export default async req => {
  const Component = await router(req);
  const initialProps = "fetchData" in Component ? await Component.fetchData() : {};
  const component = <Component {...initialProps} />;

  return {
    html: ReactDOMServer.renderToString(component),
    state: { initialProps }
  };
};
