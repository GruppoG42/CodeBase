const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

/*
 ***************************************ROUTES***************************************
*/
router.get('/Home', requiresAuth(), async function (req, res) {
    res.render('itineraries', {
        title: 'Home',
        sid: req.oidc.user.sub
    });
})

router.get('/myitineraries', requiresAuth(), async function (req, res) {
    res.render('myitineraries', {
        title: 'My itineraries',
        sid: req.oidc.user.sub
    });
});

router.get('/saved', requiresAuth(), async function (req, res) {
    res.render('saved', {
        title: 'Saved itineraries',
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
        title: 'Profile page',
        sid: req.oidc.user.sub
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