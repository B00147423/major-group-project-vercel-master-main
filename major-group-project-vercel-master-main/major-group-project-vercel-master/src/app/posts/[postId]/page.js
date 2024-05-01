"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
import Comment from '../../Components/Comments';

const CommentPage = () => {
  const [threads, setThreads] = useState([]);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const { postId } = router.query || {};
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // Fetch comments when component mounts
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      // Make a GET request to your API endpoint
      const response = await fetch('`/api/getCommentsById?postId=${postId}`'); // Update the URL with your actual API endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      console.log('Comments:', data); // Log the data to the console
      setComments(data); // Update state with the fetched comments
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    if (router.query && router.query.moduleId) {
      const { moduleId } = router.query;
      setModuleId(moduleId);
      fetchPostsByModule(moduleId);
    }
  }, [router.query]);
  

  async function runDBCallAsync(url, formData){
    try {
      const res = await fetch(url, {
        method: 'POST', // Use POST method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      // Check if the HTTP status code is OK (200-299)
      if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json(); // Parse the JSON in the response
  
      return data; // Return the parsed JSON data
    } catch (error) {
      // If an error occurs, log it to the console
      console.error("Error during fetch: ", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  useEffect(() => {
    const getUsernameFromCookies = () => {
      const allCookies = document.cookie.split('; ');
      const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
      return usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
    };
    const usernameFromCookies = getUsernameFromCookies();
    console.log('Username from cookies:', usernameFromCookies);
    setUsername(usernameFromCookies);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = getUserIdFromCookies();
      if (!userId) {
        console.log("User ID not found.");
        return;
      }
  
      try {
        const res = await fetch(`/api/getUserInfo?userId=${userId}`);
  
        if (!res.ok) {
          throw new Error("Failed to fetch user information");
        }
  
        const { user } = await res.json();
        if (user && user.length > 0) {
          const userInfo = user[0]; // Assuming the result is an array with a single user object
  
          setEmail(userInfo.email);
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };
  
    fetchUserInfo();
  }, []);

  const getUserIdFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const userIdCookie = allCookies.find(cookie => cookie.startsWith('userId='));
    return userIdCookie ? decodeURIComponent(userIdCookie.split('=')[1]) : null;
  };

  const handleCreateComment = () => {
    if (typeof window !== 'undefined'){
      localStorage.setItem('currentPostId', postId);
    } 
    router.push('/createComment');
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    
    const content = event.target.content.value.trim();
    if (!content) return; // Basic validation to prevent empty comments
  
    // Check if username is available
    if (!username) {
      console.error('Username is not available.');
      return;
    }
  
    const timestamp = new Date();
    const poster = username; // Assign the username to poster
    const postId = selectedPost._id;
  
    try {
      const response = await runDBCallAsync(`/api/createComment?poster=${poster}&content=${content}&timestamp=${timestamp}&postId=${postId}`, {});
      if (response && response.data === "true") {
        const newComment = { poster, content, timestamp, postId };
        // Update comments state to include the new comment
        setComments(prevComments => [...prevComments, newComment]);
        event.target.content.value = ''; // Clear the comment input field
        // Fetch comments again to update immediately
        fetchComments(postId);
  
        // Refresh the popup by closing and reopening it
        closeModal();
        handleViewPost(selectedPost);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };


  const handleReplySubmit = async (parentCommentId, replyContent) => {
    const url = `/api/postReply?parentCommentId=${parentCommentId}&poster=${username}&content=${replyContent}&timestamp=${new Date().toISOString()}`;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit reply');
      }
  
      const newReply = { poster: username, content: replyContent, timestamp: new Date().toISOString() };
      // Update comments state to include new reply
      setComments(currentComments => currentComments.map(comment => {
        if (comment._id === parentCommentId) {
          return {...comment, replies: [...(comment.replies || []), newReply]};
        }
        return comment;
      }));
  
      return true;
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply: ' + error.message);
      return false;
    }
  };

const onCommentUpdate = async (commentId, newContent) => {
  try {
    // Call the API to update the comment
    const response = await fetch(`/api/updateComment`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentId, content: newContent }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update comment');
    }

    // Update the comment in the local state to reflect the changes immediately
    setComments(prevComments =>
      prevComments.map(comment =>
        comment._id === commentId ? { ...comment, content: newContent, editedAt: new Date().toISOString() } : comment
      )
    );


  } catch (error) {
    console.error('Error updating comment:', error.message);
  }
};


const handleDeleteComment = async (commentId) => {
  try {
    // Make an API request to delete the comment with the given ID
    const response = await fetch(`/api/deleteComments?commentId=${commentId}`, {
      method: 'DELETE',
      // Add any necessary headers or authentication tokens
    });

    if (response.ok) {
      // If the deletion was successful, update the state or perform any other necessary actions
      console.log('Comment deleted successfully');
      // Remove the deleted comment from the comments state
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
    } else {
      // If there was an error deleting the comment, handle it accordingly
      console.error('Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

return (
  <Layout>
      <div className='container'>
        {/* Text area and submit button for adding new comments */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
          <p>{username}</p> {/* Display username here */}
            <TextField
              margin="normal"
              name="content"
              label="Content"
              type="text"
              id="content"
            />
            <Button type="submit" variant="contained" sx={{mt: 3, mb: 2}}>
              Submit
            </Button>
          </Box>

        {/* Header for comments */}
        <h2>Comments</h2>

        {/* Display all comments */}
        <div className="comment-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <h4>{comment.poster}</h4>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
);
};

export default CommentPage;