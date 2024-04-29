export async function GET(req, res){
    const { MongoClient } = require('mongodb');
  
    const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const client = new MongoClient(url);
  
    const dbName = 'forums'; // database name
    await client.connect();// Use connect method to connect to the server
    console.log('Connected successfully to server');
    const db = client.db(dbName); // mongodb connection to the database
    const collection = db.collection('commentsandreply');// Get the collection
    // Insert a document in the collection 
    const findResult = await collection.find({}).toArray();
  
    console.log('FDGSOHGFDB =>', findResult); 
    return Response.json(findResult)  //return the result to the client 
  }
  