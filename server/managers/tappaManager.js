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
        return response.data.rows[0].elements[1].distance;
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta a Google Maps API:', error.message);
        console.error("Valori distanza: " + luoghi + " " + mezzo);
        throw error;
    }
}

async function calcolaPercorso(luoghi, mezzo) {
    if (luoghi.length < 2) {
        throw new Error("Devi fornire almeno due luoghi per calcolare un percorso.");
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    //half of the array
    const obj = {
        params: {
            origin: luoghi[0],
            destination: luoghi[luoghi.length - 1],
            waypoints: luoghi.slice(1, -1).join('|'),
            // mode: "driving",
            key: dbtest.apiKey,
        },
    }
    try {
        const response = await axios.get(url, obj);
        let totale = 0;
        response.data.routes[0].legs.forEach(leg => {
            totale += leg.distance.value;
        });
        return totale;
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta a Google Maps API:', error.message);
        console.error("Valori percorso: " + luoghi + " " + mezzo);
        throw error;
    }
}

//calcolaTempoPercorrenza
async function calcolaTempoPercorrenza(luoghi, mezzo) {
    if (luoghi.length < 2) {
        throw new Error("Devi fornire almeno due luoghi per calcolare un percorso.");
    }

    const url = 'https://maps.googleapis.com/maps/api/directions/json';
    const obj = {
        params: {
            origin: luoghi[0],
            destination: luoghi[luoghi.length - 1],
            waypoints: luoghi.slice(1, -1).join('|'),
            mode: mezzo,
            key: dbtest.apiKey,
        },
    }
    try {
        const response = await axios.get(url, obj);
        let totale = 0;
        response.data.routes[0].legs.forEach(leg => {
            totale += leg.duration.value;
        });
        return totale;
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta a Google Maps API:', error.message);
        throw error;
    }
}

module.exports = {
    calcolaDistanza,
    calcolaPercorso,
    calcolaTempoPercorrenza
}