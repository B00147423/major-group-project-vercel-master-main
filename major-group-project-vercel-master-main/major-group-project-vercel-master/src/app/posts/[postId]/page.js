// CommentPage.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField, Typography } from "@mui/material";
import Comment from './Comment';
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';

const CommentPage = () => {
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const postId = localStorage.getItem('currentPostId');

  useEffect(() => {
    // Fetch comments when component mounts
    fetchComments();
    getUsernameFromCookies();
    fetchUserInfo();
  }, []);

  const fetchComments = async () => {
    try {
      // Make a GET request to your API endpoint
      const response = await fetch(`/api/getCommentsById?postId=${postId}`); // Update the URL with your actual API endpoint
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

  const getUsernameFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
    const usernameFromCookies = usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
    console.log('Username from cookies:', usernameFromCookies);
    setUsername(usernameFromCookies);
  };

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

  const getUserIdFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const userIdCookie = allCookies.find(cookie => cookie.startsWith('userId='));
    return userIdCookie ? decodeURIComponent(userIdCookie.split('=')[1]) : null;
  };

  return (
    <Layout>
      <div className="modal-backdrop">
        <div className="modal-content">
          {/* Display post title and content */}
          <h2>{selectedPost?.title}</h2>
          <p>{selectedPost?.content}</p>
          <hr />
          <div className="forum-container">
            <h3>Comments:</h3>
            <div className="comment-list">
              {comments
                .filter((comment) => comment.postId === selectedPost?._id)
                .map((comment, index) => (
                  <Comment
                    key={comment._id || index}
                    comment={comment}
                    onCommentUpdate={onCommentUpdate}
                    onReplySubmit={handleReplySubmit}
                    onDeleteComment={handleDeleteComment} // Pass the onDeleteComment function
                    currentUser={username}
                    id={`comment-${comment._id || index}`}
                  />
                ))}
            </div>
          </div>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <p>{username}</p> {/* Display username here */}
            <TextField
              margin="normal"
              name="content"
              label="Content"
              type="text"
              id="content"
            />
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
              Submit
            </Button>
          </Box>
        </div>
      </div>
    </Layout>
  );
};

export default CommentPage;
