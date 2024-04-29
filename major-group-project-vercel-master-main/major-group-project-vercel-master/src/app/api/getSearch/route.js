export async function GET(req, res) {
    // Extract the search parameter from the request URL
    const { searchParams } = new URL(req.url);
    const searchParam = searchParams.get('search') || ''; // Ensure it's defined or set to an empty string
    
    // MongoDB connection setup
    const { MongoClient } = require('mongodb');
    const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const client = new MongoClient(url);
    const dbName = 'forums';
    
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('forumpost');
    
    // Perform the search based on the extracted parameter
    // Construct a regular expression to match the entire sentence or phrase
    const regexQuery = new RegExp(searchParam.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i'); // Case-insensitive search
    const searchResult = await collection.find({
      $or: [
        { title: { $regex: regexQuery } },
        { content: { $regex: regexQuery } },
        { poster: { $regex: regexQuery } }
      ]
    }).toArray();
  
    console.log('Search results:', searchResult);
    
    // Send the search results as JSON response
    return Response.json(searchResult);
  } 
  