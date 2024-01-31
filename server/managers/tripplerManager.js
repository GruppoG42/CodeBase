const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');

function createUser(nome, cognome, email) {
    try {
        return dbtest.dbtest.collection("Utente").insertOne({nome, cognome, email});
    } catch (error) {
        throw new Error(`Error creating user: ${error}`);
    }
}

function checkUser(id) {
    try {
        const objectID = new ObjectId(id);
        return dbtest.dbtest.collection("Utente").findOne({"_id": objectID});
    } catch (error) {
        throw new Error(`Error checking user: ${error}`);
    }
}

function eliminaItinerario(id) {
    try {
        const objectID = new ObjectId(id);
        return dbtest.dbtest.collection("Itinerario").deleteOne({"_id": objectID});
    } catch (error) {
        throw new Error(`Error deleting itinerary: ${error}`);
    }
}

function visualizzaItinerari(userId) {
    try {
        return dbtest.dbtest.collection("Itinerario").find({"_userId": userId}).toArray();
    } catch (error) {
        throw new Error(`Error fetching user itineraries: ${error}`);
    }
}

module.exports = {
    createUser,
    checkUser,
    eliminaItinerario,
    visualizzaItinerari
}





