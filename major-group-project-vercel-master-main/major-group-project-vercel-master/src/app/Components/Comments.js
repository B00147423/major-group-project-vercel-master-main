// Comment.js
"use client"
import React, { useState } from 'react';
import { Button, Box, TextField, Typography } from "@mui/material";
import styles from '../../css/Comment.module.css';

const Comment = ({ comment, currentUser, onCommentUpdate, onReplySubmit, onDeleteComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    onDeleteComment(comment._id);
  };

  const handleSaveEdit = () => {
    onCommentUpdate(comment._id, editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  const handleReplyChange = (event) => {
    setReplyContent(event.target.value);
  };

  const handleSubmitReply = () => {
    onReplySubmit(comment._id, replyContent);
    setIsReplying(false);
    setReplyContent('');
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setReplyContent('');
  };

  return (
    <div className={styles['comment-container']}>
      <div className={styles['comment-header']}>
        <Typography variant="subtitle1" component="span">
          {comment.poster}
        </Typography>
        {comment.editedAt && (
          <Typography variant="caption" color="textSecondary" component="span">
            {' (edited at ' + new Date(comment.editedAt).toLocaleString() + ')'}
          </Typography>
        )}
      </div>
      <div className={styles['comment-content']}>
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
        <div className={styles['comment-actions']}>
          <Button onClick={handleEdit} className={styles['action-btn']}>Edit</Button>
          <Button onClick={handleDelete} className={styles['action-btn']}>Delete</Button>
        </div>
      )}
      {currentUser !== comment.poster && !isEditing && !isReplying && (
        <div className={styles['comment-actions']}>
          <Button onClick={() => setIsReplying(true)} className={styles['action-btn']}>Reply</Button>
        </div>
      )}
      {isEditing && (
        <div className={styles['comment-actions']}>
          <Button onClick={handleSaveEdit} className={styles['save-btn']}>Save</Button>
          <Button onClick={handleCancelEdit} className={styles['cancel-btn']}>Cancel</Button>
        </div>
      )}
      {isReplying && (
        <div className={styles['reply-section']}>
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={replyContent}
            onChange={handleReplyChange}
            placeholder="Write a reply..."
          />
          <div className={styles['reply-actions']}>
            <Button onClick={handleSubmitReply} className={styles['action-btn']}>Submit Reply</Button>
            <Button onClick={handleCancelReply} className={styles['action-btn']}>Cancel</Button>
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

export default Comment;
