// api/reset-password.js (Server-side)
// api/reset-password.js (Server-side)
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing

export async function POST(req) {
    try {
        const { token, newPassword } = await req.json(); 
        // Connect to MongoDB
        const client = new MongoClient('mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        const dbName = 'forums';
        await client.connect();
        const db = client.db(dbName);

        // Find the user associated with the token in the 'password_reset_tokens' collection
        const resetTokenDoc = await db.collection('password_reset_tokens').findOne({ token });
        if (!resetTokenDoc) {
            return new NextResponse(JSON.stringify({ error: 'Invalid or expired token' }), { status: 400 });
        }

        // Check if the token has expired
        if (resetTokenDoc.expiry < Date.now()) {
            return new NextResponse(JSON.stringify({ error: 'Reset token has expired' }), { status: 400 });
        }

        // Hash the new password before storing it
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the 'register' collection
        await db.collection('register').updateOne(
            { email: resetTokenDoc.email },
            { $set: { pass: hashedPassword } }
        );

        // Delete the reset token from the 'password_reset_tokens' collection
        await db.collection('password_reset_tokens').deleteOne({ token });

        // Close MongoDB client
        await client.close();

        return new NextResponse(JSON.stringify({ message: 'Password reset successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error resetting password:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to reset password' }), { status: 500 });
    }
}
