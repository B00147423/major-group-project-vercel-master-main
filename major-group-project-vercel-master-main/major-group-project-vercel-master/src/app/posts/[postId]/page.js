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

    useEffect(() => {
      function fetchPostDetails(postId) {
        // Function to fetch post details and comments
        const fetchPost = async () => {
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
        
        fetchPost();
      }

      // Only proceed if postId is available
      if (router.isReady && router.query.postId) {
        fetchPostDetails(router.query.postId);
      }
    }, [router.isReady, router.query.postId]); // Dependency on router.isReady and router.query.postId

    return (
      <Layout>
        <div className='container'>
          {post && (
            <>
              <Typography variant="h4">{post.title}</Typography>
              <Typography paragraph>{post.content}</Typography>
            </>
          )}
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