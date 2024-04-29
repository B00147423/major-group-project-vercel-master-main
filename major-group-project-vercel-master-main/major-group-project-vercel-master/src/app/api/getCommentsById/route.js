// Import the necessary modules
import { MongoClient } from 'mongodb';

// Export the handler function for the API route
export default async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://your-frontend-domain.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  // MongoDB connection URL and database name
  const url = 'mongodb+srv://your-connection-url';
  const dbName = 'forums';

  try {
    // Connect to the MongoDB server
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();

    // Access the forums database
    const db = client.db(dbName);

    // Access the commentsandreply collection
    const collection = db.collection('commentsandreply');

    // Find documents in the collection
    const findResult = await collection.find({}).toArray();

    // Close the MongoDB connection
    await client.close();

    // Return the result to the client
    res.status(200).json(findResult);
  } catch (error) {
    // Handle errors
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
