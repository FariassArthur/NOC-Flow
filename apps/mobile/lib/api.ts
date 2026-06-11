import { APIClient, createAllEndpoints } from '@ccore/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

let cachedToken: string | null = null;

AsyncStorage.getItem('token').then((t) => {
  cachedToken = t;
});

export const setCachedToken = (token: string | null) => {
  cachedToken = token;
};

const unauthorizedListeners: Set<() => void> = new Set();

export const onUnauthorized = (handler: () => void): (() => void) => {
  unauthorizedListeners.add(handler);
  return () => {
    unauthorizedListeners.delete(handler);
  };
};

const notifyUnauthorized = () => {
  unauthorizedListeners.forEach((fn) => fn());
};

const mobileClient = new APIClient(API_URL, {
  getToken: () => cachedToken,
  setToken: (token: string) => {
    cachedToken = token;
    AsyncStorage.setItem('token', token);
  },
  clearToken: () => {
    cachedToken = null;
    AsyncStorage.removeItem('token');
  },
});

mobileClient.instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

const api = mobileClient.instance;

export const {
  authAPI,
  occurrenceAPI,
  categoryAPI,
  equipmentAPI,
  serviceAPI,
  escalationAPI,
  runbookAPI,
  userAPI,
  notificationAPI,
  runbookExecutionAPI,
  auditAPI,
  reportAPI,
  departmentAPI,
  templateAPI,
  dashboardAPI,
  onCallAPI,
  knowledgeAPI,
  equipmentHistoryAPI,
  reportScheduleAPI,
} = createAllEndpoints(mobileClient);

export default api;
