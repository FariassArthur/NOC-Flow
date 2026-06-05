import { apiClient } from './client';
import type { LoginInput, UserInput, OccurrenceInput, Occurrence, UserWithoutPassword, AuthToken, Notification, PaginatedResponse, Category, Equipment, Service, Runbook, EscalationRule } from '@noc/shared';

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

  logout: async () => {
    await apiClient.instance.post('/api/auth/logout');
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

  // NOC: Time tracking
  startTimer: async (id: string) => {
    const response = await apiClient.instance.post<Occurrence>(`/api/occurrences/${id}/timer/start`);
    return response.data;
  },

  pauseTimer: async (id: string) => {
    const response = await apiClient.instance.post<Occurrence>(`/api/occurrences/${id}/timer/pause`);
    return response.data;
  },

  stopTimer: async (id: string) => {
    const response = await apiClient.instance.post<Occurrence>(`/api/occurrences/${id}/timer/stop`);
    return response.data;
  },

  // NOC: RCA
  addRCA: async (id: string, data: { causaRaiz: string; tipo: string; impacto: string; acoesPreventivas?: string }) => {
    const response = await apiClient.instance.put<Occurrence>(`/api/occurrences/${id}/rca`, data);
    return response.data;
  },

  // NOC: Communication Log
  addCommLog: async (id: string, data: { contactName: string; contactType: string; description: string }) => {
    const response = await apiClient.instance.post<Occurrence>(`/api/occurrences/${id}/commlog`, data);
    return response.data;
  },
};

// NOC: Category Endpoints
export const categoryAPI = {
  list: async () => {
    const response = await apiClient.instance.get<Category[]>('/api/categories');
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.instance.get<Category>(`/api/categories/${id}`);
    return response.data;
  },
  create: async (data: Partial<Category>) => {
    const response = await apiClient.instance.post<Category>('/api/categories', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Category>) => {
    const response = await apiClient.instance.put<Category>(`/api/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/categories/${id}`);
  },
};

// NOC: Equipment Endpoints
export const equipmentAPI = {
  list: async (params?: { type?: string; status?: string; search?: string }) => {
    const response = await apiClient.instance.get<Equipment[]>('/api/equipment', { params });
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.instance.get<Equipment>(`/api/equipment/${id}`);
    return response.data;
  },
  create: async (data: Partial<Equipment>) => {
    const response = await apiClient.instance.post<Equipment>('/api/equipment', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Equipment>) => {
    const response = await apiClient.instance.put<Equipment>(`/api/equipment/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/equipment/${id}`);
  },
};

// NOC: Service Endpoints
export const serviceAPI = {
  list: async (params?: { type?: string; status?: string; search?: string }) => {
    const response = await apiClient.instance.get<Service[]>('/api/services', { params });
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.instance.get<Service>(`/api/services/${id}`);
    return response.data;
  },
  create: async (data: Partial<Service>) => {
    const response = await apiClient.instance.post<Service>('/api/services', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Service>) => {
    const response = await apiClient.instance.put<Service>(`/api/services/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/services/${id}`);
  },
};

// NOC: Runbook Endpoints
export const runbookAPI = {
  list: async (params?: { category?: string; search?: string }) => {
    const response = await apiClient.instance.get<Runbook[]>('/api/runbooks', { params });
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.instance.get<Runbook>(`/api/runbooks/${id}`);
    return response.data;
  },
  create: async (data: Partial<Runbook>) => {
    const response = await apiClient.instance.post<Runbook>('/api/runbooks', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Runbook>) => {
    const response = await apiClient.instance.put<Runbook>(`/api/runbooks/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/runbooks/${id}`);
  },
};

// NOC: Escalation Rule Endpoints
export const escalationAPI = {
  list: async () => {
    const response = await apiClient.instance.get<EscalationRule[]>('/api/escalations');
    return response.data;
  },
  get: async (id: string) => {
    const response = await apiClient.instance.get<EscalationRule>(`/api/escalations/${id}`);
    return response.data;
  },
  create: async (data: Partial<EscalationRule>) => {
    const response = await apiClient.instance.post<EscalationRule>('/api/escalations', data);
    return response.data;
  },
  update: async (id: string, data: Partial<EscalationRule>) => {
    const response = await apiClient.instance.put<EscalationRule>(`/api/escalations/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/escalations/${id}`);
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

// NOC: Runbook Execution Endpoints
export const runbookExecutionAPI = {
  list: async (params?: { status?: string; runbookId?: string; occurrenceId?: string; page?: number; limit?: number }) => {
    const response = await apiClient.instance.get<{ data: import('@noc/shared').RunbookExecution[]; total: number; page: number; totalPages: number }>('/api/runbook-executions', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.instance.get<import('@noc/shared').RunbookExecution>(`/api/runbook-executions/${id}`);
    return response.data;
  },

  start: async (runbookId: string, occurrenceId?: string) => {
    const response = await apiClient.instance.post<import('@noc/shared').RunbookExecution>('/api/runbook-executions', { runbookId, occurrenceId });
    return response.data;
  },

  completeStep: async (id: string, notes?: string, action: 'complete' | 'skip' = 'complete') => {
    const response = await apiClient.instance.put<import('@noc/shared').RunbookExecution>(`/api/runbook-executions/${id}/step`, { notes, action });
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.instance.put<import('@noc/shared').RunbookExecution>(`/api/runbook-executions/${id}/cancel`);
    return response.data;
  },
};

// Audit Endpoints
export const auditAPI = {
  list: async (params?: { action?: string; userId?: string; targetId?: string; page?: number; limit?: number }) => {
    const response = await apiClient.instance.get<{ data: import('@noc/shared').AuditLog[]; total: number; page: number; totalPages: number }>('/api/audit', { params });
    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.instance.get<import('@noc/shared').AuditLog>(`/api/audit/${id}`);
    return response.data;
  },

  stats: async () => {
    const response = await apiClient.instance.get<{ totalLogs: number; actions: { _id: string; count: number }[]; recentLogins: any[] }>('/api/audit/stats');
    return response.data;
  },
};

// Report Endpoints
export const reportAPI = {
  csv: async (params?: { status?: string; priority?: string; from?: string; to?: string; assignedTo?: string }) => {
    const response = await apiClient.instance.get('/api/reports/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  pdf: async (params?: { from?: string; to?: string }) => {
    const response = await apiClient.instance.get('/api/reports/pdf', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  summary: async (params?: { from?: string; to?: string }) => {
    const response = await apiClient.instance.get<{
      totalOccurrences: number;
      statusCounts: Record<string, number>;
      priorityCounts: Record<string, number>;
      topCreators: { userId: string; count: number; user: any }[];
      avgResolutionTimeMinutes: number;
      slaStats: { dentro: number; atrasado: number; violado: number; semSLA: number };
    }>('/api/reports/summary', { params });
    return response.data;
  },
};
