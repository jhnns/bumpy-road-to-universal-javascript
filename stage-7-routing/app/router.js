import Imprint from "./Imprint.js";
import Home from "./Home.js";
import NotFound from "./NotFound.js";

export default req => {
  if (/^\/imprint$/.test(req.url)) {
    return Imprint;
  } else if (/^\/$/.test(req.url)) {
    return Home;
  }

  return NotFound;
};
