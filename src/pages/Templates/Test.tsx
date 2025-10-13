import React, { useEffect, useRef, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import SmsSendForm from '../../components/sms/SmsSendForm';
import SmsStatusCard from '../../components/sms/SmsStatusCard';
import { SmsApi, type SendSmsInput, type SmsStatus } from '../../services/sms';

const TestTemplatesPage: React.FC = () => {
  const [sending, setSending] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);
  const [status, setStatus] = useState<SmsStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);
  const pollUntil = useRef<number>(0); // epoch ms

  const clearPoll = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (id: string) => {
    clearPoll();
    // 60s de ventana
    pollUntil.current = Date.now() + 60_000;
    pollRef.current = window.setInterval(async () => {
      if (Date.now() > pollUntil.current) {
        clearPoll();
        return;
      }
      await fetchStatus(id, true);
    }, 5000);
  };

  const fetchStatus = async (id: string, silent = false) => {
    setLoadingStatus(!silent);
    try {
      const s = await SmsApi.status(id);
      setStatus(s);
      // Si llega a terminal, detenemos polling
      const terminal = ['delivered', 'failed'].includes((s.status || '').toLowerCase());
      if (terminal) clearPoll();
    } catch (e: any) {
      setAlert(e?.message || 'No se pudo consultar el estado.');
      clearPoll();
    } finally {
      setLoadingStatus(false);
    }
  };

  const send = async (payload: SendSmsInput) => {
    setSending(true);
    setAlert(null);
    try {
      const res = await SmsApi.send(payload);
      const id = res.id;
      setLastId(id);
      setStatus({ id, status: res.status || 'sent' });
      setAlert(`Mensaje enviado. ID: ${id}`);
      // consultamos una vez y empezamos polling
      await fetchStatus(id, true);
      startPolling(id);
    } catch (e: any) {
      setAlert(e?.message || 'No se pudo enviar el SMS.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    return () => clearPoll();
  }, []);

  return (
    <>
      <PageHeader title="Prueba de plantillas" id="TEMP-TST-001" />

      {alert && (
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <span>{alert}</span>
          <button className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <SmsSendForm onSend={send} processing={sending} />
        </div>

        <div className="col-12 col-lg-6">
          {lastId ? (
            <div className="vstack gap-3">
              <SmsStatusCard
                data={status}
                loading={loadingStatus}
                onRefresh={() => lastId && fetchStatus(lastId)}
              />
              <div className="card">
                <div className="card-body">
                  <label className="form-label">Consultar por ID</label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      defaultValue={lastId}
                      onChange={(e) => setLastId(e.target.value.trim())}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => lastId && fetchStatus(lastId)}
                      disabled={!lastId}
                    >
                      Consultar
                    </button>
                  </div>
                  <div className="form-text">
                    Ej.: <code>MSG0000001</code>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-muted">Aún no hay un mensaje enviado.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TestTemplatesPage;
