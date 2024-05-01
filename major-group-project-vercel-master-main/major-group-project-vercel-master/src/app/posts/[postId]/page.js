"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField, Typography } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
import styles from '../../css/Comment.module.css';

const CommentPage = () => {
  const [threads, setThreads] = useState([]);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const postId = localStorage.getItem('currentPostId');
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    // Fetch comments when component mounts
    fetchComments();
    getUsernameFromCookies();
    fetchUserInfo();
  });

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

    try {
      const response = await runDBCallAsync(`/api/createComment?poster=${poster}&content=${content}&timestamp=${timestamp}&postId=${postId}`, {});
      if (response && response.data === "true") {
        const newComment = { poster, content, timestamp, postId };
        // Update comments state to include the new comment
        setComments(prevComments => [...prevComments, newComment]);
        event.target.content.value = ''; // Clear the comment input field
        // Fetch comments again to update immediately
        fetchComments(postId);
      }
    } catch (error) {
      console.error('Error creating post:', error);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comments.content);
  };

  const handleReplyChange = (event) => {
    setReplyContent(event.target.value);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comments.content);
  };

  const handleSubmitReply = async () => {
    const success = await handleReplySubmit(comments._id, replyContent);

    if (success) {
      setReplyContent('');
      setIsReplying(false);
    } else {
      alert('Failed to submit reply.');
    }
  };

  const handleCancelReply = () => {
    setReplyContent('');
    setIsReplying(false);
  };


  const handleSaveEdit = async () => {
    if (editedContent.trim() === '') {
      // Content cannot be empty
      return;
    }

    setIsEditing(false);
    // Call the onCommentUpdate function with the updated content
    await onCommentUpdate(comments._id, editedContent);
  };

  const handleDelete = () => {
    // Call the onDeleteComment function with the comment ID
    handleDeleteComment(comments._id);
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
          {comments
            .filter((comment) => comment.postId === postId)
            .map((comment) => (
              <div className={styles['comment-container']} key={comment._id}>
                <div className={styles['comment-header']}>
                  <Typography variant="subtitle1" component="span">
                    {comment.poster}
                  </Typography>
                  {comment.editedAt && (
                    <Typography variant="caption" color="textSecondary" component="span">
                      {' (edited at ' + new Date(comment.editedAt).toLocaleString() + ')'}
                    </Typography>
                  )}
                </div>
                <div className={styles['comment-content']}>
                  {isEditing ? (
                    <TextField
                      multiline
                      fullWidth
                      variant="outlined"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                  ) : (
                    <Typography variant="body1">{comment.content}</Typography>
                  )}
                </div>
                {username === comment.poster && !isEditing && (
                  <div className={styles['comment-actions']}>
                    <Button onClick={handleEdit} className={styles['action-btn']}>Edit</Button>
                    <Button onClick={handleDelete} className={styles['action-btn']}>Delete</Button>
                  </div>
                )}
                {!isEditing && !isReplying && (
                  <div className={styles['comment-actions']}>
                    <Button onClick={() => setIsReplying(true)} className={styles['action-btn']}>Reply</Button>
                  </div>
                )}
                {isEditing && (
                  <div className={styles['comment-actions']}>
                    <Button onClick={handleSaveEdit} className={styles['save-btn']}>Save</Button>
                    <Button onClick={handleCancelEdit} className={styles['cancel-btn']}>Cancel</Button>
                  </div>
                )}
                {isReplying && (
                  <div className={styles['reply-section']}>
                    <TextField
                      multiline
                      fullWidth
                      variant="outlined"
                      value={replyContent}
                      onChange={handleReplyChange}
                      placeholder="Write a reply..."
                    />
                    <div className={styles['reply-actions']}>
                      <Button onClick={handleSubmitReply} className={styles['action-btn']}>Submit Reply</Button>
                      <Button onClick={handleCancelReply} className={styles['action-btn']}>Cancel</Button>
                    </div>
                  </div>
                )}
                {comment.replies && comment.replies.map((reply, index) => (
                  <div key={index} style={{ marginLeft: '20px' }}>
                    <Typography variant="body1">
                      <strong>{reply.poster}</strong>: {reply.content}
                    </Typography>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
};

export default CommentPage;