"use client"
// LoginModal.js

import React, { useState } from 'react';
import '../css/loginform.css'; // Adjust the path to your CSS file
import ResetPassword from '../Components/ResetPassword';


export default function LoginModal({ toggleModal }) {
    const [popupStyle, setPopupStyle] = useState('hide');
    const [popupMessage, setPopupMessage] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(true);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

    async function runDBCallAsync(url, username) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
  
        if (data.data === "true") {
          console.log("Login Successful!");
          window.location.href = '/dashboard'; // Redirect to dashboard
        } else {
          throw new Error('Invalid username or password');
        }
      } catch (error) {
        setPopupMessage(error.message);
        setPopupStyle('login-popup-show');
        setTimeout(() => setPopupStyle('hide'), 3000);
      }
    }
  
    const handleSubmit = (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      let username = data.get('username');
      let pass = data.get('pass');
      runDBCallAsync(`/api/login?&username=${username}&pass=${pass}`, username);
    };
    
    const toggleResetPasswordModal = () => {
      setShowResetPasswordModal(!showResetPasswordModal);
    }
  return (
    <div className="modal-background">
      <div className="modal-container">
        <button onClick={toggleModal} className="close-modal">X</button>  
          <button className="appleLogin">Sign in with Apple</button>
          <button className="googleLogin">Sign in with Google</button>
         
        <div className="divider">or</div>
        <h1>Sign in</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Phone, email, or username" className="inputField" name="username" required/>
          <input type="password" placeholder="Password" className="inputField" name="pass" required/>
          <button type="submit" className="nextButton">Next</button>
        </form>

        <div className="forgotPassword" onClick={toggleResetPasswordModal}> {/* Add onClick to toggleResetPasswordModal */}
        <a href="#" className="forgotPassword">Forgot password?</a>
        </div>
        
        {showResetPasswordModal && <ResetPassword toggleModal={toggleResetPasswordModal} />} {/* Add showResetPasswordModal */} 
        <div className="signUp">
          Don't have an account? <span className="signUpLink" onClick={toggleModal}>Sign up</span>
        </div>
        <div className={popupStyle}>
        
          <p>{popupMessage}</p>
        </div>
      </div>
    </div>
  );
};
