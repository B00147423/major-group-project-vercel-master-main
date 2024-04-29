import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import styles from '../css/Comment.module.css';


const Comment = ({ comment, onCommentUpdate, onDeleteComment, onReplySubmit, currentUser }) => {
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

  const submitReply = () => {
    if (replyContent.trim() === '') {
      // Don't submit empty replies
      return;
    }
    onReplySubmit(comment._id, replyContent);
    setReplyContent(''); // Clear the input field
    setIsReplying(false); // Hide the reply input field
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
      {currentUser !== comment.poster && !isEditing && !isReplying && allowReply && (
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
