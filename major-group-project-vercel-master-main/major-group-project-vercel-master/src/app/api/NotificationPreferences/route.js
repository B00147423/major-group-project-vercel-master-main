// server.js
import { MongoClient} from 'mongodb';
import { NextResponse } from "next/server";

export async function PATCH(req, res) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const notificationsEnabled = searchParams.get('notificationsEnabled') === 'true';

    const url = process.env.MONGODB_URI;
    const client = new MongoClient(url);
    const dbName = 'forums';

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('register');

        await collection.updateOne(
            { username: username },
            { $set: { notificationsEnabled: notificationsEnabled } }
        );

        return NextResponse.json({ success: true, message: "Notification preferences updated." });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.close();
    }
}
