import { api } from './api';

export type MessageLog = {
  id: number | string;
  status: 'SUCCESS' | 'FAILED' | 'QUEUE' | string;
  module_name?: string;
  module_id?: number;
  message_template_id?: number;
  phone?: string;
  payload?: unknown;
  error?: string | null;
  created_at: string;
};

export type LogFilters = {
  q?: string;
  status?: 'SUCCESS' | 'FAILED' | 'QUEUE' | '';
  module_id?: number;
  date_from?: string;
  date_to?: string;
};

const map = (r: any): MessageLog => ({
  id: r.id,
  status: (r.status ?? '').toString().toUpperCase(),
  module_name: r.module_name ?? r.module ?? undefined,
  module_id: r.module_id ?? undefined,
  message_template_id: r.message_template_id ?? r.template_id ?? undefined,
  phone: r.phone ?? r.to ?? undefined,
  payload: r.payload ?? r.vars ?? undefined,
  error: r.error ?? null,
  created_at: r.created_at ?? r.date ?? '',
});

const permError = (e: any) => {
  const msg = (e?.response?.data?.message || e?.message || '').toString();
  const is403 =
    e?.response?.status === 403 ||
    msg.toLowerCase().includes('does not have the right permissions');
  if (is403) throw new Error('No tiene permisos para ejecutar esta acción.');
  throw new Error(msg || 'Error desconocido');
};

export const MonitoringApi = {
  list: async (filters?: LogFilters): Promise<MessageLog[]> => {
    try {
      const params: Record<string, any> = {};
      if (filters?.q) params.q = filters.q;
      if (filters?.status) params.status = filters.status;
      if (filters?.module_id) params.module_id = filters.module_id;
      if (filters?.date_from) params.date_from = filters.date_from;
      if (filters?.date_to) params.date_to = filters.date_to;

      const { data } = await api.get('/api/message_log', { params });
      const arr = Array.isArray(data) ? data : (data?.data ?? []);
      return arr.map(map);
    } catch (e) {
      permError(e);
    }
  },
};
