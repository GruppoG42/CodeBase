const dbtest = require("../db/connection.js");
const tappeManager = require("./tappaManager.js");
const {ObjectId} = require('mongodb');

async function calcolaDistanza(idItinerario, giorno, mezzo) {
    // get tappe
    try {
        const itinerario = await dbtest.dbtest.collection("Itinerario").findOne({ "_id": new ObjectId(idItinerario) });
        const tappe = itinerario.giorni[giorno].tappe;
        const luoghi = tappe.map(t => t.luogo);
        const distanza = await tappeManager.calcolaDistanza(luoghi, itinerario.mezzo);
        return distanza;
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

async function calcolaPercorso(idItinerario, giorno, mezzo) {
    // get tappe
    try {
        const itinerario = await dbtest.dbtest.collection("Itinerario").findOne({ "_id": new ObjectId(idItinerario) });
        const tappe = itinerario.giorni[giorno].tappe;
        const luoghi = tappe.map(t => t.luogo);
        const percorso = await tappeManager.calcolaPercorso(luoghi, itinerario.mezzo);
        return percorso;
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function aggiungiTappa(idItinerario, giorno, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").updateOne({
            "_id": objectID,
            "giorni.numero": giorno
        }, {$push: {"giorni.$.tappe": tappa}});
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function eliminaTappa(idItinerario, giorno, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").updateOne({
            "_id": objectID,
            "giorni.numero": giorno
        }, {$pull: {"giorni.$.tappe": tappa}});
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function eliminaTappaId(idItinerario, giorno, idTappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").updateOne({
            "_id": objectID,
            "giorni.numero": giorno
        }, {$pull: {"giorni.$.tappe": {"_id": idTappa}}});
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function ripiazzaTappa(idItinerario, giorno, indice, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").updateOne({
            "_id": objectID,
            "giorni.numero": giorno
        }, {$set: {"giorni.$.tappe": tappa}});
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }

}

module.exports = {
    calcolaDistanza,
    calcolaPercorso,
    aggiungiTappa,
    eliminaTappa,
    eliminaTappaId,
    ripiazzaTappa
}