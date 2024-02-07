const http = require('http');
const {app, port, config} = require("./appDeploy.js");

http.createServer(app)
    .listen(port, () => {
        console.log(`Inizializzazione completata. Server in ascolto su: https://tripply.onrender.com`);
    });