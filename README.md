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
1.  You tell the client that the problem will "probably be fixed in half an hour"

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
1.  React Fiber's suspense API could help. You [`import { createFetcher } from "future"`](https://blog.usejournal.com/notes-from-dan-abramovs-beyond-react-16-talk-5861a92dcdce) but nothing happens. Then you realize that the API from Dan Abramov's talk is not ready yet.
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
1.  You wonder where to put the `index.html.js`? Feels like it belongs to the app, but it's not part of any bundle. So you need to use CJS here. You could also move it into the `App` component but as soon as there are third-party scripts that mess with the `<body>` element, React will get confused.
1.  You put it into `server` for now and rewrite it to CJS
1.  Import the server bundle. You realize that this is a key point in the application: the server needs to import the server bundle somewhere. That's why you configured it to be `"commonjs2"`.
1.  You use the `default` export since `app/start.server.js` is a ESM.
1.  You change `<script src="/static/main.js"></script>` to `<script src="/static/client.js"></script>` in `server/index.html.js`

### [stage-4-actual-ssr](stage-4-actual-ssr)

1.  You realize that we need to extract the data loading from the life-cycle hook of the component
1.  One approach is to create a static async function on the component (like Next.js' `getInitialProps`)
1.  These data loading functions usually require data from the `req`, such as URL or query parameters. Since we can't depend on env specific objects here, we need to introduce an abstraction. We can use node's request object as blueprint though.
1.  You Refactor `App` component so that you're using `props` instead of `state`
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
1.  You refactor `app/start.server` to return the app instance and the preloaded state
1.  You refactor `server/index.html.js` to include the preloaded state in the HTML.
1.  You put the preloaded state after the rendered HTML for performance reasons
1.  You refactor `app/start.client` to use the preloaded state and fallback to an empty object if not present
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
