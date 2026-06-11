import { apiClient, APIClient } from './client';
import type {
  LoginInput,
  UserInput,
  OccurrenceInput,
  Occurrence,
  UserWithoutPassword,
  AuthToken,
  Notification,
  PaginatedResponse,
  Category,
  Equipment,
  Service,
  Runbook,
  EscalationRule,
  Department,
  OccurrenceTemplate,
  OnCallShift,
  KnowledgeArticle,
  ReportSchedule,
} from '@ccore/shared';

export function createAuthAPI(client: APIClient) {
  return {
    login: async (credentials: LoginInput) => {
      const response = await client.instance.post<AuthToken>('/api/auth/login', credentials);
      client.setToken(response.data.token);
      return response.data;
    },

    register: async (data: UserInput) => {
      const response = await client.instance.post<AuthToken>('/api/auth/register', data);
      client.setToken(response.data.token);
      return response.data;
    },

    logout: async () => {
      await client.instance.post('/api/auth/logout');
    },

    me: async () => {
      const response = await client.instance.get<UserWithoutPassword>('/api/auth/me');
      return response.data;
    },
  };
}

export function createOccurrenceAPI(client: APIClient) {
  return {
    list: async (params?: {
      status?: string;
      assignedTo?: string;
      priority?: string;
      search?: string;
      page?: number;
      limit?: number;
    }) => {
      const response = await client.instance.get<Occurrence[] | PaginatedResponse<Occurrence>>(
        '/api/occurrences',
        { params }
      );
      return response.data;
    },

    get: async (id: string) => {
      const response = await client.instance.get<Occurrence>(`/api/occurrences/${id}`);
      return response.data;
    },

    create: async (data: OccurrenceInput) => {
      const response = await client.instance.post<Occurrence>('/api/occurrences', data);
      return response.data;
    },

    update: async (id: string, data: Partial<OccurrenceInput>) => {
      const response = await client.instance.put<Occurrence>(`/api/occurrences/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      await client.instance.delete(`/api/occurrences/${id}`);
    },

    addComment: async (id: string, text: string) => {
      const response = await client.instance.post<Occurrence>(`/api/occurrences/${id}/comments`, {
        text,
      });
      return response.data;
    },

    resolve: async (id: string, resolucao: string) => {
      const response = await client.instance.put<Occurrence>(`/api/occurrences/${id}/resolver`, {
        resolucao,
      });
      return response.data;
    },

    assign: async (id: string, assignedTo: string) => {
      const response = await client.instance.put<Occurrence>(`/api/occurrences/${id}/assign`, {
        assignedTo,
      });
      return response.data;
    },

    addAttachment: async (id: string, fileName: string, fileUrl: string) => {
      const response = await client.instance.post<Occurrence>(
        `/api/occurrences/${id}/attachments`,
        { fileName, fileUrl }
      );
      return response.data;
    },

    upload: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await client.instance.post<{
        fileName: string;
        fileUrl: string;
        size: number;
      }>('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },

    uploadFile: async (uri: string, name: string) => {
      const formData = new FormData();
      formData.append('file', { uri, name, type: 'application/octet-stream' } as unknown as Blob);
      const response = await client.instance.post<{
        fileName: string;
        fileUrl: string;
        size: number;
      }>('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },

    startTimer: async (id: string) => {
      const response = await client.instance.post<Occurrence>(`/api/occurrences/${id}/timer/start`);
      return response.data;
    },

    pauseTimer: async (id: string) => {
      const response = await client.instance.post<Occurrence>(`/api/occurrences/${id}/timer/pause`);
      return response.data;
    },

    stopTimer: async (id: string) => {
      const response = await client.instance.post<Occurrence>(`/api/occurrences/${id}/timer/stop`);
      return response.data;
    },

    addRCA: async (
      id: string,
      data: { causaRaiz: string; tipo: string; impacto: string; acoesPreventivas?: string }
    ) => {
      const response = await client.instance.put<Occurrence>(`/api/occurrences/${id}/rca`, data);
      return response.data;
    },

    addCommLog: async (
      id: string,
      data: { contactName: string; contactType: string; description: string }
    ) => {
      const response = await client.instance.post<Occurrence>(
        `/api/occurrences/${id}/commlog`,
        data
      );
      return response.data;
    },

    toggleChecklistItem: async (id: string, itemId: string, done?: boolean) => {
      const response = await client.instance.post<Occurrence>(
        `/api/occurrences/${id}/checklist/${itemId}/toggle`,
        { done }
      );
      return response.data;
    },
  };
}

export function createCategoryAPI(client: APIClient) {
  return {
    list: async () => {
      const response = await client.instance.get<Category[]>('/api/categories');
      return response.data;
    },
    get: async (id: string) => {
      const response = await client.instance.get<Category>(`/api/categories/${id}`);
      return response.data;
    },
    create: async (data: Partial<Category>) => {
      const response = await client.instance.post<Category>('/api/categories', data);
      return response.data;
    },
    update: async (id: string, data: Partial<Category>) => {
      const response = await client.instance.put<Category>(`/api/categories/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/categories/${id}`);
    },
  };
}

export function createEquipmentAPI(client: APIClient) {
  return {
    list: async (params?: { type?: string; status?: string; search?: string }) => {
      const response = await client.instance.get<Equipment[]>('/api/equipment', { params });
      return response.data;
    },
    get: async (id: string) => {
      const response = await client.instance.get<Equipment>(`/api/equipment/${id}`);
      return response.data;
    },
    create: async (data: Partial<Equipment>) => {
      const response = await client.instance.post<Equipment>('/api/equipment', data);
      return response.data;
    },
    update: async (id: string, data: Partial<Equipment>) => {
      const response = await client.instance.put<Equipment>(`/api/equipment/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/equipment/${id}`);
    },
  };
}

export function createServiceAPI(client: APIClient) {
  return {
    list: async (params?: { type?: string; status?: string; search?: string }) => {
      const response = await client.instance.get<Service[]>('/api/services', { params });
      return response.data;
    },
    get: async (id: string) => {
      const response = await client.instance.get<Service>(`/api/services/${id}`);
      return response.data;
    },
    create: async (data: Partial<Service>) => {
      const response = await client.instance.post<Service>('/api/services', data);
      return response.data;
    },
    update: async (id: string, data: Partial<Service>) => {
      const response = await client.instance.put<Service>(`/api/services/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/services/${id}`);
    },
  };
}

export function createRunbookAPI(client: APIClient) {
  return {
    list: async (params?: { category?: string; search?: string }) => {
      const response = await client.instance.get<Runbook[]>('/api/runbooks', { params });
      return response.data;
    },
    get: async (id: string) => {
      const response = await client.instance.get<Runbook>(`/api/runbooks/${id}`);
      return response.data;
    },
    create: async (data: Partial<Runbook>) => {
      const response = await client.instance.post<Runbook>('/api/runbooks', data);
      return response.data;
    },
    update: async (id: string, data: Partial<Runbook>) => {
      const response = await client.instance.put<Runbook>(`/api/runbooks/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/runbooks/${id}`);
    },
  };
}

export function createEscalationAPI(client: APIClient) {
  return {
    list: async () => {
      const response = await client.instance.get<EscalationRule[]>('/api/escalations');
      return response.data;
    },
    get: async (id: string) => {
      const response = await client.instance.get<EscalationRule>(`/api/escalations/${id}`);
      return response.data;
    },
    create: async (data: Partial<EscalationRule>) => {
      const response = await client.instance.post<EscalationRule>('/api/escalations', data);
      return response.data;
    },
    update: async (id: string, data: Partial<EscalationRule>) => {
      const response = await client.instance.put<EscalationRule>(`/api/escalations/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/escalations/${id}`);
    },
  };
}

export function createUserAPI(client: APIClient) {
  return {
    list: async () => {
      const response = await client.instance.get<UserWithoutPassword[]>('/api/users');
      return response.data;
    },

    get: async (id: string) => {
      const response = await client.instance.get<UserWithoutPassword>(`/api/users/${id}`);
      return response.data;
    },

    create: async (data: {
      username: string;
      email: string;
      password: string;
      fullName: string;
      department: string;
      cargo: string;
      role: string;
    }) => {
      const response = await client.instance.post<UserWithoutPassword>('/api/users', data);
      return response.data;
    },

    update: async (id: string, data: Partial<UserWithoutPassword>) => {
      const response = await client.instance.put<UserWithoutPassword>(`/api/users/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      await client.instance.delete(`/api/users/${id}`);
    },

    updateProfile: async (data: Partial<UserWithoutPassword>) => {
      const response = await client.instance.put<UserWithoutPassword>('/api/users/profile', data);
      return response.data;
    },

    updatePassword: async (currentPassword: string, newPassword: string) => {
      const response = await client.instance.put<{ message: string }>('/api/users/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    },

    resetPassword: async (id: string, newPassword: string) => {
      const response = await client.instance.put<{ message: string }>(
        `/api/users/${id}/reset-password`,
        { newPassword }
      );
      return response.data;
    },
  };
}

export function createNotificationAPI(client: APIClient) {
  return {
    list: async () => {
      const response = await client.instance.get<Notification[]>('/api/notifications');
      return response.data;
    },

    unreadCount: async () => {
      const response = await client.instance.get<{ count: number }>(
        '/api/notifications/unread-count'
      );
      return response.data;
    },

    markAsRead: async (id: string) => {
      const response = await client.instance.put<Notification>(`/api/notifications/${id}/read`);
      return response.data;
    },

    markAllAsRead: async () => {
      const response = await client.instance.put<{ message: string }>(
        '/api/notifications/read-all'
      );
      return response.data;
    },
  };
}

export function createRunbookExecutionAPI(client: APIClient) {
  return {
    list: async (params?: {
      status?: string;
      runbookId?: string;
      occurrenceId?: string;
      page?: number;
      limit?: number;
    }) => {
      const response = await client.instance.get<{
        data: import('@ccore/shared').RunbookExecution[];
        total: number;
        page: number;
        totalPages: number;
      }>('/api/runbook-executions', { params });
      return response.data;
    },

    get: async (id: string) => {
      const response = await client.instance.get<import('@ccore/shared').RunbookExecution>(
        `/api/runbook-executions/${id}`
      );
      return response.data;
    },

    start: async (runbookId: string, occurrenceId?: string) => {
      const response = await client.instance.post<import('@ccore/shared').RunbookExecution>(
        '/api/runbook-executions',
        { runbookId, occurrenceId }
      );
      return response.data;
    },

    completeStep: async (id: string, notes?: string, action: 'complete' | 'skip' = 'complete') => {
      const response = await client.instance.put<import('@ccore/shared').RunbookExecution>(
        `/api/runbook-executions/${id}/step`,
        { notes, action }
      );
      return response.data;
    },

    cancel: async (id: string) => {
      const response = await client.instance.put<import('@ccore/shared').RunbookExecution>(
        `/api/runbook-executions/${id}/cancel`
      );
      return response.data;
    },
  };
}

export function createAuditAPI(client: APIClient) {
  return {
    list: async (params?: {
      action?: string;
      userId?: string;
      targetId?: string;
      page?: number;
      limit?: number;
    }) => {
      const response = await client.instance.get<{
        data: import('@ccore/shared').AuditLog[];
        total: number;
        page: number;
        totalPages: number;
      }>('/api/audit', { params });
      return response.data;
    },

    get: async (id: string) => {
      const response = await client.instance.get<import('@ccore/shared').AuditLog>(
        `/api/audit/${id}`
      );
      return response.data;
    },

    stats: async () => {
      const response = await client.instance.get<{
        totalLogs: number;
        actions: { _id: string; count: number }[];
        recentLogins: { userId: string; timestamp: string; ip?: string }[];
      }>('/api/audit/stats');
      return response.data;
    },
  };
}

export function createReportAPI(client: APIClient) {
  return {
    csv: async (params?: {
      status?: string;
      priority?: string;
      from?: string;
      to?: string;
      assignedTo?: string;
    }) => {
      const response = await client.instance.get('/api/reports/csv', {
        params,
        responseType: 'blob',
      });
      return response.data;
    },

    pdf: async (params?: { from?: string; to?: string }) => {
      const response = await client.instance.get('/api/reports/pdf', {
        params,
        responseType: 'blob',
      });
      return response.data;
    },

    summary: async (params?: { from?: string; to?: string }) => {
      const response = await client.instance.get<{
        totalOccurrences: number;
        statusCounts: Record<string, number>;
        priorityCounts: Record<string, number>;
        topCreators: { userId: string; count: number; user: UserWithoutPassword }[];
        avgResolutionTimeMinutes: number;
        slaStats: { dentro: number; atrasado: number; violado: number; semSLA: number };
      }>('/api/reports/summary', { params });
      return response.data;
    },
  };
}

export function createTemplateAPI(client: APIClient) {
  return {
    list: async () => {
      const response = await client.instance.get<OccurrenceTemplate[]>('/api/templates');
      return response.data;
    },
    create: async (data: Partial<OccurrenceTemplate>) => {
      const response = await client.instance.post<OccurrenceTemplate>('/api/templates', data);
      return response.data;
    },
    update: async (id: string, data: Partial<OccurrenceTemplate>) => {
      const response = await client.instance.put<OccurrenceTemplate>(`/api/templates/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/templates/${id}`);
    },
  };
}

export function createDepartmentAPI(client: APIClient) {
  return {
    list: async () => {
      const response = await client.instance.get<Department[]>('/api/departments');
      return response.data;
    },
    create: async (data: { name: string; description?: string }) => {
      const response = await client.instance.post<Department>('/api/departments', data);
      return response.data;
    },
    update: async (id: string, data: { name?: string; description?: string }) => {
      const response = await client.instance.put<Department>(`/api/departments/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/departments/${id}`);
    },
  };
}

export function createDashboardAPI(client: APIClient) {
  return {
    stats: async (params?: { from?: string; to?: string }) => {
      const response = await client.instance.get('/api/dashboard/stats', { params });
      return response.data;
    },
    timeline: async (days?: number) => {
      const response = await client.instance.get('/api/dashboard/timeline', {
        params: { days },
      });
      return response.data;
    },
    departmentSla: async (params?: { from?: string; to?: string }) => {
      const response = await client.instance.get('/api/dashboard/department-sla', { params });
      return response.data;
    },
  };
}

export function createOnCallAPI(client: APIClient) {
  return {
    list: async (params?: { department?: string; active?: string }) => {
      const response = await client.instance.get<{ data: OnCallShift[] }>('/api/oncall-shifts', {
        params,
      });
      return response.data;
    },
    get: async (id: string) => {
      const response = await client.instance.get<OnCallShift>(`/api/oncall-shifts/${id}`);
      return response.data;
    },
    create: async (data: Partial<OnCallShift>) => {
      const response = await client.instance.post<OnCallShift>('/api/oncall-shifts', data);
      return response.data;
    },
    update: async (id: string, data: Partial<OnCallShift>) => {
      const response = await client.instance.put<OnCallShift>(`/api/oncall-shifts/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/oncall-shifts/${id}`);
    },
    current: async () => {
      const response = await client.instance.get('/api/oncall-shifts/current');
      return response.data;
    },
  };
}

export function createKnowledgeAPI(client: APIClient) {
  return {
    list: async (params?: {
      search?: string;
      category?: string;
      published?: string;
      page?: number;
      limit?: number;
    }) => {
      const response = await client.instance.get<{
        data: KnowledgeArticle[];
        total: number;
        page: number;
        totalPages: number;
      }>('/api/knowledge', { params });
      return response.data;
    },
    get: async (id: string) => {
      const response = await client.instance.get<KnowledgeArticle>(`/api/knowledge/${id}`);
      return response.data;
    },
    create: async (data: Partial<KnowledgeArticle>) => {
      const response = await client.instance.post<KnowledgeArticle>('/api/knowledge', data);
      return response.data;
    },
    update: async (id: string, data: Partial<KnowledgeArticle>) => {
      const response = await client.instance.put<KnowledgeArticle>(`/api/knowledge/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/knowledge/${id}`);
    },
    categories: async () => {
      const response = await client.instance.get<string[]>('/api/knowledge/categories');
      return response.data;
    },
  };
}

export function createEquipmentHistoryAPI(client: APIClient) {
  return {
    list: async (equipmentId: string, params?: { page?: number; limit?: number }) => {
      const response = await client.instance.get(`/api/equipment-history/${equipmentId}`, {
        params,
      });
      return response.data;
    },
    summary: async (equipmentId: string) => {
      const response = await client.instance.get(`/api/equipment-history/${equipmentId}/summary`);
      return response.data;
    },
  };
}

export function createReportScheduleAPI(client: APIClient) {
  return {
    list: async () => {
      const response = await client.instance.get<{ data: ReportSchedule[] }>(
        '/api/report-schedules'
      );
      return response.data;
    },
    create: async (data: Partial<ReportSchedule>) => {
      const response = await client.instance.post<ReportSchedule>('/api/report-schedules', data);
      return response.data;
    },
    update: async (id: string, data: Partial<ReportSchedule>) => {
      const response = await client.instance.put<ReportSchedule>(
        `/api/report-schedules/${id}`,
        data
      );
      return response.data;
    },
    delete: async (id: string) => {
      await client.instance.delete(`/api/report-schedules/${id}`);
    },
  };
}

export function createAllEndpoints(client: APIClient) {
  return {
    authAPI: createAuthAPI(client),
    occurrenceAPI: createOccurrenceAPI(client),
    categoryAPI: createCategoryAPI(client),
    equipmentAPI: createEquipmentAPI(client),
    serviceAPI: createServiceAPI(client),
    runbookAPI: createRunbookAPI(client),
    escalationAPI: createEscalationAPI(client),
    userAPI: createUserAPI(client),
    notificationAPI: createNotificationAPI(client),
    runbookExecutionAPI: createRunbookExecutionAPI(client),
    auditAPI: createAuditAPI(client),
    reportAPI: createReportAPI(client),
    departmentAPI: createDepartmentAPI(client),
    templateAPI: createTemplateAPI(client),
    dashboardAPI: createDashboardAPI(client),
    onCallAPI: createOnCallAPI(client),
    knowledgeAPI: createKnowledgeAPI(client),
    equipmentHistoryAPI: createEquipmentHistoryAPI(client),
    reportScheduleAPI: createReportScheduleAPI(client),
  };
}

export const authAPI = createAuthAPI(apiClient);
export const occurrenceAPI = createOccurrenceAPI(apiClient);
export const categoryAPI = createCategoryAPI(apiClient);
export const equipmentAPI = createEquipmentAPI(apiClient);
export const serviceAPI = createServiceAPI(apiClient);
export const runbookAPI = createRunbookAPI(apiClient);
export const escalationAPI = createEscalationAPI(apiClient);
export const userAPI = createUserAPI(apiClient);
export const notificationAPI = createNotificationAPI(apiClient);
export const runbookExecutionAPI = createRunbookExecutionAPI(apiClient);
export const auditAPI = createAuditAPI(apiClient);
export const reportAPI = createReportAPI(apiClient);
export const departmentAPI = createDepartmentAPI(apiClient);
export const templateAPI = createTemplateAPI(apiClient);
export const dashboardAPI = createDashboardAPI(apiClient);
export const onCallAPI = createOnCallAPI(apiClient);
export const knowledgeAPI = createKnowledgeAPI(apiClient);
export const equipmentHistoryAPI = createEquipmentHistoryAPI(apiClient);
export const reportScheduleAPI = createReportScheduleAPI(apiClient);
