"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
import Comment from '../../Components/Comments';

const CommentPage = () => {
    const [comments, setComments] = useState([]);
    const [username, setUsername] = useState('');
    const router = useRouter();
    const { postId } = router.query || {};
    const [selectedPost, setSelectedPost] = useState(null);
    const [email, setEmail] = useState('');
  
    useEffect(() => {
      // Fetch comments when component mounts
      fetchComments();
    }, [postId]);
  
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/getCommentsById?postId=${postId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
  
    useEffect(() => {
      const getUsernameFromCookies = () => {
        const allCookies = document.cookie.split('; ');
        const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
        return usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
      };
      const usernameFromCookies = getUsernameFromCookies();
      setUsername(usernameFromCookies);
    }, []);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      const content = event.target.content.value.trim();
      if (!content || !username || !selectedPost) return;
  
      const timestamp = new Date();
      const poster = username;
    
      try {
        const response = await fetch(`/api/createComment?poster=${poster}&content=${content}&timestamp=${timestamp}&postId=${selectedPost._id}`, {});
        if (response.ok) {
          const newComment = { poster, content, timestamp, postId: selectedPost._id };
          setComments(prevComments => [...prevComments, newComment]);
          event.target.content.value = '';
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
  
    const handleDeleteComment = async (commentId) => {
      try {
        const response = await fetch(`/api/deleteComments?commentId=${commentId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
        } else {
          console.error('Failed to delete comment');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    };
  
    const onCommentUpdate = async (commentId, newContent) => {
      try {
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
  
        setComments(prevComments =>
          prevComments.map(comment =>
            comment._id === commentId ? { ...comment, content: newContent, editedAt: new Date().toISOString() } : comment
          )
        );
  
      } catch (error) {
        console.error('Error updating comment:', error.message);
      }
    };
  
    return (
      <Layout>
        <div className='container'>
          <div className="forum-container">
            <h3>Comments:</h3>
            <div className="comment-list">
              {selectedPost && comments
                .filter((comment) => comment.postId === selectedPost._id)
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
          </div>
  
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <p>{username}</p>
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
      </Layout>
    );
  };
  
  export default CommentPage;