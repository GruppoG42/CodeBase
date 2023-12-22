const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

/*
 ***************************************ROUTES***************************************
*/
router.get('/myitineraries', requiresAuth(), function (req, res) {
    res.render('myitineraries', {
        title: 'My itineraries'
    });
});

router.get('/createItinerary', requiresAuth(), function (req, res) {
    res.render('createItinerary', {
        title: 'Create'
    });
});

router.get('/profile', requiresAuth(), function (req, res) {
    res.render('profile', {
        userProfile: JSON.stringify(req.oidc.user, null, 2),
        title: 'Profile page'
    });
});

module.exports =  router;