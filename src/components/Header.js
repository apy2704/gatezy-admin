import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdmin } from '../utils/storage';

const routeTitles = {
  '/': 'Dashboard Overview',
  '/live': 'Live View',
  '/visitors': 'Visitor Log',
  '/flats': 'Flats Management',
  '/residents': 'Residents Directory',
  '/guards': 'Security Guards',
  '/settings': 'Settings',
};

const Header = () => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const admin = getAdmin();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const title = routeTitles[location.pathname] || 'GATEZY Admin';
  const adminName = admin?.name || admin?.phone || 'Secretary Admin';

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header style={styles.header}>
      <div>
        <h2 style={styles.title}>{title}</h2>
      </div>

      <div style={styles.rightSection}>
        {/* Date Time Display */}
        <div style={styles.timeBadge}>
          <span style={styles.timeIcon}>🕒</span>
          <div>
            <div style={styles.timeText}>{formattedTime}</div>
            <div style={styles.dateText}>{formattedDate}</div>
          </div>
        </div>

        {/* Admin Profile Info */}
        <div style={styles.adminBadge}>
          <div style={styles.avatar}>{adminName.charAt(0).toUpperCase()}</div>
          <div>
            <div style={styles.adminName}>{adminName}</div>
            <div style={styles.adminRole}>Society Secretary</div>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: '70px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    marginLeft: '250px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#1E3A5F',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  timeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#F8FAFC',
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  timeIcon: {
    fontSize: '18px',
  },
  timeText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0F172A',
    fontVariantNumeric: 'tabular-nums',
  },
  dateText: {
    fontSize: '11px',
    color: '#64748B',
  },
  adminBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
  },
  adminName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0F172A',
  },
  adminRole: {
    fontSize: '12px',
    color: '#64748B',
  },
};

export default Header;
    