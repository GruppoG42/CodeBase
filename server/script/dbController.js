const dbtest = require("../db/connection.js");

async function createItinerary(itineraryData) {
    try {
        return await dbtest.collection("Itinerario").insertOne(itineraryData);
    } catch (error) {
        throw new Error(`Error creating itinerary: ${error}`);
    }
}

async function getUserItineraries(userId) {
    try {
        return await dbtest.collection("Itinerario").find({ "_userId": userId }).toArray();
    } catch (error) {
        throw new Error(`Error fetching user itineraries: ${error}`);
    }
}

module.exports = {
    createItinerary,
    getUserItineraries
};
