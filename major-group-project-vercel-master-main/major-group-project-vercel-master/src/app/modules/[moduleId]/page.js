"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';

const ModulePage = () => {
  const [moduleInfo, setModuleInfo] = useState({});
  const [threads, setThreads] = useState([]);
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [username, setUsername] = useState('');
  const router = useRouter();
  const moduleId = localStorage.getItem('currentModuleId');
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (router.query && router.query.moduleId) {
      const { moduleId } = router.query;
      setModuleId(moduleId);
      fetchPostsByModule(moduleId);
    }
  }, [router.query]);

  

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

  useEffect(() => {
    const fetchModuleDetails = async () => {
      if (!moduleId) return;

      try {
        const response = await fetch(`/api/threads?moduleId=${moduleId}`);
        if (!response.ok) throw new Error('Failed to fetch module details');
        const data = await response.json();
        setModuleInfo(data.module || {});
        setThreads(data.threads || []);
      } catch (error) {
        console.error('Error fetching module details:', error);
      }
    };

    fetchModuleDetails();
  }, [moduleId]);

  useEffect(() => {
    const fetchPostsForModule = async () => {
      if (!moduleId) return;
      try {
        const response = await fetch(`/api/getPostByModule?moduleId=${moduleId}`);
        if (!response.ok) throw new Error('Failed to fetch posts for module');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching posts for module:', error);
      }
    };

    fetchPostsForModule();
  }, [moduleId]);

  useEffect(() => {
    const fetchAnnouncementsForModule = async () => {
      if (!moduleId) return;
      try {
        const response = await fetch(`/api/getAnnouncements?moduleId=${moduleId}`);
        if (!response.ok) throw new Error('Failed to fetch announcements for module');
        const data = await response.json();
        setAnnouncements(data || []); // Set announcements directly
      } catch (error) {
        console.error('Error fetching announcements for module:', error);
      }
    };

    fetchAnnouncementsForModule();
  }, [moduleId]);

  const getUserIdFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const userIdCookie = allCookies.find(cookie => cookie.startsWith('userId='));
    return userIdCookie ? decodeURIComponent(userIdCookie.split('=')[1]) : null;
  };

  const handleCreatePost = () => {
    if (typeof window !== 'undefined'){
      localStorage.setItem('currentModuleId', moduleId);
    } 
    router.push('/createPost');
  };

  const handleCreateAnnouncement = () => {
    if (typeof window !=='undefined'){
      localStorage.setItem('currentModuleId', moduleId);
    }
    
    router.push('/createAnnouncement');
  };



const handleViewPost = (postId) => {
  localStorage.setItem('currentPostId', postId);
  router.push(`/posts/${postId}`);
};





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
            {email == moduleInfo.lecturer && (
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
                <button onClick={() => handleViewPost(post._id)}>
                  View Comments
                </button>
                {/* Add delete button */}
                {(username === post.poster || email === moduleInfo.lecturer || email === moduleInfo.moderator) && (
                  <button onClick={() => handleDeletePost(post._id)}>Delete</button>
                )}
              </div>
            ))
          ) : (
           <center> <p>No posts to display</p></center>
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