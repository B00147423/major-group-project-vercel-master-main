"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Changed from next/navigation to next/router
import '../css/dashboard.css';
import Layout from '../Components/Layout';
import Header from '../Components/Header'; // Import the Header component

export default function Notification() {
    const [notifications, setNotifications] = useState([]); // Changed from notification to notifications
    const router = useRouter();
    const [notificationCount, setNotificationCount] = useState(0);
    useEffect(() => {
        // Fetch notifications when the component mounts
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notification');
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched notifications:', data.notifications); 
                const fetchedNotifications = data.notifications || []; 
                setNotifications(fetchedNotifications); 
                setNotificationCount(data.count || 0);
            } else {
                console.error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    return (
        <Layout>
            <Header notificationCount={notificationCount}/>
            <div className="main-container">
                <div className="dashboard-container">
                    <section className="main-content">
                        <h2>Notifications</h2>
                        <ul>
                            {notifications.map((notification, index) => (
                                <li key={index} className="notification-item">
                                    <p>{notification.message}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
