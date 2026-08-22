import axios from 'axios';
import { getToken } from '../utils/storage';

const API = axios.create({
  baseURL: 'http://192.168.29.167:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginAdmin = async (phone, pin) => {
  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
  const response = await API.post('/api/guards/login', { phone: formattedPhone, pin });
  return response.data;
};

export const getSociety = async () => {
  const response = await API.get('/api/societies/info');
  return response.data;
};

export const updateSociety = async (data) => {
  const response = await API.put('/api/societies/info', data);
  return response.data;
};

export const getHealth = async () => {
  const response = await API.get('/health');
  return response.data;
};

export const getFlats = async () => {
  const response = await API.get('/api/societies/flats');
  return response.data;
};

export const addFlat = async (data) => {
  const response = await API.post('/api/societies/flats', data);
  return response.data;
};

export const updateFlat = async (id, data) => {
  const response = await API.put(`/api/societies/flats/${id}`, data);
  return response.data;
};

export const deleteFlat = async (id) => {
  const response = await API.delete(`/api/societies/flats/${id}`);
  return response.data;
};

export const getResidents = async (flatId) => {
  const response = await API.get('/api/societies/residents', {
    params: flatId ? { flatId } : {},
  });
  return response.data;
};

export const addResident = async (data) => {
  const response = await API.post('/api/societies/residents', data);
  return response.data;
};

export const updateResident = async (id, data) => {
  const response = await API.put(`/api/societies/residents/${id}`, data);
  return response.data;
};

export const deleteResident = async (id) => {
  const response = await API.delete(`/api/societies/residents/${id}`);
  return response.data;
};

export const getGuards = async () => {
  const response = await API.get('/api/societies/guards');
  return response.data;
};

export const addGuard = async (data) => {
  const response = await API.post('/api/societies/guards', data);
  return response.data;
};

export const updateGuard = async (id, data) => {
  const response = await API.put(`/api/societies/guards/${id}`, data);
  return response.data;
};

export const deleteGuard = async (id) => {
  const response = await API.delete(`/api/societies/guards/${id}`);
  return response.data;
};

export const getVisitorLog = async (filters = {}) => {
  const response = await API.get('/api/societies/visitor-log', { params: filters });
  return response.data;
};

export const getActiveVisitors = async () => {
  const response = await API.get('/api/visitors/active');
  return response.data;
};

export const getDailyReport = async (date = 'today') => {
  const response = await API.get('/api/societies/visitor-log', {
    params: { date: date || 'today', limit: 100 },
  });
  return response.data;
};

export default API;
