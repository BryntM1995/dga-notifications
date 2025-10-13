import { api } from './api';
import type { Department } from '../types/department';

export type DepartmentInput = {
  name: string;
  status: 0 | 1;
  subdirection_id: number;
  management_id: number;
};

export async function listDepartmentsAll(): Promise<Department[]> {
  const { data } = await api.get('/api/departments');
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

export async function getDepartment(id: number): Promise<Department> {
  const { data } = await api.get(`/api/departments/${id}`);
  return data;
}

export async function createDepartment(payload: DepartmentInput): Promise<Department> {
  const { data } = await api.post('/api/departments', payload);
  return data;
}

export async function updateDepartment(id: number, payload: DepartmentInput): Promise<Department> {
  const { data } = await api.put(`/api/departments/${id}`, payload);
  return data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/api/departments/${id}`);
}
