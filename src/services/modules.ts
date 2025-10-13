import { api } from './api';
import { throwPermOrDefault } from './_errors';

export type ModuleEntity = {
  id: number;
  name: string;
  status: 0 | 1;
  system_id: number;
  system_name?: string;
};

export type ModuleInput = {
  name: string;
  status: 0 | 1;
  system_id: number;
};

const map = (r: any): ModuleEntity => ({
  id: Number(r.id),
  name: String(r.name ?? '').trim(),
  status: (r.status ?? 1) as 0 | 1,
  system_id: Number(r.system_id ?? 0),
  system_name: r.system_name ?? undefined,
});

export const ModulesApi = {
  async list(): Promise<ModuleEntity[]> {
    try {
      const { data } = await api.get('/api/modules');
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map(map);
    } catch (e) {
      throwPermOrDefault(e);
    }
  },
  async create(payload: ModuleInput): Promise<ModuleEntity> {
    try {
      const { data } = await api.post('/api/modules', payload);
      return map(data);
    } catch (e) {
      throwPermOrDefault(e);
    }
  },
  async update(id: number, payload: ModuleInput): Promise<ModuleEntity> {
    try {
      const { data } = await api.put(`/api/modules/${id}`, payload);
      return map(data);
    } catch (e) {
      throwPermOrDefault(e);
    }
  },
  async remove(id: number): Promise<void> {
    try {
      await api.delete(`/api/modules/${id}`);
    } catch (e) {
      throwPermOrDefault(e);
    }
  },
};
