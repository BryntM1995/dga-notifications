import { listAll } from './resources';
export type Option = { id: number; name: string };

export const listDepartmentsOptions = async (): Promise<Option[]> => {
  const rows = await listAll<{ id: number; name: string }>('/api/departments');
  return rows.map((r) => ({ id: r.id, name: r.name }));
};
export const listModulesOptions = async (): Promise<Option[]> => {
  const rows = await listAll<{ id: number; name: string }>('/api/modules');
  return rows.map((r) => ({ id: r.id, name: r.name }));
};
export const listSystemsOptions = async (): Promise<Option[]> => {
  const rows = await listAll<{ id: number; name: string }>('/api/systems');
  return rows.map((r) => ({ id: r.id, name: r.name }));
};

export const listSubdirections = async (): Promise<Option[]> => {
  const rows = await listAll<{ id: number; name: string }>('/api/subdirections');
  return rows.map((r) => ({ id: r.id, name: r.name }));
};
