import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getFlats, addFlat, updateFlat, deleteFlat } from '../services/api';

const FlatsPage = () => {
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState(null);

  // Form Fields
  const [flatNumber, setFlatNumber] = useState('');
  const [block, setBlock] = useState('');
  const [floor, setFloor] = useState('');
  const [isOccupied, setIsOccupied] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFlatsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFlats();
      const list = Array.isArray(res) ? res : res?.flats || res?.data || [];
      setFlats(list);
    } catch (err) {
      console.error('Flats fetch error:', err);
      const msg = err.message || 'Failed to load flats directory';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlatsList();
  }, [fetchFlatsList]);

  const openAddModal = () => {
    setEditingFlat(null);
    setFlatNumber('');
    setBlock('');
    setFloor('');
    setIsOccupied(true);
    setIsModalOpen(true);
  };

  const openEditModal = (flat) => {
    setEditingFlat(flat);
    setFlatNumber(flat.flatNumber || flat.number || '');
    setBlock(flat.block || '');
    setFloor(flat.floor !== undefined ? String(flat.floor) : '');
    setIsOccupied(flat.isOccupied !== undefined ? flat.isOccupied : flat.occupied !== false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFlat(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flatNumber || !block) {
      toast.error('Flat number and Block are required!');
      return;
    }

    setSaving(true);
    const payload = {
      flatNumber,
      block,
      floor: Number(floor) || 0,
      isOccupied: Boolean(isOccupied),
    };

    try {
      if (editingFlat) {
        const id = editingFlat.id || editingFlat._id;
        await updateFlat(id, payload);
        toast.success('Flat updated successfully!');
      } else {
        await addFlat(payload);
        toast.success('Flat added successfully!');
      }
      closeModal();
      fetchFlatsList();
    } catch (err) {
      console.error('Flat save error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to save flat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (flat) => {
    const id = flat.id || flat._id;
    const numberStr = flat.flatNumber || flat.number || 'this flat';

    if (window.confirm(`Are you sure you want to delete flat ${numberStr}?`)) {
      try {
        await deleteFlat(id);
        toast.success(`Flat ${numberStr} deleted successfully`);
        fetchFlatsList();
      } catch (err) {
        console.error('Flat delete error:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to delete flat');
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header & Add Action */}
      <div style={styles.headerBar}>
        <div>
          <h2 style={styles.title}>Flats Directory</h2>
          <p style={styles.subTitle}>Manage society blocks, apartments, and occupancy</p>
        </div>
        <button onClick={openAddModal} style={styles.addBtn}>
          ➕ Add New Flat
        </button>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      {/* Flats Table Card */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.spinnerWrapper}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading flats data...</p>
          </div>
        ) : flats.length === 0 ? (
          <div style={styles.emptyState}>
            No flats registered yet. Click "Add New Flat" to create one.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Flat Number</th>
                  <th style={styles.th}>Block</th>
                  <th style={styles.th}>Floor</th>
                  <th style={styles.th}>Occupancy Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flats.map((flat, idx) => {
                  const occupied = flat.isOccupied !== undefined ? flat.isOccupied : flat.occupied !== false;
                  return (
                    <tr key={flat.id || flat._id || idx} style={styles.tr}>
                      <td style={styles.tdBold}>{flat.flatNumber || flat.number || 'N/A'}</td>
                      <td style={styles.td}>{flat.block || '—'}</td>
                      <td style={styles.td}>{flat.floor !== undefined ? flat.floor : '—'}</td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor: occupied ? '#DEF7EC' : '#F3F4F6',
                            color: occupied ? '#03543F' : '#6B7280',
                          }}
                        >
                          {occupied ? 'Occupied' : 'Vacant'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button onClick={() => openEditModal(flat)} style={styles.editBtn}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(flat)} style={styles.deleteBtn}>
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

      {/* Add / Edit Flat Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingFlat ? 'Edit Flat Details' : 'Add New Flat'}
              </h3>
              <button onClick={closeModal} style={styles.closeBtn}>
                ✖
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Flat Number</label>
                <input
                  type="text"
                  placeholder="e.g. 101, 402"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Block / Tower</label>
                <input
                  type="text"
                  placeholder="e.g. Block A, Wing B"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Floor Number</label>
                <input
                  type="number"
                  placeholder="e.g. 1, 4"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="occupiedCheck"
                  checked={isOccupied}
                  onChange={(e) => setIsOccupied(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="occupiedCheck" style={styles.checkboxLabel}>
                  Flat is currently occupied
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={closeModal} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>
                  {saving ? 'Saving...' : editingFlat ? 'Update Flat' : 'Add Flat'}
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

export default FlatsPage;
