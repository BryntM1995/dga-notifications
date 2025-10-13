// src/services/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { mockRefresh } from '../lib/mockAuth';

const useProxy = import.meta.env.VITE_USE_PROXY === 'true';
const useMock = import.meta.env.VITE_MOCK_AUTH === 'true';

// ✅ Siempre una baseURL válida:
// - Si usas proxy: usa '/' (no cadena vacía)
// - Si no, usa la env o usa '/' como fallback
const envBase = import.meta.env.VITE_API_BASE_URL || '/';
const baseURL = useProxy ? '/' : envBase.replace(/\/+$/, ''); // sin slash final

let refreshingPromise: Promise<string | null> | null = null;

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-System-Code': import.meta.env.VITE_SYSTEM_CODE ?? 'DGA-NOTIF',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

async function doRefresh(): Promise<string | null> {
  try {
    if (useMock) {
      const r = await mockRefresh();
      const newToken = r.access_token;
      const newExpireAt = Math.floor(Date.now() / 1000) + Number(r.expires_in || 0);
      localStorage.setItem('token', newToken);
      localStorage.setItem('expireAt', String(newExpireAt));
      return newToken;
    }

    const expiredToken = localStorage.getItem('token');
    if (!expiredToken) return null;

    const refreshUrl = useProxy ? '/api/refresh' : `${baseURL}/api/refresh`;
    const res = await axios.post(
      refreshUrl,
      {},
      {
        headers: { Authorization: `Bearer ${expiredToken}` },
      },
    );

    const newToken: string = res.data?.access_token;
    const expiresIn: number = Number(res.data?.expires_in ?? 0);
    if (!newToken) return null;

    localStorage.setItem('token', newToken);
    const newExpireAt = Math.floor(Date.now() / 1000) + (isNaN(expiresIn) ? 0 : expiresIn);
    localStorage.setItem('expireAt', String(newExpireAt));
    return newToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError & { config?: any }) => {
    const original = error.config || {};
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshingPromise = refreshingPromise ?? doRefresh();
      const newToken = await refreshingPromise;
      refreshingPromise = null;

      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }

    const msg =
      (error.response?.data as any)?.message || (error as any)?.code === 'ECONNABORTED'
        ? 'Tiempo de espera agotado al contactar el servidor.'
        : error.message || 'Error desconocido';
    return Promise.reject(new Error(msg));
  },
);
