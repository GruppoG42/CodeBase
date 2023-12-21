const express = require('express')
const router = express.Router();

// Comunicate with the database
const dbtest = require( "../db/connection.js");

/*
 ***************************************ROUTES***************************************
*/

module.exports =  router;

// Create a new itinerary
router.post('/createItinerary', async (req, res) => {
    const itinerary = req.body;
    const result = await dbtest.collection("Itinerario").insertOne(itinerary);
    res.send(result);
});

// Get all user itineraries
router.get('/getUserItineraries/', async (req, res) => {
    let userId = parseInt(req.query.userId);
    try {
        const result = await dbtest.collection("Itinerario").find({ "_userId": userId }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching itineraries:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Get user info
router.get ('/getUserInfo/', async (req, res) => {
    let userId = parseInt(req.query.userId);
    try {
        const result = await dbtest.collection("Utente").findOne({ "_id": userId });
        res.send(result);
    } catch (error) {
        console.error("Error fetching user info:", error);
        res.status(500).send("Internal Server Error");
    }
});