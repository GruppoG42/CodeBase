// Load environment variables
require("./loadEnvironment.js");

const express = require('express')
const path = require('path');
const router = express.Router();


const logger = require('morgan');
const {auth} = require('express-openid-connect');

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
    clientSecret: process.env.SECRET,
    baseURL: "https://tripply.onrender.com",
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    authorizationParams: {
        response_type: "code",
        scope: "openid profile email",
        redirect_uri: "https://tripply.onrender.com/callback",
    },
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
app.use(express.json());

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const bodyParser = require("body-parser");

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Itinerary API',
            description: 'Itinerary API Information',
            contact: {
                name: 'Developer'
            },
            servers: ['http://localhost:3000']
        }
    },
    apis: ['./routes/users.js', './routes/index.js', `${__dirname}/routes/api.js`]
    // apis: ['**/*.js'],
};

function initialize(app) {
    const swaggerDocs = swaggerJsdoc(swaggerOptions);
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
            explorer: true,
            customCssUrl:
                "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
        })
    );
    console.log("Swagger initialized");
}

initialize(app);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found - ' + req.originalUrl);
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