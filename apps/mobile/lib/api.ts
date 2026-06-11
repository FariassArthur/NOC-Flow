import { APIClient, createAllEndpoints } from '@ccore/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const mobileClient = new APIClient(API_URL, {
  getToken: () => AsyncStorage.getItem('token') as unknown as string | null,
  setToken: (token: string) => AsyncStorage.setItem('token', token),
  clearToken: () => AsyncStorage.removeItem('token'),
});

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
} = createAllEndpoints(mobileClient);

export default api;
