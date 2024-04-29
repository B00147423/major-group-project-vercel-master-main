import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from "next/server";

export async function POST(req, res) {
  // Make a note we are on the api. This goes to the console.
  console.log("in the api page");

  // Get the values that were sent across to us.
  const { searchParams } = new URL(req.url);
  const poster = searchParams.get('poster');
  const content = searchParams.get('content');
  const timestamp = searchParams.get('timestamp');
  const postId = searchParams.get('postId');

  console.log(poster);
  console.log(content);
  console.log(timestamp);

  // =================================================
  const { MongoClient } = require('mongodb');
  const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(url);
  const dbName = 'forums'; // database name

  try {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('commentsandreply'); // collection name
    
    const findResult = await collection.insertOne({
      "poster": poster,
      "content": content,
      "timestamp": timestamp,
      "postId": new ObjectId(postId)
    });
    if (!findResult) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Comment added successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}
