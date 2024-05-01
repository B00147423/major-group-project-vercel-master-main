import React from 'react';
import { Box, Typography } from "@mui/material";
import Layout from '../../Components/Layout';

export async function getServerSideProps(context) {
    const { postId } = context.params; // Access postId directly from the URL params

    try {

        // Fetch comments
        const commentsRes = await fetch(`http://example.com/api/getComments?postId=${postId}`);
        const comments = await commentsRes.json();

        // Pass post and comments as props
        return { props: { post, comments } };
    } catch (error) {
        console.error('Error fetching post details:', error);
        return { props: { post: {}, comments: [] } };
    }
}

const CommentPage = ({ post, comments }) => {
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