const { MongoClient, ServerApiVersion } = require('mongodb');
const connectionString = process.env.ATLAS_URI || "";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(connectionString, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect the client to the server async
// Ping the server to verify the connection
// Log success or failure
async function connect() {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
}
connect().then(() => {
    console.log("Connected to MongoDB Atlas");
}).catch((error) => {
    console.error("Error connecting to the database:", error);
});

// Export the db object for use in other modules
const dbtest = client.db("test"); //INSERIRE NOME DEL DATABASE
module.exports = dbtest;
