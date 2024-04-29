"use client"
//C:\Users\beka\OneDrive\TU DUBLIN\Y3\Sem1\web app\majorproject\Major-Group-Project-Student-Network-Website\major-group-project\src\app\reset-password\page.js
// ResetPasswordPage.js
import React, { useState } from 'react';

import '../css/loginform.css';

export default function ResetPasswordPage({ toggleModal }) {
    const [popupStyle, setPopupStyle] = useState('hide');
    const [popupMessage, setPopupMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (newPassword !== repeatPassword) {
            setPopupMessage('Passwords do not match');
            setPopupStyle('login-popup-show');
            setTimeout(() => setPopupStyle('hide'), 3000);
            return;
        }

        const token = new URLSearchParams(window.location.search).get('token');

        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword,
                }),
            });

            if (res.ok) {
                setPopupMessage('Password reset successfully!');
            } else {
                const result = await res.json();
                throw new Error(result.error || 'Something went wrong');
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
            setPopupMessage(error.message || 'Failed to reset password.');
        } finally {
            setPopupStyle('login-popup-show');
            setTimeout(() => setPopupStyle('hide'), 3000);
        }
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
        // Check if the passwords match whenever the new password changes
        if (e.target.value !== repeatPassword) {
            setPopupMessage('Passwords do not match');
            setPopupStyle('login-popup-show');
        } else {
            setPopupMessage('');
            setPopupStyle('hide');
        }
    };

    const handleRepeatPasswordChange = (e) => {
        setRepeatPassword(e.target.value);
        // Check if the passwords match whenever the repeated password changes
        if (e.target.value !== newPassword) {
            setPopupMessage('Passwords do not match');
            setPopupStyle('login-popup-show');
        } else {
            setPopupMessage('');
            setPopupStyle('hide');
        }
    };

    return (
        <div className="modal-background">
            <div className="modal-container">
                <button onClick={toggleModal} className="close-modal">X</button>
                <h1>Reset Password</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New Password"
                        className="inputField"
                        value={newPassword}
                        onChange={handleNewPasswordChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Repeat Password"
                        className="inputField"
                        value={repeatPassword}
                        onChange={handleRepeatPasswordChange}
                        required
                    />
                    <button type="submit" className="nextButton">Reset Password</button>
                </form>
                <div className={popupStyle}>
                    <p>{popupMessage}</p>
                </div>
            </div>
        </div>
    );
}
