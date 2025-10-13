import { api } from './api';

export type Management = {
  id: number;
  name: string;
  subdirection_id: number;
  subdirection_name?: string;
  status: 0 | 1;
};

export type ManagementInput = {
  name: string;
  subdirection_id: number;
  status: 0 | 1;
};

const map = (r: any): Management => ({
  id: Number(r.id),
  name: String(r.name ?? '').trim(),
  subdirection_id: Number(r.subdirection_id ?? r.area_id ?? 0),
  subdirection_name: (r.subdirection_name ?? r.area_name ?? '') || undefined,
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

export const ManagementsApi = {
  list: async (): Promise<Management[]> => {
    try {
      const { data } = await api.get('/api/managements');
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map(map);
    } catch (e) {
      permError(e);
    }
  },
  create: async (payload: ManagementInput): Promise<Management> => {
    try {
      const { data } = await api.post('/api/managements', payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  update: async (id: number, payload: ManagementInput): Promise<Management> => {
    try {
      const { data } = await api.put(`/api/managements/${id}`, payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  remove: async (id: number) => {
    try {
      await api.delete(`/api/managements/${id}`);
    } catch (e) {
      permError(e);
    }
  },
};
