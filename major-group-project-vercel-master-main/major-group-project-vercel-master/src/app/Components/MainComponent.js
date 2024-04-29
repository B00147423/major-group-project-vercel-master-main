"use client";   
import React, { useState } from 'react';
import LoginModal from '../login/page';
import ResetPassword from '../Components/ResetPassword';
import SignUpModal from '../signup/page';
export default function MainComponent() {
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

    const toggleResetPasswordModal = () => {
        setShowResetPasswordModal(!showResetPasswordModal);
    };

    return (
        <div>
            {showLoginModal && <LoginModal toggleModal={toggleLoginModal} />}
            {showResetPasswordModal && <ResetPassword toggleModal={toggleResetPasswordModal} />}
            {}
        </div>
    );
}