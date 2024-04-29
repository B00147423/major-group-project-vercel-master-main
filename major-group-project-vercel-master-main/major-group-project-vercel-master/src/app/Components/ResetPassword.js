// ResetPassword.js
"use client"

import React, { useState } from 'react';
import '../css/loginform.css';

export default function ResetPassword({ toggleModal }) {
    const [popupStyle, setPopupStyle] = useState('hide');
    const [popupMessage, setPopupMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const username = formData.get('username');

        console.log("Email: ", email, "Username: ", username);

        try {
            const res = await fetch(`/api/send-reset-email?username=${username}&email=${email}`, {
                method: 'POST',
            });
            const result = await res.json();
            if (res.ok) {
                setPopupMessage('Reset link sent! Check your email.');
            } else {
                throw new Error(result.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Failed to send reset email:', error);
            setPopupMessage(error.message || 'Failed to send reset email.');
        } finally {
            setPopupStyle('login-popup-show');
            setTimeout(() => setPopupStyle('hide'), 3000);
        }
    };

    return (
        <div className="modal-background">
            <div className="modal-container">
                <button onClick={toggleModal} className="close-modal">X</button>
                <h1>Reset Password</h1>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username" className="inputField" name="username" required/>
                    <input type="email" placeholder="Email" className="inputField" name="email" required/>
                    <button type="submit" className="nextButton">Send Reset Link</button>
                </form>
                <div className={popupStyle}>
                    <p>{popupMessage}</p>
                </div>
            </div>
        </div>
    );
}
