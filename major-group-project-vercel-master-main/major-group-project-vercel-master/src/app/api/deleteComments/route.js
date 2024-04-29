// Import necessary modules
import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from "next/server";

// Define the delete comment API
export async function DELETE(req, res) {
  // Get the comment ID from the request
  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get('commentId');

  // Connect to MongoDB
  const client = new MongoClient('mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    // Access the database and collection
    const db = client.db('forums');
    const collection = db.collection('commentsandreply');
    
    // Retrieve the comment from the database
    const comment = await collection.findOne({ _id: new ObjectId(commentId) });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    
    // Delete the comment from the database
    const deleteResult = await collection.deleteOne({ _id: new ObjectId(commentId) });
    if (deleteResult.deletedCount === 1) {
      return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.close();
  }
}
