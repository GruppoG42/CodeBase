const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');


async function createItinerary(itineraryData) {
    try {
        return await dbtest.dbtest.collection("Itinerario").insertOne(itineraryData);
    } catch (error) {
        throw new Error(`Error creating itinerary: ${error}`);
    }
}

module.exports = {
    createItinerary,
};
