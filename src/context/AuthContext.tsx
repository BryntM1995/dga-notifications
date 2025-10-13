import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { mockLogin, mockAuthInfo } from '../lib/mockAuth';

const useMock = import.meta.env.VITE_MOCK_AUTH === 'true';

export type User = {
  id: number;
  name: string;
  username: string;
  department?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  expireAt: number | null;
  login: (username: string, password: string) => Promise<void>;
  refresh: () => Promise<boolean>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  );
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [expireAt, setExpireAt] = useState<number | null>(
    localStorage.getItem('expireAt') ? Number(localStorage.getItem('expireAt')) : null,
  );

  const timerRef = useRef<number | null>(null);

  // ---- LOGIN ---------------------------------------------------------------
  const login = async (username: string, password: string) => {
    if (useMock) {
      const r = await mockLogin(username, password);
      setToken(r.token);
      setUser(r.userInfo);
      setExpireAt(r.expireAt);
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r.userInfo));
      localStorage.setItem('expireAt', String(r.expireAt));
      return;
    }

    try {
      const res = await api.post('/api/login', { username, password });
      const t = String(res.data?.token || '');
      if (!t) throw new Error('No se recibió token');

      const u: User = res.data?.userInfo;
      const exp: number = Number(res.data?.expireAt ?? 0);

      setToken(t);
      setUser(u);
      setExpireAt(exp);

      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u ?? null));
      if (exp) localStorage.setItem('expireAt', String(exp));
    } catch (e: any) {
      throw new Error('Error inesperado al intentar iniciar sesión.');
    }
  };

  // ---- REFRESH -------------------------------------------------------------
  const refresh = async (): Promise<boolean> => {
    try {
      const res = await api.post('/api/refresh');
      const newToken: string = res.data?.access_token;
      const expiresIn: number = Number(res.data?.expires_in ?? 0);
      if (!newToken) return false;

      const newExp = Math.floor(Date.now() / 1000) + (isNaN(expiresIn) ? 0 : expiresIn);

      setToken(newToken);
      setExpireAt(newExp);

      localStorage.setItem('token', newToken);
      localStorage.setItem('expireAt', String(newExp));

      return true;
    } catch {
      return false;
    }
  };

  // ---- AUTO-REFRESH 60s antes de expirar ----------------------------------
  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!token || !expireAt) return;

    const now = Math.floor(Date.now() / 1000);
    const secondsLeft = expireAt - now;

    if (secondsLeft <= 0) {
      refresh();
      return;
    }

    const when = Math.max((secondsLeft - 60) * 1000, 0); // 60s antes
    timerRef.current = window.setTimeout(() => {
      refresh();
    }, when);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [token, expireAt]);

  // ---- INFO DE AUTENTICACIÓN (opcional, para debug) -----------------------
  useEffect(() => {
    if (useMock) {
      mockAuthInfo().then((i) => console.log('Auth info (mock):', i));
    } else {
      api
        .get('/api/auth-info')
        .then((r) => console.log('Auth info:', r.data))
        .catch(() => {});
    }
  }, []);

  // ---- LOGOUT --------------------------------------------------------------
  const logout = async () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await api.post('/api/logout');
    setToken(null);
    setUser(null);
    setExpireAt(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expireAt');
  };

  const value = useMemo(
    () => ({ user, token, expireAt, login, refresh, logout }),
    [user, token, expireAt],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
