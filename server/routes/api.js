const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

const db = require('../script/dbController.js');

/*
 ***************************************ROUTES***************************************
*/

// Create a new itinerary
router.post('/createItinerary', requiresAuth(), async (req, res) => {
    try {
        const userId = req.oidc.user.sub;
        const itineraryData = req.body;
        const newItinerary = await db.createItinerary({
            ...itineraryData,
            _userId: userId
        });
        res.json(newItinerary);
    } catch (error) {
        console.error('Error creating new itinerary:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get all user itineraries
router.get('/getUserItineraries', requiresAuth() ,async (req, res) => {
    try {
        const userId = req.oidc.user.sub;
        const userItineraries = await db.getUserItineraries(userId);
        res.json(userItineraries);
    } catch (error) {
        console.error('Error fetching user itineraries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get user info
// router.get ('/getUserInfo/', async (req, res) => {
//
// });

module.exports =  router;