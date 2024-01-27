const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');

const db = require('../script/dbController.js');
const itinerarioManager = require('../managers/itinerarioManager.js');
const giornoManager = require('../managers/giornoManager.js');
const tappaManager = require('../managers/tappaManager.js');
const tripplerManager = require('../managers/tripplerManager.js');

/*
 ***************************************ROUTES***************************************
*/

router.post('/createUser', async (req, res) => {
    //nome, cognome, email
    //output id
    try {
        const userData = req.body;
        const nome = userData.nome;
        const cognome = userData.cognome;
        const email = userData.email;
        if (!nome || !cognome || !email) {
            res.status(400).send('Bad Request ' + userData.nome);
            return;
        }
        const newUser = tripplerManager.createUser(nome, cognome, email);
        res.json(newUser);
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Create a new itinerary
router.post('/createItinerary', async (req, res) => {
    try {
        if(!await checkUser(req)) {
            res.status(401).send('Unauthorized');
            return;
        }
        const userId = req.header('userId')
        const nome = req.body.nome;
        const stato = req.body.stato;
        const giorni = req.body.giorni;
        const recensioni = req.body.recensioni;
        const descrizione = req.body.descrizione;
        const attivo = req.body.attivo;
        if (!nome || !stato || !giorni || !recensioni || !descrizione || !attivo) {
            res.status(400).send('Bad Request');
            return;
        }
        const itineraryData = {
            nome,
            stato,
            giorni,
            recensioni,
            descrizione,
            attivo
        };
        const newItinerary = await itinerarioManager.createItinerary({
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
router.get('/getUserItineraries',async (req, res) => {
// router.get('/getUserItineraries',async (req, res) => {
    try {
        if(!await checkUser(req)) {
            res.status(401).send('Unauthorized');
            return;
        }
        const userId = req.header('userId');
        const userItineraries = itinerarioManager.getUserItineraries(userId);
        res.json(userItineraries);
        res.status(200)
    } catch (error) {
        console.error('Error fetching user itineraries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Get from Google Maps API the streets from a String (address)
router.get('/searchStreet', async (req, res) => {
    try {
        const address = req.query.address;
        res.json({
            streets: ["Result 1","Result 2", address]
        });
    } catch (error) {
        console.error('Error fetching streets:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function checkUser(req) {
    try {
        const userId = req.header('userId');
        return await db.checkUser(userId);
    } catch (error) {
        return false;
    }
}

module.exports =  router;