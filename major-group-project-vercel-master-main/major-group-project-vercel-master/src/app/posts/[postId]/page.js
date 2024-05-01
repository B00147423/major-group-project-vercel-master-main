"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField, Typography } from "@mui/material"; // Import Typography from Material-UI
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
import styles from '../../css/Comment.module.css';


const CommentPage = () => {
    const [username, setUsername] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const router = useRouter();
    const postId = localStorage.getItem('currentPostId');
    const [comments, setComments] = useState([]);
  
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
      if (router.query && router.query.moduleId) {
        const { moduleId } = router.query;
        // Assuming setModuleId is defined or imported properly
        setModuleId(moduleId); // Assuming setModuleId is defined or imported properly
        fetchPostsByModule(moduleId); // Assuming fetchPostsByModule is defined or imported properly
      }
    }, [router.query]);
  
    useEffect(() => {
      if (router.isReady) {
        const postId = router.query.postId; // Get the postId from the URL
        fetchComments(postId);
      }
    }, [router.isReady, router.query.postId]);
  
    const fetchComments = async (postId) => {
      try {
        const response = await fetch(`/api/getCommentsById?postId=${postId}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        setComments(data); // Set the fetched comments to state
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
  
    const handleCreateComment = () => {
      if (typeof window !== 'undefined'){
        localStorage.setItem('currentPostId', postId);
      } 
      router.push('/createComment');
    };
  
    const handleCreateReply = async (commentId, replyContent) => {
      const url = `/api/postReply?parentCommentId=${commentId}&poster=${username}&content=${replyContent}&timestamp=${new Date().toISOString()}`;
      
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
          if (comment._id === commentId) {
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
          // Add any necessary headers or authentication tokens
        });
  
        if (response.ok) {
          console.log('Comment deleted successfully');
          setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
        } else {
          console.error('Failed to delete comment');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    };
  
    const handleDeleteReply = async (commentId, replyId) => {
      try {
        const response = await fetch(`/api/deleteReply?commentId=${commentId}&replyId=${replyId}`, {
          method: 'DELETE',
          // Add any necessary headers or authentication tokens
        });
  
        if (response.ok) {
          console.log('Reply deleted successfully');
          setComments(prevComments =>
            prevComments.map(comment => {
              if (comment._id === commentId) {
                const updatedReplies = comment.replies.filter(reply => reply._id !== replyId);
                return { ...comment, replies: updatedReplies };
              }
              return comment;
            })
          );
        } else {
          console.error('Failed to delete reply');
        }
      } catch (error) {
        console.error('Error deleting reply:', error);
      }
    };
  
    const handleReplySubmit = async (commentId, replyContent) => {
      if (!replyContent) return; // Basic validation for empty input
  
      try {
        const success = await handleCreateReply(commentId, replyContent);
        if (success) {
          // Clear input field or update UI as needed
          setReplyContent('');
        } else {
          // Handle failure or display error message
        }
      } catch (error) {
        // Handle error
        console.error('Error creating reply:', error);
      }
    };
  
    return (
      <Layout>
        <div className='container'>
          <Typography variant="h4" style={{ marginTop: '20px' }}>Comments Section</Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              name="content"
              label="Write a comment..."
              type="text"
              id="content"
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, mb: 2 }}>
              Submit Comment
            </Button>
          </Box>
  
          <div className="comment-list">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} style={{ marginTop: '10px' }}>
                  <Typography variant="subtitle1">{comment.username}</Typography>
                  <Typography variant="body1">{comment.content}</Typography>
                  <Button onClick={() => handleDeleteComment(comment._id)}>Delete Comment</Button>
                  {comment.replies.map((reply, index) => (
                    <div key={index}>
                      <Typography variant="subtitle2">{reply.poster}</Typography>
                      <Typography variant="body2">{reply.content}</Typography>
                      <Button onClick={() => handleDeleteReply(comment._id, reply._id)}>Delete Reply</Button>
                    </div>
                  ))}
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleReplySubmit(comment._id, replyContent); }} noValidate sx={{ mt: 3 }}>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="replyContent"
                      label="Write a reply..."
                      type="text"
                      id="replyContent"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, mb: 2 }}>
                      Submit Reply
                    </Button>
                  </Box>
                </div>
              ))
            ) : (
              <Typography variant="body2">No comments yet. Be the first to comment!</Typography>
            )}
          </div>
        </div>
      </Layout>
    );
  };
  
  export default CommentPage;
  