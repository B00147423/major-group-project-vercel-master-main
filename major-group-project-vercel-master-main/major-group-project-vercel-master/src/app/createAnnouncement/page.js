//createAnnouncement page
'use client';
import { Button, Box, TextField } from "@mui/material";
import React, { useState, useEffect } from 'react';
import Layout from "../Components/Layout";
import '../css/createPost.css';
import { useRouter } from 'next/navigation';

async function runDBCallAsync(url, formData){
// Send a POST request
    try {
        // Send a POST request
        const res = await fetch(url, { 
          method: 'POST', // Use POST method
          headers: {
            'Content-Type': 'application/json',
          },
          // Convert th into a JSON string
          body: JSON.stringify(formData), 
        });
        // Check if the HTTP status code is OK (200-299)
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }


    const data = await res.json();
// Check if the response is OK and return the data
    if (data.data === "true"){ 
        console.log("Announcement created successfully")
    }
    else {
        console.log("Error: could not create Announcement")
    }
    // If an error occurs, log it to the console
    }catch (error) { 
    // If an error occurs, log it to the console
    console.error("Error during fetch: ", error);
  }
}


const createAnnouncement = () => {
    const [username, setUsername] = useState('');
    if (typeof localStorage !== "undefined"){
      const moduleId = localStorage.getItem('currentModuleId');
    }
    const router = useRouter(); // Using useRouter for navigation

    
  useEffect(() => {
        const getUsernameFromCookies = () => {
            const allCookies = document.cookie.split('; ');
            const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
            return usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
        };
        setUsername(getUsernameFromCookies());
    }, []);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
    
      const data = new FormData(event.currentTarget);
      let title = data.get('title');
      let content = data.get('content');
      let timestamp = new Date();
      let poster = username;
    
        try {
            const response = await runDBCallAsync(`/api/createAnnouncement?poster=${poster}&title=${title}&content=${content}&timestamp=${timestamp}&moduleId=${moduleId}`);
            console.log('response:', response);
            if (response.data === "true") {
                console.log("Announcement created successfully");
                router.push('/forums'); // Navigate to forums page
            } else {
                console.log("Error: could not create announcement");
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };
  
    return (
      <Layout>
        <div className="post-creator">
          <center><h1>Create Announcements</h1></center>
  
          <form onSubmit={handleSubmit}>
            <h2>Title</h2>
            <TextField
              margin="normal"
              required
              fullWidth
              name="title"
              label="title"
              type="text"
              id="title"
            />
            <br></br>
            <h2>Content</h2>
            <TextField
              margin="normal"
              required
              fullWidth
              name="content"
              label="content"
              type="text"
              id="content"
            />
            <br></br>
  
            <br></br>
            <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3, mb: 2,
              borderRadius: '8px', // Rounded corners
              backgroundColor: '#1976d2', // Primary color
              '&:hover': {
                backgroundColor: '#115293', // Darker shade on hover
              },
              padding: '10px 15px', // Padding
              color: 'white', // Text color
            }}
          >
            Create Announcement
          </Button>
                    </form>
                  </div>
                </Layout>
    );
  }
  
  export default createAnnouncement;