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

function cercaItinerari() {
    try {
        return dbtest.collection("Itinerario").find().toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function cercaItinerarioPerNome(nome) {
    try {
        return dbtest.collection("Itinerario").find({ "nome": nome }).toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function cercaItinerarioPerStato(stato) {
    try {
        return dbtest.collection("Itinerario").find({ "stato": stato }).toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function cercaItinerarioPerDurata(durata) {
    try {
        return dbtest.collection("Itinerario").find({ "durata": durata }).toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

function createItinerary(itineraryData) {
    try {
        return dbtest.collection("Itinerario").insertOne(itineraryData);
    } catch (error) {
        throw new Error(`Error creating itinerary: ${error}`);
    }
}

function getUserItineraries(userId) {
    try {
        return dbtest.collection("Itinerario").find({ "_userId": userId }).toArray();
    } catch (error) {
        throw new Error(`Error fetching user itineraries: ${error}`);
    }
}

export {
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