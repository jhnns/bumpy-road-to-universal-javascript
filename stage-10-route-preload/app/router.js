export default async req => {
  if (/^\/imprint$/.test(req.url)) {
    return {
      routeName: "imprint",
      Component: (await import("./Imprint.js" /* webpackChunkName: "imprint" */)).default
    };
  } else if (/^\/$/.test(req.url)) {
    return {
      routeName: "home",
      Component: (await import("./Home.js" /* webpackChunkName: "home" */)).default
    };
  }
  return {
    routeName: "not-found",
    Component: (await import("./NotFound.js" /* webpackChunkName: "not-found" */)).default
  };
};
