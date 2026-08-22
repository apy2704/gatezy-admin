import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getVisitorLog } from '../services/api';

const VisitorLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (dateFilter !== 'all') {
        filters.dateRange = dateFilter;
      }
      const res = await getVisitorLog(filters);
      const list = Array.isArray(res) ? res : res?.visitors || res?.logs || res?.data || [];
      setLogs(list);
    } catch (err) {
      console.error('Visitor logs fetch error:', err);
      const msg = err.message || 'Failed to fetch visitor logs';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side date filter helper if backend returns unfiltered list
  const filteredLogs = logs.filter((item) => {
    if (dateFilter === 'all') return true;
    const dateVal = item.entryTime || item.createdAt || item.date;
    if (!dateVal) return true;

    const itemDate = new Date(dateVal);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateFilter === 'today') {
      return itemDate >= today;
    }
    if (dateFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return itemDate >= yesterday && itemDate < today;
    }
    if (dateFilter === 'last7') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('allow') || s.includes('approve') || s.includes('completed') || s.includes('checked_in')) {
      return <span style={{ ...styles.badge, backgroundColor: '#DEF7EC', color: '#03543F' }}>Allowed</span>;
    }
    if (s.includes('deny') || s.includes('reject') || s.includes('block')) {
      return <span style={{ ...styles.badge, backgroundColor: '#FDE8E8', color: '#9B1C1C' }}>Denied</span>;
    }
    return <span style={{ ...styles.badge, backgroundColor: '#FEF08A', color: '#713F12' }}>Pending</span>;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '—';
    try {
      const d = new Date(dateTimeStr);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return dateTimeStr;
    }
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.headerBar}>
        <div>
          <h2 style={styles.title}>Visitor Log History</h2>
          <p style={styles.subTitle}>Comprehensive history of all gate check-ins and check-outs</p>
        </div>

        {/* Filter & Count */}
        <div style={styles.filterSection}>
          <div style={styles.totalBadge}>
            Total: <strong>{filteredLogs.length}</strong>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filter Date:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {/* Table Section */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.spinnerWrapper}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Fetching visitor logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={styles.emptyState}>No visitor log records found.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Visitor Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Flat / Block</th>
                  <th style={styles.th}>Purpose</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Guard Name</th>
                  <th style={styles.th}>Entry Time</th>
                  <th style={styles.th}>Exit Time</th>
                  <th style={styles.th}>Escalation Steps</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => (
                  <tr key={log.id || log._id || idx} style={styles.tr}>
                    <td style={styles.tdBold}>{log.name || log.visitorName || 'Visitor'}</td>
                    <td style={styles.td}>{log.phone || log.mobile || 'N/A'}</td>
                    <td style={styles.td}>
                      {log.flatNumber || log.flat || 'N/A'}{' '}
                      {log.block ? `(${log.block})` : ''}
                    </td>
                    <td style={styles.td}>{log.purpose || 'General'}</td>
                    <td style={styles.td}>{getStatusBadge(log.status)}</td>
                    <td style={styles.td}>{log.guardName || log.guard?.name || 'Gate Guard'}</td>
                    <td style={styles.td}>{formatDateTime(log.entryTime || log.createdAt)}</td>
                    <td style={styles.td}>{formatDateTime(log.exitTime || log.updatedAt)}</td>
                    <td style={styles.td}>
                      <span style={styles.escalationTag}>
                        {log.escalationSteps || log.escalation || 'Call → Resident Approved'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  title: { margin: 0, fontSize: '22px', fontWeight: '700', color: '#1E3A5F' },
  subTitle: { margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' },
  filterSection: { display: 'flex', alignItems: 'center', gap: '20px' },
  totalBadge: {
    backgroundColor: '#F1F5F9',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#334155',
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  filterLabel: { fontSize: '14px', fontWeight: '600', color: '#475569' },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#FFF',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #FECACA',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #E2E8F0',
  },
  spinnerWrapper: { textAlign: 'center', padding: '60px 0' },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 16px auto',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #1E3A5F',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: { color: '#64748B' },
  emptyState: { textAlign: 'center', padding: '50px 0', color: '#94A3B8' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: {
    padding: '12px 14px',
    borderBottom: '2px solid #E2E8F0',
    color: '#475569',
    fontSize: '12px',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tr: { borderBottom: '1px solid #F1F5F9' },
  td: { padding: '14px', fontSize: '13px', color: '#334155' },
  tdBold: { padding: '14px', fontSize: '13px', fontWeight: '600', color: '#0F172A' },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  escalationTag: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#475569',
  },
};

export default VisitorLogPage;
