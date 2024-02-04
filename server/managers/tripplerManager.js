const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');

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
    eliminaItinerario,
    visualizzaItinerari
}





