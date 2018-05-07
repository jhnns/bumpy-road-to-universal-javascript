import Imprint from "./Imprint.js";
import Home from "./Home.js";
import NotFound from "./NotFound.js";

export default req => {
  let Component = NotFound;

  if (/^\/imprint$/.test(req.url)) {
    Component = Imprint;
  } else if (/^\/$/.test(req.url)) {
    Component = Home;
  }

  return Component;
};
