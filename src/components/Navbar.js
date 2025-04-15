import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For routing, if using React Router
import { FaHome, FaExclamationCircle, FaCamera } from 'react-icons/fa'; // Icons for Navbar

const NavBar = () => {
  const [activePage, setActivePage] = useState('home'); // State to track active page

  const handleClick = (page) => {
    setActivePage(page); // Set the active page when clicked
  };

  return (
    <div style={styles.navContainer}>
      <ul style={styles.navList}>
        <li 
          style={activePage === 'home' ? styles.activeLink : styles.navLink}
          onClick={() => handleClick('home')}
        >
          <Link to="/" style={styles.navLinkText}>
            <FaHome style={styles.icon} /> Home
          </Link>
        </li>
        <li 
          style={activePage === 'invalidData' ? styles.activeLink : styles.navLink}
          onClick={() => handleClick('invalidData')}
        >
          <Link to="/invalid-data" style={styles.navLinkText}>
            <FaExclamationCircle style={styles.icon} /> Invalid Data
          </Link>
        </li>
        <li 
          style={activePage === 'verify' ? styles.activeLink : styles.navLink}
          onClick={() => handleClick('verify')}
        >
          <Link to="/verify" style={styles.navLinkText}>
            <FaCamera style={styles.icon} /> Verify QR
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NavBar;

// Inline styles for the NavBar
const styles = {
  navContainer: {
    backgroundColor: '#2b6cb0',
    padding: '10px 20px',
    marginBottom: '20px',
  },
  navList: {
    display: 'flex',
    justifyContent: 'space-around',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  navLink: {
    color: 'white',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  activeLink: {
    backgroundColor: '#3182ce',
    borderRadius: '6px',
    color: 'white',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  navLinkText: {
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '8px',
  },
};
