
"use client"
import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import css from '../css/settings.css';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [year, setYear] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  

  const handleNotificationToggle = async () => {
    const newNotificationsEnabled = !notificationsEnabled;
    setNotificationsEnabled(!notificationsEnabled);

    try {
      const response = await fetch(`/api/NotificationPreferences?username=${currentUsername}&notificationsEnabled=${newNotificationsEnabled}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // Include authorization headers if necessary
            },
        });

        if (!response.ok) {
            throw new Error('Failed to update notification settings');
        }

        const data = await response.json();
        console.log('Notification settings updated:', data);
    } catch (error) {
        console.error('Error updating notification settings:', error);
        setErrorMessage('Failed to update notification settings');
        // Revert toggle state in case of failure
        setNotificationsEnabled(!newNotificationsEnabled);
    }
};

useEffect(() => {
  const fetchUserInfo = async () => {
    const userId = getUserIdFromCookies();
    if (!userId) {
      console.log("User ID not found.");
      return;
    }

    try {
      const res = await fetch(`/api/getUserInfo?userId=${userId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch user information");
      }

      const { user } = await res.json();
      if (user && user.length > 0) {
        const userInfo = user[0]; // Assuming the result is an array with a single user object

        // Update state with fetched data
        setCurrentUsername(userInfo.username);
        setEmail(userInfo.email);
        setCode(userInfo.code);
        setYear(userInfo.year);
        setNotificationsEnabled(userInfo.notificationsEnabled); // Update this line according to your actual data
      }
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  };

  fetchUserInfo();
}, []);




  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleCurrentPasswordChange = (e) => {
    setCurrentPassword(e.target.value);
  };
  
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  
  const handleDeleteAccount = () => {
    // Add logic to handle account deletion
    console.log('Account deletion requested');
  };
  
  useEffect(() => {
    // Fetch the current username and userId from cookies
    const username = getUsernameFromCookies();
    const userId = getUserIdFromCookies();
    setCurrentUsername(username);
    setUserId(userId);
    if (!username || !userId) {
      router.replace('/login');
    }
  }, [router]);

  const getUsernameFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
    return usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
  };

  const getUserIdFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const userIdCookie = allCookies.find(cookie => cookie.startsWith('userId='));
    return userIdCookie ? decodeURIComponent(userIdCookie.split('=')[1]) : null;
  };

  
  const handleEditClick = () => {
    setIsEditing(true);
    setNewUsername(currentUsername);
  };

  const handleSaveClick = async (event) => {
    event.preventDefault();
    if (!userId) {
      setErrorMessage('User ID not found. Please log in again.');
      return;
    }
  
    try {
      const updateResponse = await fetch(`/api/updateUser`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newUsername: newUsername !== '' ? newUsername : currentUsername,
          email,
          code,
          year,
        }),
      });
  
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update user information');
      }
  
      const responseData = await updateResponse.json();
      console.log('User information updated successfully', responseData);
  
      document.cookie = `username=${newUsername}; path=/`; // Update cookie if needed
      setCurrentUsername(newUsername);
      setIsEditing(false);
      setErrorMessage(''); // Clear any previous error messages
    } catch (error) {
      console.error('Error updating user information:', error);
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = getUserIdFromCookies();
      if (!userId) {
        console.log("User ID not found.");
        return;
      }
    
      try {
        const res = await fetch(`/api/getUserInfo?userId=${userId}`);
    
        if (!res.ok) {
          throw new Error("Failed to fetch user information");
        }
    
        const { user } = await res.json();
        if (user && user.length > 0) {
          const userInfo = user[0]; // Assuming the result is an array with a single user object
        
  
          // Update state with fetched data, excluding dob and password

          setCurrentUsername(userInfo.username);
          setEmail(userInfo.email);
          setCode(userInfo.code); // Example additional fields
          setYear(userInfo.year); // Adjust according to your data structure
        
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };
  
    fetchUserInfo();
  }, []);

  const handlePasswordChange = async () => {
    // Validate password inputs
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
  
    try {
      // Send a request to update the password
      const response = await fetch(`/api/updateUserPassword`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
  
      // Clear the input fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
  
      // Optionally, you can display a success message or perform other actions here
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      setErrorMessage('Failed to update password');
    }
  };
  
  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset the edited fields to their original values
    setNewUsername(currentUsername);
    setEmail(email); // Use the state variable instead of userInfo.email
    setCode(code); // Use the state variable instead of userInfo.address
    setYear(year); // Use the state variable instead of userInfo.year
    // If you have error messages, you might want to clear them too
    setErrorMessage('');
  };


    return (

 <Layout>
    <div className="settings-container">
      <h1>Account Settings</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div>
        <strong>Profile Information</strong>
        <div>
          <input
          className={isEditing ? 'input-enabled' : 'input-disabled'}
            id="username"
            type="text"
            value={isEditing ? newUsername : currentUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            disabled={!isEditing}
            style={{ backgroundColor: isEditing ? 'white' : 'lightgray' }}
            required
        />

          <label>Email:</label>
          <input
              className={isEditing ? 'input-enabled' : 'input-disabled'}
              id='email'
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={!isEditing}
              style={{ backgroundColor: isEditing ? 'white' : 'lightgray' }}
              required
            />
          <label>Code:</label>
            <input
              className={isEditing ? 'input-enabled' : 'input-disabled'}
              id='code'
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!isEditing}
              style={{ backgroundColor: isEditing ? 'white' : 'lightgray' }}
              required
            />
          <label>Year:</label>



            <select  className={isEditing ? 'input-enabled' : 'input-disabled'}
              id='year'
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={!isEditing}
              style={{ backgroundColor: isEditing ? 'white' : 'lightgray' }}
              required>
              <option value="">Select Year</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
              <div>
                <button onClick={handleSaveClick}>Save Profile Information</button>
                <button
                  onClick={isEditing ? handleCancelClick : handleEditClick}
                  className={isEditing ? 'cancel-button' : 'edit-button'}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile Information'}
                </button>
              </div>
          </div>

        <strong>Update Password</strong>
        
        <div>
          <label>Current Password:</label>
          <input
          id='currentPassword'
            type="password"
            placeholder="Current Password"
            onChange={handleCurrentPasswordChange}
            required
          />
          <label>New Password:</label>
          <input
          id='newPassword'
            type="password"
            placeholder="New Password"
            onChange={handleNewPasswordChange}
            required
          />
          <label>Confirm New Password:</label>
          <input
          id='confirmPassword'
            type="password"
            placeholder="Confirm Password"
            onChange={handleConfirmPasswordChange}
            required
          />
          <button onClick={handlePasswordChange}>Save New Password</button>
        </div>
        <div>
          <strong>Notification Settings</strong>
          <label className="switch">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={handleNotificationToggle}
            />
            <span className="slider round"></span>
          </label>
        </div>



        <strong>Delete Account</strong>
        <div>
          <button className="delete-button" onClick={handleDeleteAccount}>Delete Account</button>
        </div>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  </Layout>
);
}