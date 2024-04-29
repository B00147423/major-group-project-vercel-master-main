import { hash } from 'bcrypt';

export async function POST(req, res) {
  try {
    // Parse the JSON data from the request body
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const email = searchParams.get('email');
    const pass = searchParams.get('pass');
    const code = searchParams.get('code');
    const studentyear = searchParams.get('year');

    // Hash the password before storing it
    const saltRounds = 10;
    const hashedPassword = await hash(pass, saltRounds);

    // Perform MongoDB operations
    const { MongoClient } = require('mongodb');
    const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    const client = new MongoClient(url);
    const dbName = 'forums'; // database name

    await client.connect();
    console.log('Connected successfully to the server');

    const db = client.db(dbName);
    const collection = db.collection('register'); // collection name

    // Check if the username or email already exists
    const existingUser = await collection.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    } else {
      // Insert the new user data into the collection
      const findResult = await collection.insertOne({
        "username": username,
        "email": email,
        "pass": hashedPassword,
        "code": code,
        "year": studentyear,
      });

      let valid = false;
      if (findResult.insertedCount > 0) {
        // save a little cookie to say we are authenticated
        cookies().set('auth', true);
        cookies().set('username', username)

        valid = true;
        console.log('Registered valid');
      } else {
        console.log('Not Registered');
      }

      // Return a JSON response
      res.json({ data: valid });
    }
  } catch (error) {
    console.error('Error:', error);
    // Return an error response
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
