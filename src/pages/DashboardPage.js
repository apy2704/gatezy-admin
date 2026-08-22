import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getActiveVisitors,
  getVisitorLog,
  getFlats,
  getGuards,
} from '../services/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalVisitorsToday: 0,
    currentlyInside: 0,
    totalFlats: 0,
    activeGuards: 0,
  });

  const [recentVisitors, setRecentVisitors] = useState([]);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    try {
      const [activeRes, logRes, flatsRes, guardsRes] = await Promise.allSettled([
        getActiveVisitors(),
        getVisitorLog(),
        getFlats(),
        getGuards(),
      ]);

      const activeList =
        activeRes.status === 'fulfilled'
          ? Array.isArray(activeRes.value)
            ? activeRes.value
            : activeRes.value?.visitors || []
          : [];
      const logList =
        logRes.status === 'fulfilled'
          ? Array.isArray(logRes.value)
            ? logRes.value
            : logRes.value?.visitors || logRes.value?.logs || []
          : [];
      const flatsList =
        flatsRes.status === 'fulfilled'
          ? Array.isArray(flatsRes.value)
            ? flatsRes.value
            : flatsRes.value?.flats || []
          : [];
      const guardsList =
        guardsRes.status === 'fulfilled'
          ? Array.isArray(guardsRes.value)
            ? guardsRes.value
            : guardsRes.value?.guards || []
          : [];

      const todayStr = new Date().toISOString().split('T')[0];
      const todayVisitors = logList.filter((v) => {
        const date = v.entryTime || v.createdAt || v.date;
        return date && new Date(date).toISOString().split('T')[0] === todayStr;
      });

      const activeGuardsCount = guardsList.filter(
        (g) => g.isActive !== false && g.status !== 'inactive'
      ).length;

      setStats({
        totalVisitorsToday: todayVisitors.length || logList.length,
        currentlyInside: activeList.length,
        totalFlats: flatsList.length,
        activeGuards: activeGuardsCount || guardsList.length,
      });

      setRecentVisitors(logList.slice(0, 10));
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      const msg = err.message || 'Failed to load dashboard data';
      setError(msg);
      toast.error(msg);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (
      s.includes('allow') ||
      s.includes('approve') ||
      s.includes('checked_in') ||
      s.includes('completed')
    ) {
      return (
        <span style={{ ...styles.badge, backgroundColor: '#DEF7EC', color: '#03543F' }}>
          Allowed
        </span>
      );
    }
    if (s.includes('deny') || s.includes('reject') || s.includes('block')) {
      return (
        <span style={{ ...styles.badge, backgroundColor: '#FDE8E8', color: '#9B1C1C' }}>
          Denied
        </span>
      );
    }
    return (
      <span style={{ ...styles.badge, backgroundColor: '#FEF08A', color: '#713F12' }}>
        Pending
      </span>
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    try {
      return new Date(timeStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageHeading}>Dashboard Overview</h2>
          <p style={styles.subText}>
            Live society metrics & recent activity (Auto-refreshes every 30s)
          </p>
        </div>
        <button onClick={() => fetchData()} style={styles.refreshBtn}>
          🔄 Refresh Now
        </button>
      </div>

      {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

      {loading ? (
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.spinnerText}>Loading dashboard metrics...</p>
        </div>
      ) : (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>👥</div>
              <div>
                <div style={styles.statTitle}>Total Visitors Today</div>
                <div style={styles.statValue}>{stats.totalVisitorsToday}</div>
              </div>
            </div>

            <div style={{ ...styles.statCard, borderLeft: '4px solid #10B981' }}>
              <div style={styles.statIconWrapper}>🚪</div>
              <div>
                <div style={styles.statTitle}>Currently Inside</div>
                <div style={styles.statValue}>{stats.currentlyInside}</div>
              </div>
            </div>

            <div style={{ ...styles.statCard, borderLeft: '4px solid #3B82F6' }}>
              <div style={styles.statIconWrapper}>🏢</div>
              <div>
                <div style={styles.statTitle}>Total Flats</div>
                <div style={styles.statValue}>{stats.totalFlats}</div>
              </div>
            </div>

            <div style={{ ...styles.statCard, borderLeft: '4px solid #F59E0B' }}>
              <div style={styles.statIconWrapper}>🛡️</div>
              <div>
                <div style={styles.statTitle}>Active Guards</div>
                <div style={styles.statValue}>{stats.activeGuards}</div>
              </div>
            </div>
          </div>

          <div style={styles.tableSection}>
            <h3 style={styles.sectionTitle}>Recent Visitor Requests (Last 10)</h3>

            {recentVisitors.length === 0 ? (
              <div style={styles.emptyState}>No visitor logs recorded yet.</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Visitor Name</th>
                      <th style={styles.th}>Flat / Block</th>
                      <th style={styles.th}>Purpose</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisitors.map((visitor, idx) => (
                      <tr key={visitor.id || visitor._id || idx} style={styles.tr}>
                        <td style={styles.tdBold}>
                          {visitor.name || visitor.visitorName || 'Visitor'}
                        </td>
                        <td style={styles.td}>
                          {visitor.flatNumber || visitor.flat || 'N/A'}{' '}
                          {visitor.block ? `(${visitor.block})` : ''}
                        </td>
                        <td style={styles.td}>{visitor.purpose || 'General'}</td>
                        <td style={styles.td}>{getStatusBadge(visitor.status)}</td>
                        <td style={styles.td}>
                          {formatTime(
                            visitor.entryTime || visitor.createdAt || visitor.time
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pageHeading: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#1E3A5F' },
  subText: { margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' },
  refreshBtn: {
    padding: '8px 16px',
    backgroundColor: '#1E3A5F',
    color: '#FFF',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #FECACA',
    fontSize: '14px',
  },
  spinnerContainer: { textAlign: 'center', padding: '60px 0' },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 16px auto',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #1E3A5F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerText: { color: '#64748B', fontSize: '15px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  statIconWrapper: {
    fontSize: '32px',
    backgroundColor: '#F1F5F9',
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTitle: { fontSize: '13px', color: '#64748B', fontWeight: '600' },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#1E3A5F', marginTop: '4px' },
  tableSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E2E8F0',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1E3A5F',
  },
  emptyState: { textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '15px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: {
    padding: '12px 16px',
    borderBottom: '2px solid #E2E8F0',
    color: '#475569',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  tr: { borderBottom: '1px solid #F1F5F9' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#334155' },
  tdBold: { padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#0F172A' },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
};

export default DashboardPage;
