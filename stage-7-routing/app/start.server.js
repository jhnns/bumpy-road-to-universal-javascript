import React from "react";
import ReactDOMServer from "react-dom/server";
import router from "./router.js";

export default async req => {
  const Component = router(req);
  const initialProps = "getInitialProps" in Component ? await Component.getInitialProps() : {};
  const component = <Component {...initialProps} />;

  return {
    html: ReactDOMServer.renderToString(component),
    state: { initialProps }
  };
};
