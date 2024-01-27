const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');

async function calcolaDistanza(startPoint, mezzo) {
    //TODO: implementare
}

async function calcolaPercorso(startPoint, mezzo) {
    //TODO: implementare
}

function aggiungiTappa(idItinerario, giorno, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.collection("Itinerario").updateOne({ "_id": objectID, "giorni.numero": giorno }, { $push: { "giorni.$.tappe": tappa } });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function eliminaTappa(idItinerario, giorno, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.collection("Itinerario").updateOne({ "_id": objectID, "giorni.numero": giorno }, { $pull: { "giorni.$.tappe": tappa } });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function eliminaTappaId(idItinerario, giorno, idTappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.collection("Itinerario").updateOne({ "_id": objectID, "giorni.numero": giorno }, { $pull: { "giorni.$.tappe": { "_id": idTappa } } });
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

module.exports = {    calcolaDistanza,
    calcolaPercorso,
    aggiungiTappa,
    eliminaTappa,
    eliminaTappaId
}