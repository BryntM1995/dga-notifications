import { api } from './api';

// ---- Tipos base
export type BaseEntity = { id: number; name: string; status: 0 | 1 };

// Áreas (subdirections)
export type Subdirection = BaseEntity;

// Gerencias (managements)
export type Management = BaseEntity;

// Sistemas
export type System = BaseEntity;

// Módulos
export type Module = BaseEntity & { system_id: number; system_name?: string };

// Plantillas
export type TemplateEntity = {
  id: number;
  module_id: number;
  department_id: number;
  message: string;
  status: 0 | 1;
  module_name?: string;
  department_name?: string;
};

// Logs de mensajes
export type MessageLog = {
  id: number;
  status: 0 | 1; // 0=FAILED,1=SUCCESS,2=QUEUE (si el backend lo usa)
  module_name: string;
  module_id: number;
  message_template_id: number;
  created_at: string;
};

// ---- CRUD helpers
export const listAll = async <T>(path: string): Promise<T[]> => {
  const { data } = await api.get(path);
  return Array.isArray(data) ? data : (data?.data ?? []);
};

export const createOne = async <I>(path: string, payload: I) => {
  const { data } = await api.post(path, payload);
  return data;
};

export const updateOne = async <I>(path: string, id: number, payload: I) => {
  const { data } = await api.put(`${path}/${id}`, payload);
  return data;
};

export const deleteOne = async (path: string, id: number) => {
  const { data } = await api.delete(`${path}/${id}`);
  return data;
};

// ---- Recursos específicos
export const Subdirections = {
  list: () => listAll<Subdirection>('/api/subdirections'),
  create: (p: Pick<Subdirection, 'name' | 'status'>) => createOne('/api/subdirections', p),
  update: (id: number, p: Pick<Subdirection, 'name' | 'status'>) =>
    updateOne('/api/subdirections', id, p),
  remove: (id: number) => deleteOne('/api/subdirections', id),
};

export const Managements = {
  list: () => listAll<Management>('/api/managements'),
  create: (p: Pick<Management, 'name' | 'status'>) => createOne('/api/managements', p),
  update: (id: number, p: Pick<Management, 'name' | 'status'>) =>
    updateOne('/api/managements', id, p),
  remove: (id: number) => deleteOne('/api/managements', id),
};

export const Systems = {
  list: () => listAll<System>('/api/systems'),
  create: (p: Pick<System, 'name' | 'status'>) => createOne('/api/systems', p),
  update: (id: number, p: Pick<System, 'name' | 'status'>) => updateOne('/api/systems', id, p),
  remove: (id: number) => deleteOne('/api/systems', id),
};

export type ModuleInput = { name: string; system_id: number; status: 0 | 1 };
export const Modules = {
  list: () => listAll<Module>('/api/modules'),
  create: (p: ModuleInput) => createOne('/api/modules', p),
  update: (id: number, p: ModuleInput) => updateOne('/api/modules', id, p),
  remove: (id: number) => deleteOne('/api/modules', id),
};

export type TemplateInput = {
  module_id: number;
  department_id: number;
  message: string;
  status: 0 | 1;
};
export const Templates = {
  list: () => listAll<TemplateEntity>('/api/templates'),
  create: (p: TemplateInput) => createOne('/api/templates', p),
  update: (id: number, p: TemplateInput) => updateOne('/api/templates', id, p),
  remove: (id: number) => deleteOne('/api/templates', id),
};

// Logs
export const MessageLogApi = {
  list: () => listAll<MessageLog>('/api/message_log'),
};

export type UserRow = {
  id: number;
  name: string;
  last_name?: string;
  username: string;
  email: string;
  department?: string;
  status?: 0 | 1;
};

export type UserInput = {
  name: string;
  last_name?: string;
  username: string;
  email: string;
  password?: string;
  department?: string;
  status?: 0 | 1;
  role?: string;
};

// ---- mapeador robusto para distintos formatos del backend
function mapUser(u: any): UserRow {
  return {
    id: Number(u.id),
    // algunos endpoints devuelven 'full_name' en vez de 'name'
    name: String(u.name ?? u.full_name ?? '').trim(),
    last_name: (u.last_name ?? '').toString(),
    username: (u.username ?? '').toString(),
    email: (u.email ?? '').toString(),
    // puede venir 'department' o 'department_name'
    department: (u.department ?? u.department_name ?? '').toString(),
    status: (u.status ?? 1) as 0 | 1,
  };
}

export const UsersApi = {
  list: async (): Promise<UserRow[]> => {
    const { data } = await api.get('/api/users');
    const arr = Array.isArray(data) ? data : (data?.data ?? []);
    return arr.map(mapUser);
  },
  create: (payload: UserInput) => api.post('/api/register', payload).then((r) => r.data),
  update: (id: number, payload: Partial<UserInput>) =>
    api.put(`/api/users/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/api/users/${id}`).then((r) => r.data),
};
