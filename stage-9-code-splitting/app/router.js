export default async req => {
  if (/^\/imprint$/.test(req.url)) {
    return (await import("./Imprint.js" /* webpackChunkName: "imprint" */)).default;
  } else if (/^\/$/.test(req.url)) {
    return (await import("./Home.js" /* webpackChunkName: "home" */)).default;
  }
  return (await import("./NotFound.js" /* webpackChunkName: "not-found" */)).default;
};
