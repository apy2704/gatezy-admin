import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/live', label: 'Live View', icon: '📹' },
  { path: '/visitors', label: 'Visitor Log', icon: '📋' },
  { path: '/flats', label: 'Flats', icon: '🏢' },
  { path: '/residents', label: 'Residents', icon: '👨‍👩‍👧‍👦' },
  { path: '/guards', label: 'Guards', icon: '🛡️' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoBadge}>🛡️</div>
        <div>
          <h1 style={styles.brandName}>GATEZY</h1>
          <p style={styles.brandSub}>Society Admin</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span style={styles.icon}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    minWidth: '250px',
    height: '100vh',
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    boxShadow: '4px 0 15px rgba(0, 0, 0, 0.1)',
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  logoBadge: {
    fontSize: '28px',
    background: '#1E3A5F',
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '1px',
    color: '#FFFFFF',
  },
  brandSub: {
    margin: 0,
    fontSize: '12px',
    color: '#94A3B8',
  },
  nav: {
    flex: 1,
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflowY: 'auto',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: '#94A3B8',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(30, 58, 95, 0.4)',
  },
  icon: {
    fontSize: '18px',
  },
  label: {
    flex: 1,
  },
  footer: {
    padding: '20px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default Sidebar;
