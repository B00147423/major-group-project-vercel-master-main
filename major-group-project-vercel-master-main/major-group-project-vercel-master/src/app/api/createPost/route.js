import sgMail from '@sendgrid/mail';
import { NextResponse } from "next/server";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);

export async function POST(req, res) {
  // Make a note we are on the api. This goes to the console.
  console.log("in the api page");

  // Get the values that were sent across to us.

  const { searchParams } = new URL(req.url);
  const poster = searchParams.get('poster');
  const title = searchParams.get('title');
  const content = searchParams.get('content');
  const timestamp = searchParams.get('timestamp');
  const moduleId = searchParams.get('moduleId');
  console.log(poster);
  console.log(title);
  console.log(content);
  console.log(timestamp);
  console.log(moduleId); // Ensure moduleId is not null

  // =================================================
  // Connect to MongoDB and insert a document
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
    const collection = db.collection('forumpost'); // collection name
    // Insert a document
    const findResult = await collection.insertOne({
      "poster": poster,
      "title": title,
      "content": content,
      "timestamp": timestamp,
      "moduleId": moduleId
    });

   // Retrieve all users except the one who created the post
   const users = await db.collection('register').find({ username: { $ne: poster } }).toArray();

    const notificationsCollection = db.collection('notifications');

    const newPostNotification = {
      message: `New post created by ${poster}`,
      postId: findResult.insertedId.toString(), // Convert ObjectId to string
      timestamp: new Date(),
      createdBy: poster, // This field will denote who created the post
      read: false
    };
 // Loop through all users and push the notification
 await Promise.all(
  users.map(async user => {
    if (user.notificationsEnabled) {
  await notificationsCollection.updateOne(
      { username: user.username },
      { $push: { notifications: newPostNotification } },
      { upsert: true }
  );
  // Send email notification
  const msg = {
    to: user.email,
    from: 'bbetsunaidze@hotmail.com',
    subject: `🚀 New Post: ${title}`,
    text: `Hi there!\n\nA new post titled "${title}" has been created by ${poster}. Check it out on our platform!\n\nBest regards,\nYour Platform Team`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">🚀 New Post</h1>
          <p style="color: #555; font-size: 16px;">Hi there!</p>
          <p style="color: #555; font-size: 16px;">A new post titled "${title}" has been created by ${poster}. Check it out on our platform!</p>
          <br>
          <p style="color: #555; font-size: 16px;">Best regards,<br>Student Networking Team</p>
        </div>
      </div>
    `,
  };
  await sgMail.send(msg);
}
}));

    let valid = true;
    
    // at the end of the process we need to send something back.
    return NextResponse.json({ "data": "" + valid + "" });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.close(); // Close the MongoDB client connection
  }
}
