import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getFlats,
  getResidents,
  addResident,
  updateResident,
  deleteResident,
} from '../services/api';

const ResidentsPage = () => {
  const [flats, setFlats] = useState([]);
  const [selectedFlatId, setSelectedFlatId] = useState('');
  const [residents, setResidents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);

  // Form states
  const [targetFlatId, setTargetFlatId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [role, setRole] = useState('owner');
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch flats list on mount
  useEffect(() => {
    const loadFlats = async () => {
      try {
        const res = await getFlats();
        const list = Array.isArray(res) ? res : res?.flats || res?.data || [];
        setFlats(list);
      } catch (err) {
        console.error('Error fetching flats list:', err);
      }
    };
    loadFlats();
  }, []);

  // Fetch residents list based on selected flat or all
  const fetchResidentsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResidents(selectedFlatId || undefined);
      const list = Array.isArray(res) ? res : res?.residents || res?.data || [];
      setResidents(list);
    } catch (err) {
      console.error('Error fetching residents:', err);
      const msg = err.message || 'Failed to load residents';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedFlatId]);

  useEffect(() => {
    fetchResidentsList();
  }, [fetchResidentsList]);

  const openAddModal = () => {
    setEditingResident(null);
    setTargetFlatId(selectedFlatId || (flats.length > 0 ? flats[0].id || flats[0]._id : ''));
    setName('');
    setPhone('');
    setAltPhone('');
    setRole('owner');
    setIsPrimary(residents.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (resItem) => {
    setEditingResident(resItem);
    setTargetFlatId(resItem.flat_id || resItem.flatId || selectedFlatId || '');
    setName(resItem.name || '');
    setPhone(resItem.phone ? resItem.phone.replace(/^\+91/, '') : '');
    setAltPhone(
      resItem.alt_phone || resItem.altPhone
        ? (resItem.alt_phone || resItem.altPhone).replace(/^\+91/, '')
        : ''
    );
    setRole(resItem.role || 'owner');
    setIsPrimary(Boolean(resItem.is_primary || resItem.isPrimary));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResident(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetFlatId || !name || !phone) {
      toast.error('Flat, Full Name, and WhatsApp Phone are required!');
      return;
    }

    setSaving(true);

    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    const formattedAltPhone = altPhone
      ? altPhone.startsWith('+91')
        ? altPhone
        : `+91${altPhone}`
      : null;

    const payload = {
      flat_id: targetFlatId,
      flatId: targetFlatId,
      name,
      phone: formattedPhone,
      alt_phone: formattedAltPhone,
      altPhone: formattedAltPhone,
      role,
      is_primary: Boolean(isPrimary),
      isPrimary: Boolean(isPrimary),
    };

    try {
      if (editingResident) {
        const id = editingResident.id || editingResident._id;
        await updateResident(id, payload);
        toast.success('Resident updated successfully!');
      } else {
        await addResident(payload);
        toast.success('Resident added successfully!');
      }
      closeModal();
      fetchResidentsList();
    } catch (err) {
      console.error('Save resident error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save resident');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resItem) => {
    const id = resItem.id || resItem._id;
    const nameStr = resItem.name || 'this resident';

    if (window.confirm(`Are you sure you want to remove ${nameStr}?`)) {
      try {
        await deleteResident(id);
        toast.success(`Resident ${nameStr} deleted successfully`);
        fetchResidentsList();
      } catch (err) {
        console.error('Delete resident error:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to delete resident');
      }
    }
  };

  const getRoleBadge = (roleStr) => {
    const r = (roleStr || '').toLowerCase();
    if (r === 'owner') {
      return (
        <span style={{ ...styles.badge, backgroundColor: '#E0E7FF', color: '#3730A3' }}>
          Owner
        </span>
      );
    }
    if (r === 'tenant') {
      return (
        <span style={{ ...styles.badge, backgroundColor: '#FEF3C7', color: '#92400E' }}>
          Tenant
        </span>
      );
    }
    return (
      <span style={{ ...styles.badge, backgroundColor: '#F3F4F6', color: '#374151' }}>
        Family
      </span>
    );
  };

  return (
    <div style={styles.container}>
      {/* Top Header Bar */}
      <div style={styles.headerBar}>
        <div>
          <h2 style={styles.title}>Residents / Nivassi</h2>
          <p style={styles.subTitle}>
            Manage flat owners, tenants, and primary WhatsApp notification contacts
          </p>
        </div>

        {/* Flat selector & Add Button */}
        <div style={styles.headerRight}>
          <div style={styles.selectGroup}>
            <label style={styles.selectLabel}>Select Flat:</label>
            <select
              value={selectedFlatId}
              onChange={(e) => setSelectedFlatId(e.target.value)}
              style={styles.select}
            >
              <option value="">-- All Flats --</option>
              {flats.map((flat) => {
                const flatId = flat.id || flat._id;
                const label = `${flat.block ? `${flat.block}-` : ''}${
                  flat.flatNumber || flat.flat_number || flat.number || 'Flat'
                }`;
                return (
                  <option key={flatId} value={flatId}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          <button onClick={openAddModal} style={styles.addBtn}>
            ➕ Add Resident
          </button>
        </div>
      </div>

      {/* Primary Resident Info Banner */}
      <div style={styles.infoBanner}>
        <span style={styles.infoIcon}>💡</span>
        <span>
          <strong>Important Note:</strong> The <strong>PRIMARY</strong> resident receives
          WhatsApp notifications first when a visitor arrives at their flat gate.
        </span>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {/* Table Section */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.spinnerWrapper}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading residents directory...</p>
          </div>
        ) : residents.length === 0 ? (
          <div style={styles.emptyState}>
            No residents added for this flat yet. Click "Add Resident" to add one.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Primary</th>
                  <th style={styles.th}>Full Name</th>
                  <th style={styles.th}>Flat / Block</th>
                  <th style={styles.th}>WhatsApp Number</th>
                  <th style={styles.th}>Alt Number</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resItem, idx) => {
                  const isPrim = Boolean(resItem.is_primary || resItem.isPrimary);
                  return (
                    <tr key={resItem.id || resItem._id || idx} style={styles.tr}>
                      <td style={styles.tdCenter}>
                        {isPrim ? (
                          <span style={styles.starActive} title="Primary Contact">
                            ⭐
                          </span>
                        ) : (
                          <span style={styles.starInactive} title="Secondary Contact">
                            ☆
                          </span>
                        )}
                      </td>
                      <td style={styles.tdBold}>{resItem.name || 'Resident'}</td>
                      <td style={styles.td}>
                        {resItem.flat_number || resItem.flatNumber || 'Flat'}{' '}
                        {resItem.block ? `(${resItem.block})` : ''}
                      </td>
                      <td style={styles.td}>{resItem.phone || 'N/A'}</td>
                      <td style={styles.td}>{resItem.alt_phone || resItem.altPhone || '—'}</td>
                      <td style={styles.td}>{getRoleBadge(resItem.role)}</td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button
                            onClick={() => openEditModal(resItem)}
                            style={styles.editBtn}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(resItem)}
                            style={styles.deleteBtn}
                          >
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

      {/* Add / Edit Resident Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingResident ? 'Edit Resident Details' : 'Add New Resident'}
              </h3>
              <button onClick={closeModal} style={styles.closeBtn}>
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Flat</label>
                <select
                  value={targetFlatId}
                  onChange={(e) => setTargetFlatId(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">-- Choose Flat --</option>
                  {flats.map((flat) => {
                    const flatId = flat.id || flat._id;
                    const label = `${flat.block ? `${flat.block}-` : ''}${
                      flat.flatNumber || flat.flat_number || flat.number || 'Flat'
                    }`;
                    return (
                      <option key={flatId} value={flatId}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ankit Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>WhatsApp Phone Number</label>
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
                <label style={styles.label}>Alternate Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 9876500000"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Resident Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.input}
                >
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="family">Family Member</option>
                </select>
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="primaryCheck"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="primaryCheck" style={styles.checkboxLabel}>
                  <strong>Is Primary Contact</strong> (Receives WhatsApp notification first)
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? 'Saving...' : editingResident ? 'Update Resident' : 'Add Resident'}
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
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
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
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  selectGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  selectLabel: { fontSize: '14px', fontWeight: '600', color: '#475569' },
  select: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    backgroundColor: '#FFF',
    outline: 'none',
  },
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
  infoBanner: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    border: '1px solid #BFDBFE',
    padding: '14px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
  },
  infoIcon: { fontSize: '20px' },
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
  emptyState: { textAlign: 'center', padding: '50px 0', color: '#94A3B8', fontSize: '15px' },
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
  tdCenter: { padding: '14px 16px', textAlign: 'center', fontSize: '18px' },
  tdBold: { padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#0F172A' },
  starActive: { color: '#F59E0B', fontSize: '20px' },
  starInactive: { color: '#CBD5E1', fontSize: '20px' },
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
    maxWidth: '480px',
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
    backgroundColor: '#FFF',
  },
  checkboxGroup: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  checkboxLabel: { fontSize: '13px', color: '#334155', cursor: 'pointer' },
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

export default ResidentsPage;
