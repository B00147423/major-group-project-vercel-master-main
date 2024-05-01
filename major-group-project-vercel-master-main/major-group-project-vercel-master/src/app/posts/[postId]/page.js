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

  const handleEditChange = (event) => {
    setEditedContent(event.target.value);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      await onCommentUpdate(selectedPost._id, editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleReply = (comment) => {
    setIsReplying(true);
    setSelectedPost(comment);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent('');
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setSelectedPost(null);
    setReplyContent('');
  };

  return (
    <Layout>
      <div className={styles.commentWrapper}>
        <div>
          <h2>Comments</h2>
          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              fullWidth
              id="content"
              label="Comment"
              name="content"
              multiline
              rows={4}
            />
            <Button type="submit" variant="contained" color="primary">
              Post Comment
            </Button>
          </form>
          {comments.map(comment => (
            <div key={comment._id}>
              <Typography variant="subtitle1" component="h3" gutterBottom>
                {comment.poster}
              </Typography>
              <Typography variant="body1" component="p" gutterBottom>
                {comment.content}
              </Typography>
              <Typography variant="caption" gutterBottom>
                {comment.timestamp}
              </Typography>
              {comment.replies && comment.replies.length > 0 && (
                <div className={styles.repliesWrapper}>
                  <Typography variant="subtitle2" component="h4">
                    Replies:
                  </Typography>
                  {comment.replies.map(reply => (
                    <div key={reply._id}>
                      <Typography variant="body2" component="p">
                        {reply.poster}: {reply.content}
                      </Typography>
                      <Typography variant="caption">
                        {reply.timestamp}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
              {!isEditing && (
                <div>
                  <Button onClick={() => handleEdit(comment)} color="primary">
                    Edit
                  </Button>
                  <Button onClick={() => handleReply(comment)} color="primary">
                    Reply
                  </Button>
                  <Button onClick={() => handleDeleteComment(comment._id)} color="secondary">
                    Delete
                  </Button>
                </div>
              )}
              {isEditing && selectedPost._id === comment._id && (
                <form onSubmit={handleEditSubmit}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="editedContent"
                    label="Edited Content"
                    name="editedContent"
                    multiline
                    rows={4}
                    value={editedContent}
                    onChange={handleEditChange}
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} color="secondary">
                    Cancel
                  </Button>
                </form>
              )}
              {isReplying && selectedPost._id === comment._id && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleReplySubmit(comment._id, replyContent);
                }}>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="replyContent"
                    label="Reply Content"
                    name="replyContent"
                    multiline
                    rows={4}
                    value={replyContent}
                    onChange={handleReplyChange}
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Reply
                  </Button>
                  <Button onClick={handleCancelReply} color="secondary">
                    Cancel
                  </Button>
                </form>
              )}
{comments
  .filter((comment) => comment.postId === selectedPost._id) // Filter comments based on the selected post ID
  .map((comment, index) => (
    <Comment
      key={comment._id || index}
      comment={comment}
      onCommentUpdate={onCommentUpdate}
      onReplySubmit={handleReplySubmit}
      onDeleteComment={handleDeleteComment}
      currentUser={username}
      id={`comment-${comment._id || index}`}
    />
  ))}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CommentPage;

