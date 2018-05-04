import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App.js";

export default async () => {
  const initialProps = await App.getInitialProps();
  const app = <App {...initialProps} />;

  return {
    app: ReactDOMServer.renderToString(app),
    state: initialProps
  };
};
