"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField, Typography } from "@mui/material"; // Import Typography from Material-UI
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
import styles from '../../css/Comment.module.css';

const CommentPage = () => {
    const router = useRouter();
    const [post, setPost] = useState({});
    const [comments, setComments] = useState([]);
  
    // Fetch the post and comments based on postId from the URL
    useEffect(() => {
      const fetchPostDetails = async () => {
        const postId = router.query.postId; // Retrieve postId from URL
        if (!postId) return;
  
        try {
          const postResponse = await fetch(`/api/getPostDetails?postId=${postId}`);
          if (!postResponse.ok) throw new Error('Failed to fetch post details');
          const postData = await postResponse.json();
          setPost(postData.post);
  
          const commentsResponse = await fetch(`/api/getComments?postId=${postId}`);
          if (!commentsResponse.ok) throw new Error('Failed to fetch comments');
          const commentsData = await commentsResponse.json();
          setComments(commentsData.comments);
        } catch (error) {
          console.error('Error fetching post details:', error);
        }
      };
  
      fetchPostDetails();
    }, [router.query.postId]); // React on changes to postId in the URL
  
    return (
      <Layout>
        <div className='container'>
          <Typography variant="h4">{post.title}</Typography>
          <Typography paragraph>{post.content}</Typography>
          <Box>
            {comments.map((comment, index) => (
              <div key={index}>
                <Typography>{comment.username}: {comment.content}</Typography>
              </div>
            ))}
          </Box>
        </div>
      </Layout>
    );
  };
  
  export default CommentPage;