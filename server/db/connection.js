const { MongoClient } = require('mongodb');
const connectionString = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.PRODUCTION_DATABASE_URL;
const dbName = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_NAME : process.env.PRODUCTION_DATABASE_NAME;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(connectionString);

// Connect the client to the server async
// Ping the server to verify the connection
// Log success or failure

client.connect().catch((error) => {
        console.error("Error connecting to the database:", error);
    });


// Export the db object for use in other modules
const dbtest = client.db(dbName); //INSERIRE NOME DEL DATABASE
module.exports = dbtest;
