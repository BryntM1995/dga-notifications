import { api } from './api';

export type SendSmsInput = {
  phone: string; // "8091234567"
  template: number; // id de la plantilla
  vars: string[]; // ["Juan Perez","SOL-12345"]
};

export type SendSmsResponse = {
  id: string; // ej. "MSG0000001"
  status?: string; // "sent" | ...
};

export type SmsStatus = {
  id: string;
  status: 'delivered' | 'queue' | 'failed' | string;
  timestamp?: string;
};

const permError = (e: any) => {
  const msg = (e?.response?.data?.message || '').toString();
  const is403 =
    e?.response?.status === 403 ||
    msg.toLowerCase().includes('does not have the right permissions');
  if (is403) {
    throw new Error('No tiene permisos para ejecutar esta acción (permiso requerido).');
  }
  throw new Error(e?.response?.data?.message || e?.message || 'No se pudo procesar la solicitud.');
};

export const SmsApi = {
  send: async (payload: SendSmsInput): Promise<SendSmsResponse> => {
    try {
      const { data } = await api.post('/api/sms', payload);
      return data;
    } catch (e: any) {
      permError(e);
    }
  },
  status: async (id: string): Promise<SmsStatus> => {
    try {
      const { data } = await api.get(`/api/show/${encodeURIComponent(id)}`);
      return data;
    } catch (e: any) {
      permError(e);
    }
  },
};
