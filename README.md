# bumpy-road-to-universal-javascript

Example repository for my talk "The bumpy road to Universal JavaScript".

## Story

### [stage-1-csr-only](stage-1-csr-only)

1.  A client wants a website from you and sends you the requirements
1.  The website's title is "Random Fox"
1.  As a user, I want to see a random image of a fox for every reload
1.  As a fox, I would like to feel comfortable and live in my natural habitat
1.  You create a React single-page app, finish the project and move on
1.  One day later the client calls you and says that the image is taking ages to load on their smartphone and that Google is just indexing the loading state of the app.
1.  You decide to refactor it to a Universal Web Application

### [stage-2-naive-universal](stage-2-naive-universal)

1.  You split `app/start.js` into `app/start.client.js` `app/start.server.js`
1.  You use hydrate in `app/start.client.js`
1.  You use `renderToString()` in `app/start.server.js` and rewrite it to a function
1.  You rewrite `app/index.html` to `app/index.html.js` which uses template strings
1.  You realize the module system mismatch (CJS in node vs. ES2015 in webpack)
1.  To overcome this, you use [babel-node](https://github.com/babel/babel/tree/master/packages/babel-node)
1.  You deliberately ignore the hint on [not for production use](https://babeljs.io/docs/usage/cli/#babel-node))
1.  You add `BABEL_ENV` flag in `.babelrc.js` to activate different plugins based on the target
1.  You realize that you also need something for the webpack loaders, [file-loader](https://github.com/webpack-contrib/file-loader) in our case (there is a [babel-plugin-webpack-loaders](https://github.com/istarkov/babel-plugin-webpack-loaders) but it doesn't work with babel 7 yet)
1.  You add [babel-plugin-file-loader](https://github.com/sheerun/babel-plugin-file-loader) (and duplicate config from `webpack.config.js`)
1.  Now it works, but the server console is printing a funny error message
1.  You realize that `componentWillMount()` is called on the server _and_ on the client
1.  You also realize that the server output is the loading state, not the final state. Rendering is synchronous, fetching is asynchronous.
1.  You realize that server-side rendering needs to be done in two phases currently: An asychronous data fetching phase and a synchronous rendering phase
1.  React Fiber's suspense API could help, but the API from Dan Abramov's talk is not ready yet.
1.  You think of two possible solutions:
    * Not using component hooks, but static hooks ([Next.js](https://nextjs.org/) style) or functions entirely decoupled from the component. This is hard.
    * Using `componentDidMount()` (only called on the client) and live with poor server-side rendering.

### [stage-3-client-server-bundles](stage-3-client-server-bundles)

1.  You don't want poor server-side rendering (no SEO and no performance advantage). You're also not satisfied with the babel-node approach.
1.  You bundle the client and server code with webpack: You could either use multi compiler mode (two configs in an array) or do two separate webpack compilations. There are different pros and cons but you remember that both compilations shouldn't deviate too much since the client and the server need to produce the same render output.
1.  You choose the multi compiler mode because of faster builds
1.  You give the entries names so that webpack produces two different chunks
1.  You set `libraryTarget` to `"commonjs2"` for the node build
1.  You use [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) to tell webpack that it should not bundle `node_modules` for node. Although that's currently not necessary.
1.  You wonder where to put the `index.html.js`? Feels like it belongs to the app, but it's not part of any bundle. So you need to use CJS here.
1.  You put it into `server` for now and rewrite it to CJS
1.  Import the server bundle. You realize that this is a key point in the application: the server needs to import the server bundle somewhere. That's why you configured it to be `"commonjs2"`.
1.  You use the `default` export since `app/start.server.js` is a ESM.
1.  You change `<script src="/static/main.js"></script>` to `<script src="/static/client.js"></script>` in `server/index.html.js`

### [stage-4-actual-ssr](stage-4-actual-ssr)

1.  You realize that we need to extract the data loading from the life-cycle hook of the component
1.  One approach is to create a static async function on the component (like Next.js' `getInitialProps`)
1.  These data loading functions usually require data from the `req`, such as URL or query parameters. Since we can't depend on env specific objects here, we need to introduce an abstraction. We can use node's request object as blueprint though.
1.  You refactor `App` component so that you're using `props` instead of `state`
1.  You call `getInitialProps` in `app/start.server.js` and then render `App`
1.  You realize that `server/index.html.js` needs to be async now
1.  You also realize that we're blocking the whole request just to wait for the app. You could already send out all the static parts like stylesheets or the client bundle.
1.  You could use [HTTP/2 server push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push) for that. Google engineers recommend to ["push just enough resources to fill idle network time"](https://docs.google.com/document/d/1K0NykTXBbbbTlv60t5MyJvXjqKGsCVNYHyLEXIxYMv0/edit).
1.  But you could also:
    * Use streams and
    * Move the script tag into `<head>` and add `defer`
1.  If only there was the possibility to stream a template string... oh wait, there's [stream-template](https://www.npmjs.com/package/stream-template) on npm.
1.  You update `server/start.js` to use `.pipe()`
1.  You pause to cry little tears of joy
1.  But now you're getting an error from node-fetch: `Error: only absolute urls are supported`
1.  You realize that the universal code needs to access our own API. We could move that data loading out of the universal code and treat it as server-only code. But that doesn't scale well when we have multiple pages. Because we wan't our app to also work as a regular single-page app as soon as the hydration finished.
1.  You fix it by using an absolute URL. Yes, your server is doing an HTTP request against itself.
1.  That's ok since your API server could be a totally different server
1.  It could also be fixed with GraphQL and a [SchemaLink](https://www.apollographql.com/docs/link/links/schema.html) instead of a HttpLink
1.  You realize that the client-side code seems to remove the image again
1.  You take a look a the console in development. React logs `Warning: Expected server HTML to contain a matching <p> in <main>.`

### [stage-5-fix-csr](stage-5-fix-csr)

1.  You realize that the client-side `App` is initialized with different props
1.  You refactor `app/start.server` to return the rendered HTML and the preloaded state
1.  You refactor `server/index.html.js` to include the preloaded state in the HTML.
1.  You put the preloaded state after the rendered HTML for performance reasons
1.  You refactor `app/start.client` to use the preloaded state
1.  You realize that you just opened up the possibility for XSS attacks if `__PRELOADED_STATE__` contains user data
1.  You use [serialize-javascript](https://github.com/yahoo/serialize-javascript) which also serializes `Date` and `RegExp` objects properly
1.  Realize that everything is working as expected and live a happy life

### [stage-6-long-term-caching](stage-6-long-term-caching)

1.  You get an angry call around midnight from the client that you're not properly using HTTP caching
1.  You're telling the client that it's just a small configuration and then it'll be done in 5 minutes
1.  You think: since you're already at it, we can also gzip the assets
1.  You add the [connect-gzip-static](https://github.com/pirxpilot/connect-gzip-static) middleware
1.  You add the [compression-webpack-plugin](https://github.com/webpack-contrib/compression-webpack-plugin) to the `web` compilation to compress the output
1.  You configure webpack to use chunk hashes for the `web` output filenames
1.  Everything's working fine but then you realize an error in your browser console: `Uncaught SyntaxError: Unexpected token <`
1.  You realize that the `server/index.html.js` is referencing `<script defer src="/static/client.js"></script>` but the filename has a chunkhash now.
1.  You're thinking about writing a dynamic require that tries to grep `client.*.js`
1.  You remember that webpack gives you stats with all the filenames
1.  You install [webpack-assets-manifest](https://github.com/webdeveric/webpack-assets-manifest)
1.  You require the `manifest.json` inside `server/index.html.js` and render the correct URL

### [stage-7-routing](stage-7-routing)

1.  On the next day you get a call from the client that they now have a lawsuit because they don't have an imprint
1.  The client asks you to add a link to a separate page with the imprint
1.  You create a separate `app/Imprint.js` with the address
1.  You realize that you need a router, but you're too lazy to pick one so you decide to use the good old regex router.
1.  Remember that regexs can be unsafe which means that they can block the event loop on certain input. Don't use unsafe regexs for routing—or use a router.
1.  The router picks the component based on the incoming request
1.  You realize that you also need a 404 NotFound component now
1.  You decide to rename `app/App.js` to `app/Home.js`
1.  You refactor `app/start.server.js` to use the router
1.  You also need to call `getInitialProps` if present
1.  Now you realize: since the router requires the request object, you need to pass the request object through all functions
1.  But you could also refactor the code so that `server/index.html.js` receives a promise of an app instead of creating it—which is what you do
1.  Then you try to compile the app and webpack says: `Module not found: Error: Can't resolve './App.js'`
1.  You realize that `app/start.client.js` is still trying to rehydrate the app using the `App` component
1.  First you think about adding the component to the preloaded state, but then you realize that you can't serialize functions
1.  So you basically got two options:
    * Re-route the request on the client although you already have that information
    * Serialize and deserialize the routing result which means that we have to maintain a map of components because we need to find out which component should be rendered based on the serialized route result.
1.  You decide to use the former one because you don't want to maintain that map
1.  You test the routing and you're pretty satisfied with it

### [stage-8-fix-spa](stage-8-fix-spa)

1.  Just as you're about to turn off the computer, you realize that there is a full page reload between page transitions
1.  You realize that you somehow need to take over the navigation on the client-side as soon as the application is bootstrapped
1.  You decide that you want to intercept all click events that bubble up the DOM tree to check if there were any clicks inside an anchor tag. You also realize that you need to take account for CTRL, ALT, etc. clicks.
1.  You decide to use the small helper library [nanohref](https://github.com/choojs/nanohref) from the Choo framework
1.  Inside the callback from nanohref, you need to:
    * Create a request object
    * `history.pushState()` the request url
    * Map the request to a Component
    * Call `getInitialProps` on the component if present
1.  Then you realize: If `getInitialProps` takes very long (in your case this would be the request for fox images), the user won't get any feedback.
1.  So you decide to do a render first, call `getInitialProps` and then do a render again
1.  You have to admit that `getInitialProps` is not the right term on the client-side, so you rename it to `fetchData` (which is what React Apollo uses by the way).
1.  You realize that there is a potential error: If `fetchData` takes long and there has been a new navigation event in the meantime, the rendering might get out of sync.
1.  You save the current request, so that you can discard the rendering if there has been a newer request.
1.  You also realize that the back button is not working
1.  You know that you have to listen for the `popstate` event
1.  You don't want to call `fetchData` when the back button has been pressed as it would return a random image again
1.  So you decide to serialize the render props using `replaceState` and re-use in the `popstate` event

### [stage-9-code-splitting](stage-9-code-splitting)

1.  You get an angry call from Sean Larkin in the middle of the night telling you that you should code split your app
1.  Code-splitting means that only the relevant code for that particular part of your app is loaded. Typical split points in a web app are routes or modals.
1.  You decide that you want to split the app based on the routes
1.  You know that webpack will create separate chunks (aka files) if it encounters a part of the app that can be loaded asynchronously on demand
1.  So instead of importing the files directly in `app/router.js`, you load the modules on demand using the dynamic `import()` syntax.
1.  You know that `import()` returns the namespace object as also returned by `import * from "..."`. That's why you need to use `await` on the result and then return the default property.
1.  Since [`import()` is only a stage 3 proposal](https://github.com/tc39/proposal-dynamic-import), you need to tell babel how to handle the new syntax. This is done by installing the corresponding [@babel/plugin-syntax-dynamic-import](https://www.npmjs.com/package/@babel/plugin-syntax-dynamic-import).
1.  You recognize in webpack's output that it's producing multiple files, called `0.js`, `1.js` and `2.js`. In order to get more readable filenames, you use webpack's magic chunk name comment inside the `import()` expression.
1.  Inside `app/start.server.js` and `app/start.client.js` you now need to `await` the router result
1.  In order to show something to the user while the chunk is loading, you need to add a generic `Loading` component which is rendered when a navigation event happens
1.  This makes the `app/start.client.js` considerably more complex because you also need to add the request check for all async calls again
1.  You also notice that this check is also necessary in the `popstate` event since the user could have done a hard reload and then hit the back button
1.  You realize that colocating data fetching with the displaying component is not ideal because then chunk loading and data fetching needs to be done sequentially
1.  But putting data fetching into the entry chunk is also not ideal because it makes it bigger
1.  You decide to live with the current trade-off

### [stage-10-route-preload](stage-10-route-preload)

1.  Looking into the network tab, you realize that the chunk loading happens sequentially because the `import()` call for the route chunk is inside the initial chunk.
1.  You refactor `app/router.js` so that it also returns the route `routeName` (which should match the `chunkName`).
1.  You add the `routeName` to the `app` object that is returned by `app/start.server.js`
1.  You add an `includeRouteChunk` function to `server/index.html.js` which waits until the `routeName` has resolved. Then it adds the script tag for the route chunk.
1.  You open the network tab and see that the chunks are now loading in parallel
1.  The fox is happy, the customer is happy, and Sean Larkin is happy: Everyone is happy.