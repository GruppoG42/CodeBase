const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');
const axios = require('axios');

async function calcolaDistanza(luoghi, mezzo) {
    //usa maps api
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';

    try {
        const response = await axios.get(url, {
            params: {
                origins: luoghi.join('|'),
                destinations: luoghi.join('|'),
                mode: mezzo,
                key: dbtest.apiKey,
            },
        });

        // Estrai la distanza dalla risposta di Google Maps
        return response.data.rows[0].elements[1].distance.text;
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta a Google Maps API:', error.message);
        throw error;
    }
}

async function calcolaPercorso(luoghi, mezzo) {
    const url = 'https://maps.googleapis.com/maps/api/directions/json';

    try {
        const response = await axios.get(url, {
            params: {
                origin: luoghi[0],
                destination: luoghi[luoghi.length - 1],
                waypoints: luoghi.slice(1, -1).join('|'),
                mode: mezzo,
                key: dbtest.apiKey,
            },
        });

        return response.data.routes[0].legs.map((leg) => leg.steps.map((step) => step.html_instructions));
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta a Google Maps API:', error.message);
        throw error;
    }
}

module.exports = {
    calcolaDistanza,
    calcolaPercorso
}