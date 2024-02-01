const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const db = require('../script/dbController.js');

/*
 ***************************************ROUTES***************************************
*/
router.get('/myitineraries', async function (req, res) {
    res.render('myitineraries', {
        title: 'My itineraries'
    });
});

router.get('/createItinerary',  function (req, res) {
    res.render('createItinerary', {
        title: 'Crea itinerario'
    });
});

router.get('/profile', requiresAuth(), function (req, res) {
    res.render('profile', {
        userProfile: JSON.stringify(req.oidc.user, null, 2),
        title: 'Profile page'
    });
});

module.exports =  router;