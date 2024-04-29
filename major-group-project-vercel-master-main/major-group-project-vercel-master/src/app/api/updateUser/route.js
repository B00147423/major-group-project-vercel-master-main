import { hash } from 'bcrypt';
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const email = searchParams.get('email');
  const pass = searchParams.get('pass');
  const code = searchParams.get('code');
  const studentyear = searchParams.get('year');

  const hashedPassword = await hash(pass, 10);
  const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(url);
  const dbName = 'forums';

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('register');

    const existingUser = await collection.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ error: 'This username is already taken' }, { status: 400 });
      }
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'There is already an account with this email' }, { status: 400 });
      }
    }

    const result = await collection.insertOne({
      username, email, pass: hashedPassword, code, year: studentyear
    });

    if (result.insertedCount > 0) {
      return NextResponse.json({ message: 'Registration successful', data: true }, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Registration failed', data: false }, { status: 500 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.error({ status: 500, body: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
