//sample login form for website - D.B

//Login form for draft/project website
import React, { useState } from "react";
import React from 'react';
import styles from '../css/loginform.css'; // Adjust the path as necessary

const Login = () => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>Sign in to X</h1>
        <button className={styles.appleLogin}>Sign in with Apple</button>
        <button className={styles.googleLogin}>Sign in with Google</button>
        <div className={styles.divider}>or</div>
        <input type="text" placeholder="Phone, email, or username" className={styles.inputField}/>
        <button className={styles.nextButton}>Next</button>
        <a href="#" className={styles.forgotPassword}>Forgot password?</a>
        <div className={styles.signUp}>
          Don't have an account? <a href="#" className={styles.signUpLink}>Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login;