"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField, Typography } from "@mui/material"; // Import Typography from Material-UI
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';

const CommentPage = ({ comment = {}, onCommentUpdate, onDeleteComment, onReplySubmit, currentUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [comments, setComments] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null); // Assuming selectedPost is received as a prop

    useEffect(() => {
        if (selectedPost && selectedPost._id) {
            fetchComments(selectedPost._id);
        }
    }, [selectedPost]);

    const fetchComments = async (postId) => {
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

    const handleEdit = () => {
        setIsEditing(true);
        setEditedContent(comment.content);
    };

    const handleReplyChange = (event) => {
        setReplyContent(event.target.value);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(comment.content);
    };

    const handleSubmitReply = async () => {
        const success = await onReplySubmit(comment._id, replyContent);
        if (success) {
            setReplyContent('');
            setIsReplying(false);
        } else {
            alert('Failed to submit reply.');
        }
    };

    const handleCancelReply = () => {
        setReplyContent('');
        setIsReplying(false);
    };

    const handleSaveEdit = async () => {
        if (editedContent.trim() === '') {
            // Content cannot be empty
            return;
        }

        setIsEditing(false);
        // Call the onCommentUpdate function with the updated content
        await onCommentUpdate(comment._id, editedContent);
    };

    const handleDelete = () => {
        // Call the onDeleteComment function with the comment ID
        onDeleteComment(comment._id);
    };

    return (
        <div className='comment-container'>
            <div className='comment-header'>
                <Typography variant="subtitle1" component="span">
                    {comment.poster}
                </Typography>
                {comment.editedAt && (
                    <Typography variant="caption" color="textSecondary" component="span">
                        {' (edited at ' + new Date(comment.editedAt).toLocaleString() + ')'}
                    </Typography>
                )}
            </div>
            <div className='comment-content'>
                {isEditing ? (
                    <TextField
                        multiline
                        fullWidth
                        variant="outlined"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                    />
                ) : (
                    <Typography variant="body1">{comment.content}</Typography>
                )}
            </div>
            {currentUser === comment.poster && !isEditing && (
                <div className='comment-actions'>
                    <Button onClick={handleEdit} className='action-btn'>Edit</Button>
                    <Button onClick={handleDelete} className='action-btn'>Delete</Button>
                </div>
            )}
            {currentUser !== comment.poster && !isEditing && !isReplying && (
                <div className='comment-actions'>
                    <Button onClick={() => setIsReplying(true)} className='action-btn'>Reply</Button>
                </div>
            )}
            
            {isEditing && (
                <div className='comment-actions'>
                    <Button onClick={handleSaveEdit} className='save-btn'>Save</Button>
                    <Button onClick={handleCancelEdit} className='cancel-btn'>Cancel</Button>
                </div>
            )}
            {isReplying && (
                <div className='reply-section'>
                    <TextField
                        multiline
                        fullWidth
                        variant="outlined"
                        value={replyContent}
                        onChange={handleReplyChange}
                        placeholder="Write a reply..."
                    />
                    <div className='reply-actions'>
                        <Button onClick={handleSubmitReply} className='action-btn'>Submit Reply</Button>
                        <Button onClick={handleCancelReply} className='action-btn'>Cancel</Button>
                    </div>
                </div>
            )}
            {comment.replies && comment.replies.map((reply, index) => (
                <div key={index} style={{ marginLeft: '20px' }}>
                    <Typography variant="body1">
                        <strong>{reply.poster}</strong>: {reply.content}
                    </Typography>
                </div>
            ))}
            <div className="comment-list">
                {comments.map((comment, index) => (
                    <Comment
                        key={index}
                        comment={comment}
                        onCommentUpdate={onCommentUpdate}
                        onReplySubmit={handleReplySubmit}
                        onDeleteComment={handleDeleteComment} // Pass the onDeleteComment function
                        currentUser={currentUser}
                        // Add any other necessary props
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentPage;