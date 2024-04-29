import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from "next/server";

export async function POST(req) {
  // Extract the necessary data from the request URL or body
  const { searchParams } = new URL(req.url);
  const parentCommentId = searchParams.get('parentCommentId'); // ID of the comment to which the reply is added
  const poster = searchParams.get('poster');
  const content = searchParams.get('content');
  const timestamp = searchParams.get('timestamp');

  // Database connection details
  const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(url);
  const dbName = 'forums';
  const collectionName = 'commentsandreply';

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Updating the comment document to add a reply
    const updateResult = await collection.updateOne(
      { "_id": new ObjectId(parentCommentId) }, // Find the comment by ID
      { $push: { "replies": { "poster": poster, "content": content, "timestamp": timestamp } } } // Push the reply into the replies array
    );

    if (updateResult.matchedCount === 0) {
      return new NextResponse(JSON.stringify({ message: "Comment not found" }), { status: 404 });
    }

    if (updateResult.modifiedCount === 0) {
      return new NextResponse(JSON.stringify({ message: "Reply not added" }), { status: 500 });
    }

    return new NextResponse(JSON.stringify({ message: "Reply added successfully" }), { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  } finally {
    await client.close();
  }
}
