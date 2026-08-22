import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getActiveVisitors } from '../services/api';

const LiveViewPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActive = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await getActiveVisitors();
      const list = Array.isArray(res) ? res : res?.visitors || res?.data || [];
      setVisitors(list);
    } catch (err) {
      console.error('Active visitors fetch error:', err);
      const msg = err.message || 'Failed to fetch active visitors';
      setError(msg);
      toast.error(msg);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(() => {
      fetchActive(true);
    }, 10000); // 10s auto refresh

    return () => clearInterval(interval);
  }, [fetchActive]);

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Recently';
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header & Count */}
      <div style={styles.headerBar}>
        <div>
          <h2 style={styles.title}>Live Gate & Society View</h2>
          <p style={styles.subTitle}>
            Real-time tracking of active visitors currently inside the premises (Auto-refreshes every 10s)
          </p>
        </div>
        <div style={styles.badgeCount}>
          <span style={styles.badgeNumber}>{visitors.length}</span>
          <span style={styles.badgeLabel}>Inside Now</span>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {loading ? (
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Fetching live society status...</p>
        </div>
      ) : visitors.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>🏡</div>
          <h3 style={styles.emptyTitle}>No Active Visitors Inside</h3>
          <p style={styles.emptyText}>All visitors have currently checked out of the society.</p>
        </div>
      ) : (
        <div style={styles.cardGrid}>
          {visitors.map((visitor, idx) => {
            console.log('Visitor data:', visitor);

            const visitorName = visitor.visitor_name || visitor.visitorName || visitor.name || 'Guest Visitor';
            const visitorPhone = visitor.visitor_phone || visitor.visitorPhone || visitor.phone || visitor.mobile || 'N/A';
            const flatNum = visitor.flat_number || visitor.flatNumber || visitor.flat || 'N/A';
            const block = visitor.block;
            const purpose = visitor.purpose || 'Visitor';
            const time = visitor.entered_at || visitor.entryTime || visitor.created_at || visitor.createdAt;
            const guardName = visitor.guard_name || visitor.guardName || visitor.guard?.name || 'Gate Guard';

            return (
              <div key={visitor.id || visitor._id || idx} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.visitorAvatar}>
                    {visitorName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={styles.visitorName}>{visitorName}</h4>
                    <p style={styles.visitorPhone}>📞 {visitorPhone}</p>
                  </div>
                  <span style={styles.activeDot}>🟢 Active</span>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Flat / Block</span>
                    <span style={styles.detailValue}>
                      Flat {flatNum} {block ? `(Block ${block})` : ''}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Purpose</span>
                    <span style={styles.detailValue}>{purpose}</span>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Entry Time</span>
                    <span style={styles.detailValue}>
                      ⏱️ {formatTime(time)}
                    </span>
                  </div>

                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Guard on Duty</span>
                    <span style={styles.detailValue}>
                      🛡️ {guardName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
  badgeCount: {
    backgroundColor: '#1E3A5F',
    color: '#FFF',
    padding: '12px 20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '100px',
  },
  badgeNumber: { fontSize: '24px', fontWeight: '800' },
  badgeLabel: { fontSize: '11px', textTransform: 'uppercase', opacity: 0.8 },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #FECACA',
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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center',
    border: '1px solid #E2E8F0',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  emptyTitle: { margin: '0 0 8px 0', fontSize: '18px', color: '#1E3A5F', fontWeight: '700' },
  emptyText: { margin: 0, color: '#64748B', fontSize: '14px' },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: '14px' },
  visitorAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#1E3A5F',
    color: '#FFF',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  visitorName: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#0F172A' },
  visitorPhone: { margin: '2px 0 0 0', fontSize: '13px', color: '#64748B' },
  activeDot: {
    backgroundColor: '#DEF7EC',
    color: '#03543F',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  divider: { height: '1px', backgroundColor: '#F1F5F9', margin: '16px 0' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  detailItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  detailLabel: { fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: '600' },
  detailValue: { fontSize: '13px', color: '#334155', fontWeight: '600' },
};

export default LiveViewPage;
