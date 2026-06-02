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
    return data;
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
  uploadFile: async (fileUri: string, fileName: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'application/octet-stream',
    } as any);
    const { data } = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // NOC features
  startTimer: async (id: string) => {
    const { data } = await api.post(`/api/occurrences/${id}/timer/start`);
    return data;
  },
  pauseTimer: async (id: string) => {
    const { data } = await api.post(`/api/occurrences/${id}/timer/pause`);
    return data;
  },
  stopTimer: async (id: string) => {
    const { data } = await api.post(`/api/occurrences/${id}/timer/stop`);
    return data;
  },
  addRCA: async (id: string, rca: any) => {
    const { data } = await api.put(`/api/occurrences/${id}/rca`, rca);
    return data;
  },
  addCommLog: async (id: string, log: any) => {
    const { data } = await api.post(`/api/occurrences/${id}/commlog`, log);
    return data;
  },
};

export const categoryAPI = {
  list: async () => {
    const { data } = await api.get('/api/categories');
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/categories/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/api/categories', payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/api/categories/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/categories/${id}`);
  },
};

export const equipmentAPI = {
  list: async () => {
    const { data } = await api.get('/api/equipment');
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/equipment/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/api/equipment', payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/api/equipment/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/equipment/${id}`);
  },
};

export const serviceAPI = {
  list: async () => {
    const { data } = await api.get('/api/services');
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/services/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/api/services', payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/api/services/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/services/${id}`);
  },
};

export const escalationAPI = {
  list: async () => {
    const { data } = await api.get('/api/escalations');
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/escalations/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/api/escalations', payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/api/escalations/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/escalations/${id}`);
  },
};

export const runbookAPI = {
  list: async () => {
    const { data } = await api.get('/api/runbooks');
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/api/runbooks/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await api.post('/api/runbooks', payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/api/runbooks/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/runbooks/${id}`);
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
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/api/users/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/users/${id}`);
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
