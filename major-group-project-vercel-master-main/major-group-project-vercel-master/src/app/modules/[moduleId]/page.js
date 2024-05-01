"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
import Comment from '../../Components/Comments';

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

const handleViewPost = (post) => {

  setSelectedPost(post);
  setIsModalOpen(true);
  fetch(`/api/getCommentsById?postId=${post._id}`)
  .then((res) => res.json())
  .then((comments) => {
    setComments(comments);
  })
  .catch((error) => {
    console.error('Error fetching comments:', error);
  });
};

const closeModal = () => {
  setIsModalOpen(false);
  setSelectedPost(null);
  setComments([]);
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

const handleDeletePost = async (postId) => {
  try {
    const response = await fetch(`/api/deletePost?postId=${postId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Post deleted successfully');
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } else {
      console.error('Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
  }
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
           <center> <p>No posts to display</p></center>
          )}

          {isModalOpen && (
            <div className="modal-backdrop">
              <div className="modal-content">
                <button onClick={closeModal} className="modal-close-button">X</button>
                <h2>{selectedPost?.title}</h2>
                <p>{selectedPost?.content}</p>
                <hr/>
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
