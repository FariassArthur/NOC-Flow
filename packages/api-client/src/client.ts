import axios, { AxiosInstance } from 'axios';

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to every request if it exists
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle unauthorized responses
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Trigger logout event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('unauthorized'));
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    try {
      return typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;
    } catch {
      return null;
    }
  }

  private clearToken(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    } catch {
      // Ignore
    }
  }

  setToken(token: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    } catch {
      // Ignore
    }
  }

  get instance() {
    return this.client;
  }
}

const apiUrl =
  (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL)) ||
  undefined;

export const apiClient = new APIClient(apiUrl);
