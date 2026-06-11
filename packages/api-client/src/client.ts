import axios, { AxiosInstance } from 'axios';

export interface StorageAdapter {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
}

const defaultStorage: StorageAdapter = {
  getToken() {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    } catch {
      return null;
    }
  },
  setToken(token: string) {
    try {
      if (typeof window !== 'undefined') localStorage.setItem('token', token);
    } catch {
      /* noop */
    }
  },
  clearToken() {
    try {
      if (typeof window !== 'undefined') localStorage.removeItem('token');
    } catch {
      /* noop */
    }
  },
};

export class APIClient {
  private client: AxiosInstance;
  private storage: StorageAdapter;

  constructor(baseURL: string = '', storage: StorageAdapter = defaultStorage) {
    this.storage = storage;
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = this.storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.storage.clearToken();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('unauthorized'));
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.storage.setToken(token);
  }

  get instance() {
    return this.client;
  }
}

const apiUrl =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL)) ||
  undefined;

export const apiClient = new APIClient(apiUrl);
