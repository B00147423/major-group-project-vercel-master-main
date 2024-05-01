"use client";
import React, { useEffect, useState } from 'react';
import { Button, Box, TextField, Typography } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';

const CommentPage = () => {
  const [username, setUsername] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [moduleInfo, setModuleInfo] = useState({});
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');

  useEffect(() => {
    // Fetch module details and related data when component mounts
    fetchModuleDetails();
    getUsernameFromCookies();
    fetchUserInfo();
  }, []);

  useEffect(() => {
    // Fetch posts for the module when moduleId changes
    if (moduleId) {
      fetchPostsForModule();
    }
  }, [moduleId]);

  useEffect(() => {
    // Fetch announcements for the module when moduleId changes
    if (moduleId) {
      fetchAnnouncementsForModule();
    }
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    // Fetch module details using the moduleId
    try {
      // Your API call to fetch module details
      const moduleData = await fetch(`/api/moduleDetails?moduleId=${moduleId}`);
      const moduleInfo = await moduleData.json();
      setModuleInfo(moduleInfo);
    } catch (error) {
      console.error('Error fetching module details:', error);
    }
  };

  const getUsernameFromCookies = () => {
    // Function to get username from cookies
    const allCookies = document.cookie.split('; ');
    const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
    const usernameFromCookies = usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
    setUsername(usernameFromCookies);
  };

  const fetchUserInfo = async () => {
    // Fetch user information using cookies
    // Implement your logic here
  };

  const fetchPostsForModule = async () => {
    // Fetch posts for the module
    try {
      // Your API call to fetch posts for the module
      const postsData = await fetch(`/api/postsByModule?moduleId=${moduleId}`);
      const posts = await postsData.json();
      setPosts(posts);
    } catch (error) {
      console.error('Error fetching posts for module:', error);
    }
  };

  const fetchAnnouncementsForModule = async () => {
    // Fetch announcements for the module
    try {
      // Your API call to fetch announcements for the module
      const announcementsData = await fetch(`/api/announcementsByModule?moduleId=${moduleId}`);
      const announcements = await announcementsData.json();
      setAnnouncements(announcements);
    } catch (error) {
      console.error('Error fetching announcements for module:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const content = newCommentContent.trim();
    
    if (!content || !username || !selectedPost) return; // Basic validation

    const timestamp = new Date();
    const poster = username;
    const postId = selectedPost._id;

    try {
      const response = await fetch(`/api/createComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ poster, content, timestamp, postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const newComment = { poster, content, timestamp, postId };
      setComments(prevComments => [...prevComments, newComment]);
      setNewCommentContent(''); // Clear comment content
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/deleteComment?commentId=${commentId}`, {
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

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      const response = await fetch(`/api/updateComment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId, content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      setComments(prevComments =>
        prevComments.map(comment =>
          comment._id === commentId ? { ...comment, content: newContent } : comment
        )
      );
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  return (
    <Layout>
      <div className='container'>
        {/* Render comments */}
        {selectedPost && (
          <div className="comment-section">
            <h2>Comments for Post: {selectedPost.title}</h2>
            <div className="comment-list">
              {comments
                .filter((comment) => comment.postId === selectedPost._id)
                .map((comment, index) => (
                  <div key={comment._id || index} className="comment" id={`comment-${comment._id || index}`}>
                    <p>{comment.content}</p>
                    {username === comment.poster && (
                      <>
                        <Button onClick={() => handleDeleteComment(comment._id)}>Delete</Button>
                        <Button onClick={() => handleUpdateComment(comment._id, 'Updated content')}>Update</Button>
                      </>
                    )}
                  </div>
                ))}
            </div>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                name="content"
                label="Content"
                type="text"
                id="content"
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
              />
              <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>Submit</Button>
            </Box>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CommentPage;

