import React from 'react';
import '../css/modal.css'; // Assuming you will create a CSS file for the modal

const Modal = ({ onClose, children }) => {
  const handleBackdropClick = (event) => {
    // Prevents modal content click from closing the modal
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;