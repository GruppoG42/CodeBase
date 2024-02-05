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
        console.error("Valori: " + start + " " + end + " " + mezzo);
        throw error;
    }
}


async function aggiungiGiorno(g, idItinerario) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").updateOne({"_id": objectID}, {$push: {giorni: g}});
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

async function contieneGiorno(g, idItinerario) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").findOne({"_id": objectID, "giorni": g});
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}

async function cercaItinerari(state, name, duration) {
    try {
        const query = {attivo: true};
        if (state) query.stato = {$regex: new RegExp("^" + state), $options: 'i'};
        if (name) query.nome = {$regex: new RegExp("^" + name), $options: 'i'};
        if (duration) {
            query.$expr = {$gte: [{$size: "$giorni"}, Number(duration)]};
        }
        return dbtest.dbtest.collection("Itinerario").find(query).toArray();
    } catch (error) {
        throw new Error(`Error fetching itineraries: ${error}`);
    }
}

async function aggiornaAttivo(idItinerario, attivo) {
    try {
        const objectID = new ObjectId(idItinerario);
        return dbtest.dbtest.collection("Itinerario").updateOne({"_id": objectID}, {$set: {attivo}});
    } catch (error) {
        throw new Error(`Error updating itinerary: ${error}`);
    }
}


async function createItinerary(itineraryData) {
    try {
        return dbtest.dbtest.collection("Itinerario").insertOne(itineraryData);
    } catch (error) {
        throw new Error(`Error creating itinerary: ${error}`);
    }
}

async function getUserItineraries(userId) {
    try {
        return dbtest.dbtest.collection("Itinerario").find({"_userId": userId}).toArray();
    } catch (error) {
        throw new Error(`Error fetching user itineraries: ${error}`);
    }
}

async function getCommunityItineraries(id) {
    try {
        return dbtest.dbtest.collection("Itinerario").find({"_userId": {$ne: id}}).toArray();
    } catch (error) {
        throw new Error(`Error fetching all itineraries: ${error}`);
    }
}

async function test() {
    return "1";
}

async function deleteItineraries(userId) {
    try {
        return dbtest.dbtest.collection("Itinerario").deleteMany({"_userId": userId});
    } catch (error) {
        throw new Error(`Error deleting itinerary: ${error}`);
    }
}

async function getItineraryReview(idItinerario, userId) {
    try {
        console.log("idItinerario: " + idItinerario);
        console.log("userId: " + userId);
        const objectID = new ObjectId(idItinerario);
        const itinerary = await dbtest.dbtest.collection("Itinerario").findOne({
            "_id": objectID
        });

        for (let review of itinerary.recensioni) {
            if (review._userId === userId) {
                return review;
            }
        }

        return null;
    } catch (error) {
        console.log(error);
        throw new Error(`Error fetching itinerary review: ${error}`);
    }
}

async function saveReview(idItinerario, userId, recensione, punteggio) {
    try {
        const objectID = new ObjectId(idItinerario);
        //delete old possible review
        await dbtest.dbtest.collection("Itinerario").updateOne({"_id": objectID}, {$pull: {recensioni: {"_userId": userId}}});
        return dbtest.dbtest.collection("Itinerario").updateOne({"_id": objectID}, {
            $push: {
                recensioni: {
                    _userId: userId,
                    recensione,
                    punteggio
                }
            }
        });
    } catch (error) {
        throw new Error(`Error saving review: ${error}`);
    }
}

module.exports = {
    calcolaTempoPercorrenza,
    aggiungiGiorno,
    contieneGiorno,
    cercaItinerari,
    createItinerary,
    getUserItineraries,
    aggiornaAttivo,
    deleteItineraries,
    getCommunityItineraries,
    getItineraryReview,
    saveReview
}