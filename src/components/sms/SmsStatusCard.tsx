import React from 'react';
import type { SmsStatus } from '../../services/sms';

type Props = {
  data?: SmsStatus | null;
  loading?: boolean;
  onRefresh?: () => void;
};

const badge = (s?: string) => {
  switch ((s || '').toLowerCase()) {
    case 'delivered':
      return <span className="badge bg-success">delivered</span>;
    case 'queue':
    case 'queued':
      return <span className="badge bg-warning text-dark">queue</span>;
    case 'failed':
      return <span className="badge bg-danger">failed</span>;
    default:
      return <span className="badge bg-secondary">{s || 'unknown'}</span>;
  }
};

const SmsStatusCard: React.FC<Props> = ({ data, loading, onRefresh }) => {
  if (!data) return null;
  return (
    <div className="card">
      <div className="card-body d-flex justify-content-between align-items-start">
        <div>
          <h6 className="card-title mb-1">Estado del mensaje</h6>
          <div className="mb-1">
            <strong>ID:</strong> {data.id}
          </div>
          <div className="mb-1">
            <strong>Status:</strong> {badge(data.status)}
          </div>
          {data.timestamp && (
            <div className="text-muted">
              <small>
                <strong>Actualizado:</strong> {data.timestamp}
              </small>
            </div>
          )}
        </div>

        <button className="btn btn-outline-secondary" onClick={onRefresh} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" /> Consultando…
            </>
          ) : (
            'Actualizar'
          )}
        </button>
      </div>
    </div>
  );
};

export default SmsStatusCard;
