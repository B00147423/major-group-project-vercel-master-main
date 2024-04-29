// route.js
import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from 'mongodb';

const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'forums';
const client = new MongoClient(url);

export async function GET(request) {
  const url = 'mongodb://root:example@localhost:27017/';
  const client = new MongoClient(url);
  const dbName = 'forums'; // database name

  try {
    // Connect to the MongoDB client
    await client.connect();
    console.log('Connected successfully to server');
    
    const db = client.db(dbName);
    const modulesCollection = db.collection('modules'); // collection name for modules
    const threadsCollection = db.collection('threads'); // collection name for threads
    
    // Extract moduleId from the request query parameters
    const searchParams = new URL(request.url).searchParams;
    const moduleId = searchParams.get('moduleId');
    
    if (!moduleId) {
      return NextResponse.json({ error: 'moduleId query parameter is required' }, { status: 400 });
    }

    // Find the module from the 'modules' collection
    const module = await modulesCollection.findOne({ _id: new ObjectId(moduleId) });
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Find the threads based on moduleId from the 'threads' collection
    const threads = await threadsCollection.find({ moduleId }).toArray();

    // Return the module and threads in the response
    return NextResponse.json({ module, threads });

  } catch (error) {
    // In case of an error, return a 500 Internal Server Error status
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}
