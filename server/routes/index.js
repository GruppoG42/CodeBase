const tripplerManager = require("../managers/tripplerManager");
const router = require('express').Router();

/*
 ***************************************ROUTES***************************************
*/

// Index
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Auth0 Webapp sample Nodejs',
        isAuthenticated: checkUser(req)
        //isAuthenticated: req.oidc.isAuthenticated()
    });
});

function checkUser(req) {
    try {
        const userId = req.header('userId');
        return tripplerManager.checkUser(userId);
    } catch (error) {
        return false;
    }
}

module.exports =  router;