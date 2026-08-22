import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getSociety, updateSociety, getHealth } from '../services/api';

const SettingsPage = () => {
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editable Profile Form State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [totalFlats, setTotalFlats] = useState('');
  const [secretaryPhone, setSecretaryPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // System Health State
  const [backendOk, setBackendOk] = useState(null);
  const [healthChecking, setHealthChecking] = useState(true);

  // Fetch Society Info & Backend Health
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const societyRes = await getSociety();
      const sData = societyRes?.society || societyRes?.data || societyRes;
      if (sData) {
        setSociety(sData);
        setName(sData.name || '');
        setCity(sData.city || '');
        setAddress(sData.address || '');
        setTotalFlats(sData.total_flats || sData.totalFlats || '');
        setSecretaryPhone(sData.secretary_phone || sData.secretaryPhone || '');
      }
    } catch (err) {
      console.error('Fetch society error:', err);
      const msg = err.message || 'Failed to fetch society details';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    setHealthChecking(true);
    try {
      const res = await getHealth();
      if (res && (res.status === 'ok' || res.status === 'OK' || res.success)) {
        setBackendOk(true);
      } else {
        setBackendOk(false);
      }
    } catch (err) {
      console.error('Backend health check error:', err);
      setBackendOk(false);
    } finally {
      setHealthChecking(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    checkHealth();
  }, [fetchData, checkHealth]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name || !city || !secretaryPhone) {
      toast.error('Society Name, City, and Secretary Phone are required!');
      return;
    }

    setSaving(true);
    const payload = {
      name,
      city,
      address,
      total_flats: Number(totalFlats) || 0,
      secretary_phone: secretaryPhone.startsWith('+91')
        ? secretaryPhone
        : `+91${secretaryPhone}`,
    };

    try {
      await updateSociety(payload);
      toast.success('Society profile updated successfully!');
      setIsEditing(false);
      fetchData();
    } catch (err) {
      console.error('Update society error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update society info');
    } finally {
      setSaving(false);
    }
  };

  const handleDangerClick = (featureName) => {
    toast(`${featureName} feature is coming soon!`, {
      icon: '🔒',
    });
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.headerBar}>
        <div>
          <h2 style={styles.title}>Society Settings</h2>
          <p style={styles.subTitle}>
            Manage society configuration, backend status, and profile preferences
          </p>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {loading ? (
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading settings configuration...</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {/* Card 1: Society Profile */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <span style={styles.cardIcon}>🏢</span>
                <h3 style={styles.cardTitle}>Society Profile</h3>
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                  ✏️ Edit Profile
                </button>
              ) : (
                <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
              )}
            </div>

            <div style={styles.cardBody}>
              {!isEditing ? (
                <div style={styles.profileList}>
                  <div style={styles.profileRow}>
                    <span style={styles.fieldLabel}>Society Name:</span>
                    <span style={styles.fieldValueBold}>
                      {society?.name || 'GATEZY Society'}
                    </span>
                  </div>
                  <div style={styles.profileRow}>
                    <span style={styles.fieldLabel}>City:</span>
                    <span style={styles.fieldValue}>
                      {society?.city || 'Bhilai, Chhattisgarh'}
                    </span>
                  </div>
                  <div style={styles.profileRow}>
                    <span style={styles.fieldLabel}>Address:</span>
                    <span style={styles.fieldValue}>
                      {society?.address || 'Sector 6, Bhilai'}
                    </span>
                  </div>
                  <div style={styles.profileRow}>
                    <span style={styles.fieldLabel}>Total Flats:</span>
                    <span style={styles.fieldValue}>
                      {society?.total_flats || society?.totalFlats || '148'}
                    </span>
                  </div>
                  <div style={styles.profileRow}>
                    <span style={styles.fieldLabel}>Secretary Phone:</span>
                    <span style={styles.fieldValueHighlighted}>
                      📞 {society?.secretary_phone || society?.secretaryPhone || '+91 9876543210'}
                    </span>
                  </div>
                  <div style={styles.infoHint}>
                    📲 Daily summary WhatsApp reports are sent automatically every morning to the Secretary Phone number.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Society Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div style={{ ...styles.formGroup, flex: 1 }}>
                      <label style={styles.label}>Total Flats</label>
                      <input
                        type="number"
                        value={totalFlats}
                        onChange={(e) => setTotalFlats(e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    <div style={{ ...styles.formGroup, flex: 1.5 }}>
                      <label style={styles.label}>Secretary Phone (WhatsApp)</label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={secretaryPhone}
                        onChange={(e) => setSecretaryPhone(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formFooter}>
                    <button type="submit" disabled={saving} style={styles.saveBtn}>
                      {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Card 2: System Settings */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitleGroup}>
                <span style={styles.cardIcon}>⚙️</span>
                <h3 style={styles.cardTitle}>System Diagnostics</h3>
              </div>
              <button onClick={checkHealth} style={styles.refreshBtn}>
                🔄 Recheck
              </button>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.diagList}>
                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>App Version</span>
                  <span style={styles.diagBadge}>v1.0.0</span>
                </div>

                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>Backend Status</span>
                  <div style={styles.statusIndicator}>
                    {healthChecking ? (
                      <span style={{ color: '#64748B', fontSize: '13px' }}>Checking...</span>
                    ) : backendOk ? (
                      <>
                        <span style={styles.dotGreen}>●</span>
                        <span style={styles.statusOnline}>Online (200 OK)</span>
                      </>
                    ) : (
                      <>
                        <span style={styles.dotRed}>●</span>
                        <span style={styles.statusOffline}>Offline / Error</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>Environment</span>
                  <span style={styles.diagEnv}>
                    {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                  </span>
                </div>

                <div style={styles.diagItem}>
                  <span style={styles.diagLabel}>Backend Server URL</span>
                  <span style={styles.codeText}>http://192.168.29.167:5000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Danger Zone */}
          <div style={styles.dangerCard}>
            <div style={styles.dangerHeader}>
              <div style={styles.cardTitleGroup}>
                <span style={styles.cardIcon}>⚠️</span>
                <h3 style={styles.dangerTitle}>Danger Zone</h3>
              </div>
            </div>

            <div style={styles.cardBody}>
              <p style={styles.dangerDesc}>
                Administrative data actions. Use with extreme caution.
              </p>

              <div style={styles.dangerActions}>
                <button
                  onClick={() => handleDangerClick('Reset Visitor Logs')}
                  style={styles.dangerBtn}
                  title="Coming soon"
                >
                  🗑️ Reset All Visitor Logs
                </button>

                <button
                  onClick={() => handleDangerClick('Export Data')}
                  style={styles.disabledBtn}
                  title="Coming soon"
                >
                  📥 Export Society Data
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: About GATEZY */}
          <div style={styles.aboutCard}>
            <div style={styles.aboutHeader}>
              <div style={styles.logoBadge}>🛡️</div>
              <div>
                <h3 style={styles.aboutTitle}>GATEZY</h3>
                <p style={styles.aboutTagline}>"Your Gate. Your Control."</p>
              </div>
            </div>

            <div style={styles.aboutBody}>
              <p style={styles.aboutDesc}>
                Smart Gated Community & Visitor Security Management Platform.
              </p>

              <div style={styles.aboutFooter}>
                <span style={styles.versionBadge}>Version 1.0.0</span>
                <span style={styles.locationText}>📍 Built for Bhilai, Chhattisgarh</span>
              </div>
            </div>
          </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  cardTitleGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  cardIcon: { fontSize: '22px' },
  cardTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1E3A5F' },
  editBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFF',
    color: '#64748B',
    fontSize: '13px',
    cursor: 'pointer',
  },
  refreshBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#1E3A5F',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cardBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  profileList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  profileRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  fieldLabel: { color: '#64748B', fontWeight: '500' },
  fieldValue: { color: '#334155', fontWeight: '600' },
  fieldValueBold: { color: '#0F172A', fontWeight: '700', fontSize: '15px' },
  fieldValueHighlighted: {
    color: '#1E3A5F',
    backgroundColor: '#F1F5F9',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
  },
  infoHint: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.4',
    marginTop: '6px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  formRow: { display: 'flex', gap: '12px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#475569' },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
  },
  formFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: '6px' },
  saveBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#1E3A5F',
    color: '#FFF',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  diagList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  diagItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  diagLabel: { color: '#64748B', fontWeight: '500' },
  diagBadge: {
    backgroundColor: '#F1F5F9',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '700',
    color: '#0F172A',
    fontSize: '13px',
  },
  diagEnv: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
  },
  statusIndicator: { display: 'flex', alignItems: 'center', gap: '6px' },
  dotGreen: { color: '#10B981', fontSize: '18px' },
  dotRed: { color: '#EF4444', fontSize: '18px' },
  statusOnline: { color: '#047857', fontWeight: '600', fontSize: '13px' },
  statusOffline: { color: '#B91C1C', fontWeight: '600', fontSize: '13px' },
  codeText: { fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', color: '#475569' },
  dangerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #FECACA',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  dangerHeader: {
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #FEE2E2',
  },
  dangerTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#DC2626' },
  dangerDesc: { margin: '0 0 16px 0', fontSize: '13px', color: '#7F1D1D' },
  dangerActions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  dangerBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #FCA5A5',
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    opacity: 0.8,
  },
  disabledBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'not-allowed',
  },
  aboutCard: {
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    borderRadius: '12px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 4px 15px rgba(30, 58, 95, 0.2)',
  },
  aboutHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' },
  logoBadge: {
    fontSize: '36px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutTitle: { margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '1px' },
  aboutTagline: { margin: '4px 0 0 0', fontSize: '13px', color: '#93C5FD' },
  aboutBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  aboutDesc: { margin: 0, fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5' },
  aboutFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
  },
  versionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  locationText: { fontSize: '12px', color: '#93C5FD', fontWeight: '500' },
};

export default SettingsPage;
