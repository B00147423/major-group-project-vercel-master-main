// components/Layout.js
import React from 'react';
import Header from './Header';
import Footer from './Footer'; // Import the Footer component
import styles from '../css/layout.module.css';

const Layout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer /> {/* Use the Footer component here */}
    </div>
  );
};

export default Layout;