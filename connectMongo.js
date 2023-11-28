const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.mongoDbUrl;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDB(dbname, collectionName) {
  try {
    await client.connect();
    console.log("Connected to the database");

    const db = client.db(dbname); // create a database
    const collection = db.collection(collectionName); // create a collection

    return { client, db, collection };
  } catch (e) {
    console.error("Error connecting to the database:", e);
    throw e; // Rethrow the error to be handled by the calling function
  }
}

module.exports = { connectToDB };
