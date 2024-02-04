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

async function getSavedItineriesById(id) {
    const result = await dbtest.dbtest.collection("Salvati").aggregate([
        { $match: { "_id": id } },
        { $unwind: "$salvati" },
        {
            $project: {
                "salvatiObjectId": { $toObjectId: "$salvati" } // Convert salvati to ObjectId
            }
        },
        {
            $lookup: {
                from: "Itinerario",
                localField: "salvatiObjectId",
                foreignField: "_id",
                as: "itinerari_salvati"
            }
        },
        { $unwind: "$itinerari_salvati" }
    ]).toArray();
    const transformedResult = result.map(entry => entry.itinerari_salvati);
    console.log(transformedResult)
    return transformedResult;
}

async function isSavedItinerary(id, itineraryId) {
    const result = await dbtest.dbtest.collection("Salvati").findOne({ "_id": id, "salvati": itineraryId });
    return !!result;
}

function addItineraryToSaved(id, itineraryId) {
    if (checkItineraryId(itineraryId)){
        return dbtest.dbtest.collection("Salvati").updateOne(
            { "_id": id },
            { $push: { "salvati": itineraryId } },
            { upsert: true }
        );
    }else{
        throw new Error(`Itinerary not found`);
    }
}

function removeItineraryFromSaved(id, itineraryId) {
    if (checkItineraryId(itineraryId)){
        return dbtest.dbtest.collection("Salvati").updateOne(
            { "_id": id },
            { $pull: { "salvati": itineraryId }
            });
    }else{
        throw new Error(`Itinerary not found`);
    }
}

function checkItineraryId(id) {
    try {
        const objectId = new ObjectId(id);
        const itinerary = dbtest.dbtest.collection("Itinerario").findOne({ "_id": objectId });
        return !!itinerary;
    } catch (error) {
        throw new Error(`Error fetching itinerary: ${error}`);
    }
}

module.exports = {
    eliminaItinerario,
    visualizzaItinerari,
    getSavedItineriesById,
    addItineraryToSaved,
    removeItineraryFromSaved,
    isSavedItinerary
}





