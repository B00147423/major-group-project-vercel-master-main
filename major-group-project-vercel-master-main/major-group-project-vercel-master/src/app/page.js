// Home.js
"use client";
import React, { useState, useEffect } from "react";
import Helmet from 'react-helmet';
import VanillaTilt from 'vanilla-tilt';
import "./css/AboutUs.css";
import SignUpModal from '../app/signup/page';
import LoginModal from '../app/login/page';

export default function Home() {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  useEffect(() => {
    VanillaTilt.init(document.querySelectorAll(".card"), {
      max: 25,
      speed: 400,
    });
  }, []);

  const toggleSignUpModal = () => {
    setShowSignUpModal(!showSignUpModal);
  };

  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
  };



  return (
    <>
      <div className="container">
        <div className="card" onClick={toggleSignUpModal}>
          <div className="card-content">
            <h2>01</h2>
            <h3>Sign Up</h3>
            <p>Join our community and unlock the full potential of [Student hub] today! 
              Get access to exclusive features, personalized insights, and our 
              supportive user network. Signing up is quick, easy, and completely free. 
              Start your journey towards a better future now!</p>
            <div className="button">
              <button onClick={toggleSignUpModal}>Sign Up</button>
            </div>
          </div>
        </div>
        <div className="card" onClick={toggleLoginModal}>
          <div className="card-content">
            <h2>02</h2>
            <h3>Login</h3>
            <p>Welcome back to Student hub! Enter your credentials to 
              reconnect with your personalized space. We've missed you! 
              Securely log in to continue your experience where you left off. 
              Not a member yet? Join us today and 
              discover the benefits of being part of our growing community.</p>
            <div className="button">
              <button onClick={toggleLoginModal}>Login</button>
            </div>
          </div>
        </div>
   
      </div>

      {showSignUpModal && <SignUpModal toggleModal={toggleSignUpModal} />}
      {showLoginModal && <LoginModal toggleModal={toggleLoginModal} />}
      
      <Helmet>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.2/vanilla-tilt.min.js"></script>
      </Helmet>
    </>
  );
}