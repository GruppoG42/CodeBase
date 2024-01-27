const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');

async function calcolaTempoPercorrenza(start, end, mezzo) {
    //TODO: implementare
}

function recensisci(idItinerario, recensione) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.collection("Itinerario").updateOne({ "_id": objectID }, { $push: { recensioni: recensione } });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function aggiungiGiorno(g, idItinerario) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.collection("Itinerario").updateOne({ "_id": objectID }, { $push: { giorni: g } });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function contieneGiorno(g, idItinerario) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.collection("Itinerario").findOne({ "_id": objectID, "giorni": g });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}