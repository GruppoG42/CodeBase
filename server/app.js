// Load environment variables
require("./loadEnvironment.js");

const express = require('express')
const path = require('path');

const logger = require('morgan');
const { auth } = require('express-openid-connect');

// Routes
const usersRouting = require("./routes/users.js");
const indexRouting = require("./routes/index.js");
const apiRouting = require("./routes/api.js");

const app = express()

// Set views and views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
};

const port = process.env.PORT || 3000;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
    config.baseURL = `http://localhost:${port}`;
}

app.use(auth(config));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
});

// Load routes
app.use('/', indexRouting);
app.use('/', usersRouting);
app.use('/api', apiRouting);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: process.env.NODE_ENV !== 'production' ? err : {}
    });
});

module.exports = {app, port, config};