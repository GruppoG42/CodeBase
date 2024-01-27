const dbtest = require("../db/connection.js");
const {ObjectId} = require('mongodb');


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

async function createUser(nome, cognome, email) {
    try {
        return await dbtest.collection("Utente").insertOne({ nome, cognome, email });
    } catch (error) {
        throw new Error(`Error creating user: ${error}`);
    }
}

async function checkUser(id) {
    try {
        const objectID = new ObjectId(id);
        return await dbtest.collection("Utente").findOne({ "_id": objectID });
    } catch (error) {
        throw new Error(`Error checking user: ${error}`);
    }
}

module.exports = {
    createItinerary,
    getUserItineraries,
    createUser,
    checkUser
};
