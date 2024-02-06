const dbtest = require("../db/connection.js");
const tappeManager = require("./tappaManager.js");
const {ObjectId} = require('mongodb');

async function calcolaDistanza(idItinerario, giorno, mezzo) {
    // get tappe
    try {
        const itinerario = await dbtest.dbtest.collection("Itinerario").findOne({ "_id": new ObjectId(idItinerario) });
        if(!itinerario) throw new Error("Itinerario con id " + idItinerario + " non trovato");
        const tappe = itinerario.giorni[giorno].tappe;
        const luoghi = tappe.map(t => t.luogo);
        const distanza = await tappeManager.calcolaDistanza(luoghi, mezzo);
        return distanza;
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

async function calcolaPercorso(idItinerario, giorno) {
    // get tappe
    try {
        const itinerario = await dbtest.dbtest.collection("Itinerario").findOne({ "_id": new ObjectId(idItinerario) });
        const tappe = itinerario.giorni[giorno].tappe;
        const mezzo = itinerario.mezzo ? itinerario.mezzo : "car";
        const luoghi = tappe.map(t => t.luogo);
        const percorso = await tappeManager.calcolaPercorso(luoghi, mezzo);
        return percorso;
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

//totalPath
async function calcolaPercorsoTotale(idItinerario) {
    // get tappe
    try {
        const itinerario = await dbtest.dbtest.collection("Itinerario").findOne({ "_id": new ObjectId(idItinerario) });
        const giorni = itinerario.giorni;
        const mezzo = itinerario.mezzo ? itinerario.mezzo : "car";
        const luoghiNested = giorni.map(g => g.tappe.map(t => t.luogo));
        const luoghi = luoghiNested.flat();
        const percorso = await tappeManager.calcolaPercorso(luoghi, mezzo);
        return percorso;
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}
//calcolaTempoPercorrenza
async function calcolaTempoPercorrenza(idItinerario) {
    // get tappe
    try {
        const itinerario = await dbtest.dbtest.collection("Itinerario").findOne({ "_id": new ObjectId(idItinerario) });
        const giorni = itinerario.giorni;
        const mezzo = itinerario.mezzo ? itinerario.mezzo : "car";
        const luoghiNested = giorni.map(g => g.tappe.map(t => t.luogo));
        const luoghi = luoghiNested.flat();
        return await tappeManager.calcolaTempoPercorrenza(luoghi, mezzo);
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function aggiungiTappa(idItinerario, giorno, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        // giorno è un indice, non usare giorno.numero
        return dbtest.dbtest.collection("Itinerario").updateOne(
            { "_id": objectID },
            { $push: { [`giorni.${giorno - 1}.tappe`]: tappa } }
        );
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

function eliminaTappa(idItinerario, giorno, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        // giorno è un indice, non usare giorno.numero
        return dbtest.dbtest.collection("Itinerario").updateOne(
            { "_id": objectID },
            { $pull: { [`giorni.${giorno - 1}.tappe`]: tappa } }
        );
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

async function ripiazzaTappa(idItinerario, giorno, indice, tappa) {
    try {
        const objectID = new ObjectId(idItinerario);
        // First, remove the 'tappa' from its original position
        await dbtest.dbtest.collection("Itinerario").updateOne(
            { "_id": objectID },
            { $pull: { [`giorni.${giorno - 1}.tappe`]: tappa } }
        );
        // Then, add the 'tappa' back at the specified position
        return await dbtest.dbtest.collection("Itinerario").updateOne(
            { "_id": objectID },
            { $push: { [`giorni.${giorno - 1}.tappe`]: { $each: [tappa], $position: indice } } }
        );
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

module.exports = {
    calcolaDistanza,
    calcolaPercorso,
    aggiungiTappa,
    eliminaTappa,
    ripiazzaTappa,
    calcolaPercorsoTotale,
    calcolaTempoPercorrenza
}