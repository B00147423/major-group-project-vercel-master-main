// Comment.js
"use client"
import React, { useState } from 'react';
import { Button, Box, TextField, Typography } from "@mui/material";
import styles from '../css/Comment.module.css';

const Comment = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

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
    const postId = selectedPost._id;
  
    try {
      const response = await runDBCallAsync(`/api/createComment?poster=${poster}&content=${content}&timestamp=${timestamp}&postId=${postId}`, {});
      if (response && response.data === "true") {
        const newComment = { poster, content, timestamp, postId };
        // Update comments state to include the new comment
        setComments(prevComments => [...prevComments, newComment]);
        event.target.content.value = ''; // Clear the comment input field
        // Fetch comments again to update immediately
        
        setComments(data); // Update the comments state with the fetched comments
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    onDeleteComment(comment._id);
  };

  const handleSaveEdit = () => {
    onCommentUpdate(comment._id, editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const handleReplyChange = (event) => {
    setReplyContent(event.target.value);
  };

  const handleSubmitReply = () => {
    onReplySubmit(comment._id, replyContent);
    setIsReplying(false);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyContent('');
  };

  return (
    <div className={styles['comment-container']}>
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
      {currentUser === comment.poster && !isEditing && (
        <div className={styles['comment-actions']}>
          <Button onClick={handleEdit} className={styles['action-btn']}>Edit</Button>
          <Button onClick={handleDelete} className={styles['action-btn']}>Delete</Button>
        </div>
      )}
      {currentUser !== comment.poster && !isEditing && !isReplying && (
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
            <div className="modal-backdrop">
              <div className="modal-content">

                <h2>{selectedPost?.title}</h2>
                <p>{selectedPost?.content}</p>
                <hr/>
                <div className="forum-container">
                  <h3>Comments:</h3>
                  <div className="comment-list">
                  {comment
                      .filter((comment) => comment.postId === selectedPost._id)
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
              </div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default Comment;
