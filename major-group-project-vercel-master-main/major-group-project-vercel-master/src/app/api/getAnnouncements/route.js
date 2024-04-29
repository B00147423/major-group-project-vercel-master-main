
import { NextResponse } from 'next/server';
export async function GET(req) {
    // Make a note we are on the api. This goes to the console.
    console.log("in the GET api page");
  
    // Get the moduleId from the query parameters
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('moduleId');
    console.log(moduleId);
  
    // =================================================
    // Connect to MongoDB and query documents based on moduleId
    const { MongoClient } = require('mongodb');
    // Connection URL
    const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    // Create a new MongoClient
    const client = new MongoClient(url);
    // database name
    const dbName = 'forums'; 
  
    try {
      // Use connect method to connect to the server
      await client.connect();
      console.log('Connected successfully to server');
      // mongodb connection to the database
      const db = client.db(dbName);
      // Get the collection
      const collection = db.collection('announcements'); // collection name
      // Query documents based on moduleId
      const posts = await collection.find({ moduleId: moduleId }).toArray();
      console.log('Found documents =>', posts);
  
      // Return the retrieved posts
      return new NextResponse(JSON.stringify(posts), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error:', error);
      return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } finally {
      client.close(); // Close the MongoDB client connection
    }
  }
  