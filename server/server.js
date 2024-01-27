const http = require('http');
const {app, port, config} = require("./app.js");

http.createServer(app)
    .listen(port, () => {
        console.log(`Listening on ${config.baseURL}`);
    });