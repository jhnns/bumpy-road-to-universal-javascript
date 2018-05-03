# bumpy-road-to-universal-javascript

Example repository for my talk "The bumpy road to Universal JavaScript".

## Steps

### stage-1-csr-only

1.  That's our starting point: A simple single-page app. Rendered on the client-side only.

### stage-2-naive-universal

1.  Split start into start.client start.server
1.  Use hydrate in start.client
1.  Use renderToString() in start.server and rewrite it to a function
1.  Rewrite index.html to index.html.js which uses template strings
1.  Realize module system mismatch (CJS in node vs. ES2015 in webpack)
1.  Use babel-node (ignore hint on [not for production use](https://babeljs.io/docs/usage/cli/#babel-node))
1.  Add `BABEL_ENV` flag in `.babelrc.js` to activate different plugins based on the target
1.  Realize that you also need something for the webpack loaders, file-loader in our case (there is a [babel-plugin-webpack-loaders](https://github.com/istarkov/babel-plugin-webpack-loaders) but it doesn't work with babel 7 yet)
1.  Add [babel-plugin-file-loader](https://github.com/sheerun/babel-plugin-file-loader) (and duplicate config from `webpack.config.js`)
1.  Now it works, but the server console is printing a funny error message: Realize that `componentWillMount()` is called on the server _and_ on the client.
1.  Also realize that the server output is the loading state, not the final state. Rendering is synchronous, fetching is asynchronous. Suspense API could help.
1.  Two possible solutions:
    * Do not use component hooks, but static hooks (Next.js) or functions entirely decoupled from the component. This is hard.
    * Use `componentDidMount()` (only called on the client) and live with poor server-side rendering.

### stage-3-client-server-bundles

1.  Realize that we don't want poor server-side rendering (no SEO and no performance advantage). We're also unsatisfied with the babel-node approach.
1.  Bundle client and server code with webpack: You could either use multi compiler mode (two configs in an array) or do two separate webpack compilations. There are different pros and cons but you should note that both compilations shouldn't deviate too much since the client and the server need to produce the same render output.
1.  Choose the multi compiler mode because of faster builds
1.  Give the entries names so that webpack produces two different chunks
1.  Set libraryTarget to "commonjs2" for the node build
1.  Use [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) to tell webpack that it should not bundle `node_modules` for node
1.  Where do we put the `index.html.js`? Feels like it belongs to the app, but it's not part of any bundle. So we need to use CJS here. We could move it into the `App` component but as soon as we have third-party scripts that mess with the body element, React will get confused.
1.  Put it into `server` for now and rewrite it to CJS
1.  Import the server bundle. That's a key point in the application: the server needs to import the server bundle somewhere. That's why we wanted it to be "commonjs2". Use the `default` export since `start.server.js` is a ESM.
1.  Change `<script src="/static/main.js"></script>` to `<script src="/static/client.js"></script>` in `index.html.js`

### stage-4-actual-ssr

1.  Realize that we need to extract the data loading from the life-cycle hook of the component
1.  One approach is to create a static async function on the component (like Next.js which calls that `getInitialProps`)
1.  These data loading functions usually require data from the `req`, such as URL or query parameters. Since we can't depend on env specific objects here, we need to introduce an abstraction. We can use node's request object as blueprint though.
1.  Refactor `App` component so that we're using `props` instead of `state`
1.  Call `getInitialProps` in `start.server.js` and then render App
1.  Realize that `index.html.js` needs to be async now
1.  Realize that we're blocking the whole request just to wait for the app. We could already send out all the static parts like stylesheets or the client bundle
1.  We could use H2 push for that. Google engineers recommend to ["push just enough resources to fill idle network time"](https://docs.google.com/document/d/1K0NykTXBbbbTlv60t5MyJvXjqKGsCVNYHyLEXIxYMv0/edit)
1.  But we could also:
    * Use streams and
    * Move the script tag and add `defer`
1.  If only there was the possibility to stream a template string... oh wait, there's [stream-template](https://www.npmjs.com/package/stream-template) on npm.
1.  Update `server/start.js` to use `.pipe()` (that's really... beautiful)
1.  Getting an error from node-fetch: `Error: only absolute urls are supported`
1.  Realize that the universal code needs to access our own API. We could move that data loading out of the universal code and treat it as server-only code. But that doesn't scale well when we have multiple pages. Because we wan't our app to also work as a regular single-page app as soon as the hydration finished.
1.  Fix it by using an absolute URL. Yes, our server is doing an HTTP request against itself.
