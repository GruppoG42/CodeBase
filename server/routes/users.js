const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const db = require('../script/dbController.js');

/*
 ***************************************ROUTES***************************************
*/
router.get('/myitineraries', requiresAuth(), async function (req, res) {
    res.render('myitineraries', {
        title: 'My itineraries',
        sid: req.oidc.user.sub
    });
});

router.get('/createItinerary', requiresAuth() ,function (req, res) {
    res.render('createItinerary', {
        title: 'Crea itinerario',
        sid: req.oidc.user.sub
    });
});

router.get('/searchItineraries', async function (req, res) {
    res.render('searchItineraries', {
        title: 'Itinerary'
    });
});

router.get('/profile', requiresAuth(), function (req, res) {
    res.render('profile', {
        userProfile: JSON.stringify(req.oidc.user, null, 2),
        title: 'Profile page'
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/login', function (req, res) {
    res.render('login', {
        title: 'Login'
    });
});

module.exports =  router;