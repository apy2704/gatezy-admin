import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { saveToken, saveAdmin } from '../utils/storage';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone || !pin) {
      setError('Please enter both phone number and PIN');
      return;
    }

    setLoading(true);
    try {
      const response = await loginAdmin(phone, pin);
      const token = response.token || response.accessToken || response.jwt;
      const adminData = response.guard || response.user || response.admin || { phone };

      if (token) {
        saveToken(token);
        saveAdmin(adminData);
        navigate('/');
      } else {
        if (response.success) {
          saveToken('demo_token');
          saveAdmin(adminData);
          navigate('/');
        } else {
          setError(response.message || 'Login failed. Invalid token response.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to GATEZY backend server';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>🛡️</div>
          <h1 style={styles.brandTitle}>GATEZY</h1>
          <p style={styles.tagline}>Smart Gated Community Management System</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>Secretary Login</h2>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile Phone Number</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Security PIN</label>
            <input
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  brandTitle: {
    margin: '0 0 4px 0',
    fontSize: '32px',
    fontWeight: '800',
    color: '#1E3A5F',
    letterSpacing: '1.5px',
  },
  tagline: {
    margin: 0,
    fontSize: '14px',
    color: '#64748B',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formTitle: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '15px',
    outline: 'none',
  },
  submitBtn: {
    marginTop: '10px',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#1E3A5F',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
    transition: 'background-color 0.2s ease',
  },
};

export default LoginPage;
