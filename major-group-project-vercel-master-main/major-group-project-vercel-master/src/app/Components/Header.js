// components/Header.js
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Use 'next/router' instead of 'next/navigation'
import Link from 'next/link'; // Import Link from next/link
import '../css/header.css';
import SvgIcon from '@mui/material/SvgIcon';

const Header = ({ setSearchResults }) => {
  const [username, setUsername] = useState('');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const notificationRef = useRef(null);

  const getUsernameFromCookies = () => {
    const allCookies = document.cookie.split('; ');
    const usernameCookie = allCookies.find(cookie => cookie.startsWith('username='));
    return usernameCookie ? decodeURIComponent(usernameCookie.split('=')[1]) : '';
  };

  const toggleNotificationsDropdown = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
  };

   // Handle click outside dropdown
   const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotificationsDropdown(false);
    }
  };


    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
      // Add event listener when the component is mounted
      document.addEventListener("mousedown", handleClickOutside);
  
      // Return function to be called when unmounted
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setIsSearchExpanded(false);
    }
  };

  useEffect(() => {
    const username = getUsernameFromCookies();
    setUsername(username);
    if (!username) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const username = getUsernameFromCookies();
      try {
        const response = await fetch('/api/notification');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data.notifications);
        setNotificationCount(data.notifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(`/api/getSearch?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        console.error('Failed to fetch search results');
        return;
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  return (
    <div className="side-bar-header">
      <div className="profile-section">
        <div className="username-notification-container">
          <div className="username-display">{username}</div>
          <div className="notification-container" ref={notificationRef}>
            <button onClick={toggleNotificationsDropdown}>🔔</button>
            <span
              className={`notification-count ${notificationCount > 0 ? 'has-notifications' : ''}`}
              onClick={toggleNotificationsDropdown}
            >
              {notificationCount}
            </span>
            {showNotificationsDropdown && (
              <div className="dropdown-menu">
                {notifications.map((notification, index) => (
                  <div key={index} className="dropdown-item">
                    {notification.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={`search-bar ${isSearchExpanded ? 'expanded' : ''}`}>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setIsSearchExpanded(true)}
            onBlur={() => !searchQuery && setIsSearchExpanded(false)}
            className="search-input"
          />
          <button className="search-icon" onClick={handleSearch}>🔎</button>
        </div>
        <Link href="/dashboard" className="menu-item">
          
          🏠 Dashboard
          
        </Link>
        <div className="menu-item" onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}>
          
          ⚙️ Settings {showSettingsDropdown ? '▲' : '▼'}
          
        </div>
        {showSettingsDropdown && (
          <div className="profile-dropdown">
            <Link href="/settings" legacyBehavior>
              <a className="dropdown-item">Edit Settings</a>
            </Link>
          </div>
        )}
        <div className="menu-item" onClick={handleLogout}>Log out @{username}</div>
      </div>
    </div>
  );
};

export default Header;
