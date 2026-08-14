const { MongoClient, ServerApiVersion } = require("mongodb");
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bb41v.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db;

async function connectDB() {
    if (db) return db;
    await client.connect();
    db = client.db("infinityStore");

    console.log("MongoDB Connected");
    return db;
}

function getDB() {
    return db;
}

module.exports = { connectDB, getDB };
