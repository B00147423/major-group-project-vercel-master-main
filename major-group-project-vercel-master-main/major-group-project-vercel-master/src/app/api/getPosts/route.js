export async function GET(req, res){
    const { MongoClient } = require('mongodb');
  // Connection URL
    const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    // Create a new MongoClient
    const client = new MongoClient(url);
  // database name
    const dbName = 'forums';
    // Use connect method to connect to the server
    await client.connect();

    console.log('Connected successfully to server');
    // mongodb connection to the database
    const db = client.db(dbName);
    // Get the collection
    const collection = db.collection('forumpost');
  // Insert a document
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);
  
    return Response.json(findResult)
  
  }