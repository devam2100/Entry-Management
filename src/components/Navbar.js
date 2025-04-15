import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaExclamationCircle, FaCamera } from 'react-icons/fa';

const NavBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div style={styles.navContainer}>
      <ul style={styles.navList}>
        <li style={currentPath === '/' ? styles.activeLink : styles.navLink}>
          <Link to="/" style={styles.navLinkText}>
            <FaHome style={styles.icon} /> Home
          </Link>
        </li>
        <li style={currentPath === '/invalid-data' ? styles.activeLink : styles.navLink}>
          <Link to="/invalid-data" style={styles.navLinkText}>
            <FaExclamationCircle style={styles.icon} /> Invalid Data
          </Link>
        </li>
        <li style={currentPath === '/verify' ? styles.activeLink : styles.navLink}>
          <Link to="/verify" style={styles.navLinkText}>
            <FaCamera style={styles.icon} /> Verify QR
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NavBar;

// Inline styles with responsiveness
const styles = {
  navContainer: {
    backgroundColor: '#2b6cb0',
    padding: '10px 20px',
    marginBottom: '20px',
  },
  navList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    gap: '10px',
  },
  navLink: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    textDecoration: 'none',
    borderRadius: '6px',
    transition: 'background 0.3s ease',
    backgroundColor: 'transparent',
  },
  activeLink: {
    backgroundColor: '#3182ce',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '16px',
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
