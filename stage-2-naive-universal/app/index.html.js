import startApp from "./start.server";

export default () => `<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>🦊 Random Fox 🦊</title>
    <style>
        main {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            padding: 50px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 2vw;
            background-size: cover;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        img {
            max-width: 50vw;
            max-height: 50vh;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            margin-bottom: 25px;
        }

        a {
            color: inherit;
        }
    </style>
</head>

<body>
    <div id="app">${startApp()}</div>
    <script src="/static/main.js"></script>
</body>

</html>`;
