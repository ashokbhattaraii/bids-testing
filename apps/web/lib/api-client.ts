import axios from 'axios';
import { API_URL } from '@/config';

const TOKEN_KEY = 'hamro_life_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type ApiSuccess<T> = { success: true; data: T; message?: string };
type ApiError = { success: false; message: string };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

const http = axios.create({ baseURL: API_URL });

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function request<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data: json } = await promise;
  if (!json.success) {
    throw new Error(json.message || 'Request failed');
  }
  return json.data;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> =>
    request(http.get<ApiResponse<T>>(path)),

  post: <T>(path: string, body: unknown): Promise<T> =>
    request(http.post<ApiResponse<T>>(path, body)),

  put: <T>(path: string, body: unknown): Promise<T> =>
    request(http.put<ApiResponse<T>>(path, body)),

  del: <T>(path: string): Promise<T> =>
    request(http.delete<ApiResponse<T>>(path)),

  upload: <T>(path: string, formData: FormData): Promise<T> =>
    request(
      http.post<ApiResponse<T>>(path, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),
};
