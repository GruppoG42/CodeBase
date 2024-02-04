const tripplerManager = require("../managers/tripplerManager");
const router = require('express').Router();

/*
 ***************************************ROUTES***************************************
*/

// Index
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Tripply',
        isAuthenticated: req.oidc.isAuthenticated()
    });
});

module.exports =  router;