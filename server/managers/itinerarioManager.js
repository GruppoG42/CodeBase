const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');
const axios = require('axios');

async function calcolaTempoPercorrenza(start, end, mezzo) {
    const url = 'https://maps.googleapis.com/maps/api/directions/json';

    try {
        const response = await axios.get(url, {
            params: {
                origin: start,
                destination: end,
                mode: mezzo,
                key: dbtest.apiKey,
            },
        });

        // Estrai il tempo di percorrenza dalla risposta di Google Maps
        const tempoPercorrenza = response.data.routes[0].legs[0].duration.text;

        console.log(response.data.routes[0]);

        return tempoPercorrenza;
    } catch (error) {
        console.error('Si è verificato un errore durante la richiesta a Google Maps API:', error.message);
        throw error;
    }
}

function recensisci(idItinerario, recensione, punteggio) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.dbtest.collection("Itinerario").updateOne({ "_id": objectID }, { $push: { recensioni: { recensione, punteggio } } });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function aggiungiGiorno(g, idItinerario) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").updateOne({ "_id": objectID }, { $push: { giorni: g } });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function contieneGiorno(g, idItinerario) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").findOne({ "_id": objectID, "giorni": g });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function cercaItinerari() {
    try {
        return dbtest.dbtest.collection("Itinerario").find().toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function cercaItinerarioPerNome(nome) {
    try {
        return dbtest.dbtest.collection("Itinerario").find({ "nome": nome }).toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function cercaItinerarioPerStato(stato) {
    try {
        return dbtest.dbtest.collection("Itinerario").find({ "stato": stato }).toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function cercaItinerarioPerDurata(durata) {
    try {
        return dbtest.dbtest.collection("Itinerario").find({ "durata": durata }).toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function createItinerary(itineraryData) {
    try {
        return dbtest.dbtest.collection("Itinerario").insertOne(itineraryData);
    } catch (error) {
        throw new Error(`Error creating itinerary: ${error}`);
    }
}

function getUserItineraries(userId) {
    try {
        return dbtest.dbtest.collection("Itinerario").find({ "_userId": userId }).toArray();
    } catch (error) {
        throw new Error(`Error fetching user itineraries: ${error}`);
    }
}

module.exports = {
    calcolaTempoPercorrenza,
    recensisci,
    aggiungiGiorno,
    contieneGiorno,
    cercaItinerari,
    cercaItinerarioPerNome,
    cercaItinerarioPerStato,
    cercaItinerarioPerDurata,
    createItinerary,
    getUserItineraries
}