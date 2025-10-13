import { api } from './api';

export type Institution = {
  id: number;
  name: string;
  acronym?: string;
  status: 0 | 1;
};

export type InstitutionInput = {
  name: string;
  acronym?: string;
  status: 0 | 1;
};

const map = (r: any): Institution => ({
  id: Number(r.id),
  name: String(r.name ?? '').trim(),
  acronym: r.acronym ? String(r.acronym).trim() : undefined,
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

export const InstitutionsApi = {
  list: async (): Promise<Institution[]> => {
    try {
      const { data } = await api.get('/api/institutions');
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map(map);
    } catch (e) {
      permError(e);
    }
  },
  create: async (payload: InstitutionInput): Promise<Institution> => {
    try {
      const { data } = await api.post('/api/institutions', payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  update: async (id: number, payload: InstitutionInput): Promise<Institution> => {
    try {
      const { data } = await api.put(`/api/institutions/${id}`, payload);
      return map(data);
    } catch (e) {
      permError(e);
    }
  },
  remove: async (id: number) => {
    try {
      await api.delete(`/api/institutions/${id}`);
    } catch (e) {
      permError(e);
    }
  },
};
