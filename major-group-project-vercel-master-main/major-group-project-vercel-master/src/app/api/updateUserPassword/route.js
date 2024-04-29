import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse } from "next/server";
import { hash, compare } from 'bcrypt';
const url = 'mongodb+srv://b00140738:YtlVhf9tX6yBs2XO@cluster0.j5my8yy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

const dbName = 'forums';

// To handle a PATCH request to /api/updatePassword
export async function PATCH(request) {
    try {
        const requestBody = await request.json();
        const { userId, currentPassword, newPassword } = requestBody;

        await client.connect();
        const database = client.db(dbName);
        const usersCollection = database.collection('register');

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            // If no user is found, return a 404 error
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        // Use bcrypt.compare to check the current password against the hashed password
        const isMatch = await compare(currentPassword, user.pass);
        if (!isMatch) {
            // If the passwords don't match, return a 400 error
            return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // Hash the new password before saving
        const hashedNewPassword = await hash(newPassword, 10);
        
        const updateResult = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { pass: hashedNewPassword } }  // Make sure to update 'pass' not 'password'
        );

        if (updateResult.modifiedCount === 0) {
            // Handle case where no records were updated
            return new Response(JSON.stringify({ error: 'Failed to update password' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        // If successful, send back a successful response
        return new Response(JSON.stringify({ message: 'Password updated successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        // Handle any other server errors
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } finally {
        await client.close();
    }
}