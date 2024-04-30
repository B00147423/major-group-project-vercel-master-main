import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from "next/server";

export async function PATCH(req, res) {
    let client;

    try {
        // Parse the request body to get the commentId and newContent
        const { commentId, content } = await req.json();

        // Database connection details
        const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        client = new MongoClient(url);
        const dbName = 'forums';

        await client.connect();
        console.log('Connected successfully to server');

        const db = client.db(dbName);
        const collection = db.collection('commentsandreply');

        const updateResult = await collection.updateOne(
            { "_id": new ObjectId(commentId) }, // Filter to identify the document to update
            { $set: { "content": content, "editedAt": new Date() } } // Update content and editedAt
        );
            console.log("GFDSKGNDFOIGN",updateResult);

        // Check if the document was successfully updated
        if (updateResult.matchedCount === 0) {
            // No document matched the given ID
            return NextResponse.json({ message: "Comment not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Comment updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } 
}
