import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: async (login: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { login, password });
    await AsyncStorage.setItem('token', data.token);
    return data;
  },
  register: async (payload: any) => {
    const { data } = await api.post('/api/auth/register', payload);
    await AsyncStorage.setItem('token', data.token);
    return data;
  },
  me: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
  },
};

export const occurrenceAPI = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get('/api/occurrences', { params });
    return data.data || data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/occurrences/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/api/occurrences', payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/api/occurrences/${id}`, payload);
    return data;
  },
  resolve: async (id: string, resolucao: string) => {
    const { data } = await api.put(`/api/occurrences/${id}/resolver`, { resolucao });
    return data;
  },
  addComment: async (id: string, text: string) => {
    const { data } = await api.post(`/api/occurrences/${id}/comments`, { text });
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/occurrences/${id}`);
  },
  assign: async (id: string, assignedTo: string) => {
    const { data } = await api.put(`/api/occurrences/${id}/assign`, { assignedTo });
    return data;
  },
  addAttachment: async (id: string, fileName: string, fileUrl: string) => {
    const { data } = await api.post(`/api/occurrences/${id}/attachments`, { fileName, fileUrl });
    return data;
  },
};

export const userAPI = {
  list: async () => {
    const { data } = await api.get('/api/users');
    return data;
  },
  updateProfile: async (payload: any) => {
    const { data } = await api.put('/api/users/profile', payload);
    return data;
  },
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.put('/api/users/password', { currentPassword, newPassword });
    return data;
  },
};

export const notificationAPI = {
  list: async () => {
    const { data } = await api.get('/api/notifications');
    return data;
  },
  unreadCount: async () => {
    const { data } = await api.get('/api/notifications/unread-count');
    return data;
  },
  markAsRead: async (id: string) => {
    const { data } = await api.put(`/api/notifications/${id}/read`);
    return data;
  },
  markAllAsRead: async () => {
    const { data } = await api.put('/api/notifications/read-all');
    return data;
  },
};

export default api;
