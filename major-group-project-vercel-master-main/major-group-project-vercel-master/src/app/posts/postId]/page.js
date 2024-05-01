"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Box, TextField } from "@mui/material";
import Layout from '../../Components/Layout';
import '../../css/modulePage.css';
const CommentPage = ({ comment = {}, onCommentUpdate, onDeleteComment, onReplySubmit, currentUser }) => {
    const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const lastReply = comment.replies?.slice(-1)[0] || {};
  const userHasLastReply = lastReply.poster === currentUser;
  const allowReply = !userHasLastReply || comment.replies?.length === 0;

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
      {currentUser !== comment.poster && !isEditing && !isReplying && allowReply && (
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
    </div>
  );

};

export default CommentPage;