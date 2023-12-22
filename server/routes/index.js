const router = require('express').Router();

/*
 ***************************************ROUTES***************************************
*/

// Index
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Auth0 Webapp sample Nodejs',
        isAuthenticated: req.oidc.isAuthenticated()
    });
});

module.exports =  router;