import { api } from './api';

export type Area = {
  id: number;
  name: string;
  status: 0 | 1;
};

export type AreaInput = {
  name: string;
  status: 0 | 1;
};

const map = (r: any): Area => ({
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

export const AreasApi = {
  list: async (): Promise<Area[]> => {
    try {
      const { data } = await api.get('/api/subdirections');
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map(map);
    } catch (e) {
      permError(e);
    }
  },
  create: async (payload: AreaInput): Promise<Area> => {
    try {
      const { data } = await api.post('/api/subdirections', payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  update: async (id: number, payload: AreaInput): Promise<Area> => {
    try {
      const { data } = await api.put(`/api/subdirections/${id}`, payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  remove: async (id: number) => {
    try {
      await api.delete(`/api/subdirections/${id}`);
    } catch (e) {
      permError(e);
    }
  },
};
