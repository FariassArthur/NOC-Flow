import { apiClient } from './client';
import type { LoginInput, UserInput, OccurrenceInput, Occurrence, UserWithoutPassword, AuthToken, Notification, PaginatedResponse } from '@noc/shared';

// Auth Endpoints
export const authAPI = {
  login: async (credentials: LoginInput) => {
    const response = await apiClient.instance.post<AuthToken>('/api/auth/login', credentials);
    apiClient.setToken(response.data.token);
    return response.data;
  },

  register: async (data: UserInput) => {
    const response = await apiClient.instance.post<AuthToken>('/api/auth/register', data);
    apiClient.setToken(response.data.token);
    return response.data;
  },

  logout: () => {
    apiClient.instance.post('/api/auth/logout');
  },

  me: async () => {
    const response = await apiClient.instance.get<UserWithoutPassword>('/api/auth/me');
    return response.data;
  },
};

// Occurrence Endpoints
export const occurrenceAPI = {
  list: async (params?: { status?: string; assignedTo?: string; priority?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.instance.get<Occurrence[] | PaginatedResponse<Occurrence>>('/api/occurrences', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.instance.get<Occurrence>(`/api/occurrences/${id}`);
    return response.data;
  },

  create: async (data: OccurrenceInput) => {
    const response = await apiClient.instance.post<Occurrence>('/api/occurrences', data);
    return response.data;
  },

  update: async (id: string, data: Partial<OccurrenceInput>) => {
    const response = await apiClient.instance.put<Occurrence>(`/api/occurrences/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/occurrences/${id}`);
  },

  addComment: async (id: string, text: string) => {
    const response = await apiClient.instance.post<Occurrence>(`/api/occurrences/${id}/comments`, { text });
    return response.data;
  },

  resolve: async (id: string, resolucao: string) => {
    const response = await apiClient.instance.put<Occurrence>(`/api/occurrences/${id}/resolver`, { resolucao });
    return response.data;
  },

  assign: async (id: string, assignedTo: string) => {
    const response = await apiClient.instance.put<Occurrence>(`/api/occurrences/${id}/assign`, { assignedTo });
    return response.data;
  },

  addAttachment: async (id: string, fileName: string, fileUrl: string) => {
    const response = await apiClient.instance.post<Occurrence>(`/api/occurrences/${id}/attachments`, { fileName, fileUrl });
    return response.data;
  },

  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.instance.post<{ fileName: string; fileUrl: string; size: number }>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// User Endpoints
export const userAPI = {
  list: async () => {
    const response = await apiClient.instance.get<UserWithoutPassword[]>('/api/users');
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.instance.get<UserWithoutPassword>(`/api/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<UserWithoutPassword>) => {
    const response = await apiClient.instance.put<UserWithoutPassword>(`/api/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/users/${id}`);
  },

  updateProfile: async (data: Partial<UserWithoutPassword>) => {
    const response = await apiClient.instance.put<UserWithoutPassword>('/api/users/profile', data);
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.instance.put<{ message: string }>('/api/users/password', { currentPassword, newPassword });
    return response.data;
  },
};

// Notification Endpoints
export const notificationAPI = {
  list: async () => {
    const response = await apiClient.instance.get<Notification[]>('/api/notifications');
    return response.data;
  },

  unreadCount: async () => {
    const response = await apiClient.instance.get<{ count: number }>('/api/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.instance.put<Notification>(`/api/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.instance.put<{ message: string }>('/api/notifications/read-all');
    return response.data;
  },
};
