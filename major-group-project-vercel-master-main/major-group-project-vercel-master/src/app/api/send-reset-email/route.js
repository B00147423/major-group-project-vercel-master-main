// api/reset-password-request.js (Server-side)
import sgMail from '@sendgrid/mail';
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for token generation
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);

export async function POST(req) {
    try {
        // Connect to MongoDB
        const client = new MongoClient('mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        const dbName = 'forums';
        await client.connect();
        const db = client.db(dbName);

        // Parse the URL to get search parameters
        const { searchParams } = new URL(req.url);

        // Extract parameters
        const username = searchParams.get('username');
        const email = searchParams.get('email');
        console.log("Username:", username, "Email:", email); // Log parameters

        // Retrieve user from the 'register' collection
        const user = await db.collection('register').findOne({ "username": username, "email": email });
        console.log("User:", user); // Log user object
        if (!user) {
            console.log("User not found");
            return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Generate a unique token for password reset
        const token = uuidv4();

        // Set expiry time (in milliseconds) for the reset link (e.g., 1 hour)
        const expiryTime = Date.now() + 3600000; // 1 hour

        // Store the token and expiry time in the 'password_reset_tokens' collection along with user information
        await db.collection('password_reset_tokens').insertOne({
            username: username,
            email: email,
            token: token,
            expiry: expiryTime,
            createdAt: new Date()
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${token}`;
        
        // Prepare the email message
        const msg = {
            to: email,
            from: 'bbetsunaidze@hotmail.com',
            subject: '🔐 Reset Your Password',
            text: `Hello,\n\nFollow this link to reset your password: ${resetLink}`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">🔐 Reset Your Password</h1>
                  <p style="color: #555; font-size: 16px;">Hello,</p>
                  <p style="color: #555; font-size: 16px;">Follow this <a href="${resetLink}" style="color: #007bff; text-decoration: none;">link</a> to reset your password.</p>
                </div>
              </div>
            `,
          };

        // Send email through SendGrid
        await sgMail.send(msg);

        // Close MongoDB client
        await client.close();

        console.log("Email sent successfully");
        return new NextResponse(JSON.stringify({ message: 'Email sent successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    }
}
