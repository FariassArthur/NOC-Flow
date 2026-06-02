import { apiClient } from './client';
import type { LoginInput, UserInput, OccurrenceInput, Occurrence, UserWithoutPassword, AuthToken } from '@noc/shared';

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
  list: async (params?: { status?: string; assignedTo?: string; priority?: string }) => {
    const response = await apiClient.instance.get<Occurrence[]>('/api/occurrences', { params });
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
};
