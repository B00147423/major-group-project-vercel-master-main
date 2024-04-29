"use client";
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from "@mui/material";
import Link from 'next/link'; 
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
import Comment from '../../Components/Comments';

const ModulePage = () => {
  const [moduleInfo, setModuleInfo] = useState({});
  const [threads, setThreads] = useState([]);
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [username, setUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchModuleDetails = async () => {
      if (!router.query.moduleId) return;

      try {
        const response = await fetch(`/api/threads?moduleId=${router.query.moduleId}`);
        if (!response.ok) throw new Error('Failed to fetch module details');
        const data = await response.json();
        setModuleInfo(data.module || {});
        setThreads(data.threads || []);
      } catch (error) {
        console.error('Error fetching module details:', error);
      }
    };

    fetchModuleDetails();
  }, [router.query.moduleId]);

  useEffect(() => {
    const fetchPostsForModule = async () => {
      if (!router.query.moduleId) return;
      try {
        const response = await fetch(`/api/getPostByModule?moduleId=${router.query.moduleId}`);
        if (!response.ok) throw new Error('Failed to fetch posts for module');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts for module:', error);
      }
    };

    fetchPostsForModule();
  }, [router.query.moduleId]);

  useEffect(() => {
    const fetchAnnouncementsForModule = async () => {
      if (!router.query.moduleId) return;
      try {
        const response = await fetch(`/api/getAnnouncements?moduleId=${router.query.moduleId}`);
        if (!response.ok) throw new Error('Failed to fetch announcements for module');
        const data = await response.json();
        setAnnouncements(data || []); // Set announcements directly
      } catch (error) {
        console.error('Error fetching announcements for module:', error);
      }
    };

    fetchAnnouncementsForModule();
  }, [router.query.moduleId]);

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

  const handleCreatePost = () => {
    router.push('/createPost');
  };

  const handleCreateAnnouncement = () => {
    router.push('/createAnnouncement');
  };

  // Other functions like handleSubmit, handleReplySubmit, handleViewPost, closeModal, handleDeleteComment, handleDeletePost, and onCommentUpdate remain the same

  return (
    <Layout>
      <div className='container'>
        {moduleInfo && moduleInfo.title ? (
          <div className='forum-container'>
            <center>
              <h1>{moduleInfo.title}</h1>
              <p>{moduleInfo.description}</p>
              <Button variant="contained" color="primary" onClick={handleCreatePost}>
                Create Post
              </Button>
              {email === moduleInfo.lecturer && (
                <Button variant="contained" color="primary" onClick={handleCreateAnnouncement}>
                  Create Announcement
                </Button>
              )}
            </center>
            <br />
            <br />
            <center><h1>Announcements</h1></center>
            <br />
            <br />
            {/* Render Announcements Here */}
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <div key={index} className="announcement" id={`announcement-${announcement._id || index}`}>
                  <h4>{announcement.title}</h4>
                  <p>{announcement.content}</p>
                </div>
              ))
            ) : (
              <center><p>No announcements to display</p></center>
            )}
            <br />
            <br />
            <center><h1>Posts</h1></center>
            {/* Rendering Posts Here */}
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={post._id || index} className="post" id={`post-${post._id || index}`}>
                  <h4>Creator: {post.poster}</h4>
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  <button onClick={() => handleViewPost(post)}>
                    View Post
                  </button>
                  {/* Add delete button */}
                  {(username === post.poster || email === moduleInfo.lecturer || email === moduleInfo.moderator) && (
                    <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                  )}
                </div>
              ))
            ) : (
              <center><p>No posts to display</p></center>
            )}

            {isModalOpen && (
              <div className="modal-backdrop">
                <div className="modal-content">
                  <button onClick={closeModal} className="modal-close-button">X</button>
                  <h2>{selectedPost?.title}</h2>
                  <p>{selectedPost?.content}</p>
                  <hr />
                  <div className="forum-container">
                    <h3>Comments:</h3>
                    <div className="comment-list">
                      {comments
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
              </div>
            )}
          </div>
        ) : (
          <center><p>Loading module details...</p></center>
        )}
      </div>
    </Layout>
  );
};

export default ModulePage;
