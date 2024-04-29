//Major-Group-Project-Student-Network-Website\major-group-project\src\app\api\getModules\route.js
import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(url);
  const dbName = 'forums'; // database name

  try {
    // Connect to the MongoDB client
    await client.connect();
    console.log('Connected successfully to server');
    
    const db = client.db(dbName);
    const userCollection = db.collection('register'); // collection name for user
    const modulesCollection = db.collection('modules'); // collection name for modules
    
    // Extract userId from the request query parameters
    const searchParams = new URL(request.url).searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    // Find the user from the 'register' collection
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the modules based on user's year from the 'modules' collection
    const modules = await modulesCollection.find({ year: user.year }).toArray();
console.log('modules:', modules);
    // Return the user and modules in the response
    return NextResponse.json({ user, modules });

  } catch (error) {
    // In case of an error, return a 500 Internal Server Error status
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}
