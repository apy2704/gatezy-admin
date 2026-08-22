import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getGuards, addGuard, updateGuard, deleteGuard } from '../services/api';

const GuardsPage = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [societyId, setSocietyId] = useState('Gate 1 Main Entry');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchGuardsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGuards();
      const list = Array.isArray(res) ? res : res?.guards || res?.data || [];
      setGuards(list);
    } catch (err) {
      console.error('Guards fetch error:', err);
      const msg = err.message || 'Failed to fetch guards list';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuardsList();
  }, [fetchGuardsList]);

  const openAddModal = () => {
    setEditingGuard(null);
    setName('');
    setPhone('');
    setPin('');
    setSocietyId('Gate 1 Main Entry');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (guard) => {
    setEditingGuard(guard);
    setName(guard.name || '');
    setPhone(guard.phone ? guard.phone.replace(/^\+91/, '') : '');
    setPin(guard.pin || '');
    setSocietyId(guard.societyId || guard.gate || 'Gate 1 Main Entry');
    setIsActive(guard.isActive !== false && guard.status !== 'inactive');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuard(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Name and Phone number are required!');
      return;
    }

    if (!editingGuard && (!pin || pin.length !== 4)) {
      toast.error('Please enter a 4-digit PIN for new guard!');
      return;
    }

    setSaving(true);
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    const payload = {
      name,
      phone: formattedPhone,
      societyId,
      isActive: Boolean(isActive),
    };
    if (pin) {
      payload.pin = pin;
    }

    try {
      if (editingGuard) {
        const id = editingGuard.id || editingGuard._id;
        await updateGuard(id, payload);
        toast.success('Guard details updated successfully!');
      } else {
        await addGuard(payload);
        toast.success('Security guard added successfully!');
      }
      closeModal();
      fetchGuardsList();
    } catch (err) {
      console.error('Guard save error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save guard');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (guard) => {
    const id = guard.id || guard._id;
    const nameStr = guard.name || 'this guard';

    if (window.confirm(`Are you sure you want to remove guard ${nameStr}?`)) {
      try {
        await deleteGuard(id);
        toast.success(`Guard ${nameStr} deleted successfully`);
        fetchGuardsList();
      } catch (err) {
        console.error('Guard delete error:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to delete guard');
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <div style={styles.headerBar}>
        <div>
          <h2 style={styles.title}>Security Guards</h2>
          <p style={styles.subTitle}>Manage gate security personnel credentials and active shifts</p>
        </div>
        <button onClick={openAddModal} style={styles.addBtn}>
          🛡️ Add Security Guard
        </button>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {/* Guards Table Card */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.spinnerWrapper}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading security guards...</p>
          </div>
        ) : guards.length === 0 ? (
          <div style={styles.emptyState}>
            No security guards registered yet. Click "Add Security Guard" to add one.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Gate / Society</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Created Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guards.map((guard, idx) => {
                  const active = guard.isActive !== false && guard.status !== 'inactive';
                  return (
                    <tr key={guard.id || guard._id || idx} style={styles.tr}>
                      <td style={styles.tdBold}>🛡️ {guard.name || 'Guard'}</td>
                      <td style={styles.td}>{guard.phone || 'N/A'}</td>
                      <td style={styles.td}>{guard.societyId || guard.gate || 'Main Gate'}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: active ? '#DEF7EC' : '#F3F4F6',
                            color: active ? '#03543F' : '#6B7280',
                          }}
                        >
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(guard.createdAt || guard.createdDate)}</td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button onClick={() => openEditModal(guard)} style={styles.editBtn}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(guard)} style={styles.deleteBtn}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Guard Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingGuard ? 'Edit Guard Credentials' : 'Add New Security Guard'}
              </h3>
              <button onClick={closeModal} style={styles.closeBtn}>
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Guard Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Mobile Phone Number (10 digits)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Security PIN (4 Digits)</label>
                <input
                  type="password"
                  placeholder={editingGuard ? 'Leave blank to keep unchanged' : '4-digit PIN'}
                  value={pin}
                  maxLength={4}
                  onChange={(e) => setPin(e.target.value)}
                  style={styles.input}
                  required={!editingGuard}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Gate / Society Station</label>
                <input
                  type="text"
                  placeholder="e.g. Gate 1 Main Entry"
                  value={societyId}
                  onChange={(e) => setSocietyId(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="activeCheck" style={styles.checkboxLabel}>
                  Guard status is Active
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? 'Saving...' : editingGuard ? 'Update Guard' : 'Add Guard'}
                </button>
              </div>
            </form>
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
  addBtn: {
    backgroundColor: '#1E3A5F',
    color: '#FFF',
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(30, 58, 95, 0.3)',
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
    padding: '12px 16px',
    borderBottom: '2px solid #E2E8F0',
    color: '#475569',
    fontSize: '12px',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tr: { borderBottom: '1px solid #F1F5F9' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#334155' },
  tdBold: { padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#0F172A' },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  },
  actionGroup: { display: 'flex', gap: '8px' },
  editBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #FECACA',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1E3A5F' },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#64748B',
  },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#334155' },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
  },
  checkboxGroup: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '14px', color: '#334155', cursor: 'pointer' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' },
  cancelBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFF',
    color: '#475569',
    fontWeight: '600',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#1E3A5F',
    color: '#FFF',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default GuardsPage;
