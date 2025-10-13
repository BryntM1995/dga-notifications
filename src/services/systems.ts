import { api } from './api';

export type SystemEntity = {
  id: number;
  name: string;
  status: 0 | 1;
};

export type SystemInput = {
  name: string;
  status: 0 | 1;
};

const map = (r: any): SystemEntity => ({
  id: Number(r.id),
  name: String(r.name ?? '').trim(),
  status: (r.status ?? 1) as 0 | 1,
});

const permError = (e: any) => {
  const msg = (e?.response?.data?.message || '').toString();
  const is403 =
    e?.response?.status === 403 ||
    msg.toLowerCase().includes('does not have the right permissions');
  if (is403) throw new Error('No tiene permisos para ejecutar esta acción.');
  throw new Error(e?.response?.data?.message || e?.message || 'Error desconocido');
};

export const SystemsApi = {
  list: async (): Promise<SystemEntity[]> => {
    try {
      const { data } = await api.get('/api/systems');
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map(map);
    } catch (e) {
      permError(e);
    }
  },
  create: async (payload: SystemInput): Promise<SystemEntity> => {
    try {
      const { data } = await api.post('/api/systems', payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  update: async (id: number, payload: SystemInput): Promise<SystemEntity> => {
    try {
      const { data } = await api.put(`/api/systems/${id}`, payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  remove: async (id: number) => {
    try {
      await api.delete(`/api/systems/${id}`);
    } catch (e) {
      permError(e);
    }
  },
};
