import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import MonitoringFilter, {
  type MonitoringFilterValues,
} from '../../components/monitoring/MonitoringFilter';
import { MonitoringApi, type MessageLog } from '../../services/monitoring';
import { listModulesOptions } from '../../services/catalogs';

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const badge = (status: number) => {
  const n = Number(status);

  switch (n) {
    case 1:
      return <span className="badge bg-success">SUCCESS</span>;
    case 0:
      return <span className="badge bg-danger">FAILED</span>;
    case 2:
      return <span className="badge bg-warning text-dark">QUEUE</span>;
    default:
      return <span className="badge bg-secondary">{String(status ?? '—')}</span>;
  }
};

const MonitoringPage: React.FC = () => {
  const [rows, setRows] = useState<MessageLog[]>([]);
  const [modules, setModules] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // filtros y paginación
  const [filters, setFilters] = useState<MonitoringFilterValues>({
    q: '',
    status: '',
    module_id: 0,
    date_from: '',
    date_to: '',
  });
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchData = async (f?: MonitoringFilterValues) => {
    setLoading(true);
    setErr(null);
    try {
      const [logs, mods] = await Promise.all([MonitoringApi.list(f), listModulesOptions()]);
      setRows(logs);
      setModules(mods);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cargar el monitoreo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (v: MonitoringFilterValues) => {
    setFilters(v);
    setPage(1);
    fetchData(v);
  };

  // filtro local complementario
  const filtered = useMemo(() => {
    const nq = normalize(filters.q);
    return rows.filter((r) => {
      const okStatus = !filters.status || r.status.toUpperCase() === filters.status;
      const okModule = !filters.module_id || r.module_id === Number(filters.module_id);
      const okText =
        !nq ||
        normalize(r.module_name).includes(nq) ||
        normalize(r.phone).includes(nq) ||
        String(r.id).includes(filters.q || '');
      const okFrom =
        !filters.date_from || new Date(r.created_at) >= new Date(filters.date_from as string);
      const okTo =
        !filters.date_to ||
        new Date(r.created_at) <= new Date(String(filters.date_to) + 'T23:59:59');
      return okStatus && okModule && okText && okFrom && okTo;
    });
  }, [rows, filters]);

  // paginado
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [pages, page]);

  // detalle (modal)
  const [detail, setDetail] = useState<MessageLog | null>(null);

  return (
    <>
      <PageHeader title="Monitoreo" id="CONF-MON-001" />

      <MonitoringFilter onApply={applyFilters} modules={modules} defaultValues={filters} />

      {err && <div className="alert alert-danger">{err}</div>}

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <span className="spinner-border spinner-border-sm" />
          <span>Cargando…</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead className="table-secondary">
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th style={{ width: 160 }}>Fecha</th>
                <th>Módulo</th>
                <th style={{ width: 140 }}>Teléfono</th>
                <th style={{ width: 120 }}>Estatus</th>
                <th style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    {rows.length ? 'Sin coincidencias' : 'Sin registros'}
                  </td>
                </tr>
              ) : (
                slice.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td>{r.module_name || r.module_id}</td>
                    <td>{r.phone || '-'}</td>
                    <td>{badge(r.status)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        data-bs-toggle="modal"
                        data-bs-target="#logDetailModal"
                        onClick={() => setDetail(r)}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Registros: {total} · Página {page}/{pages}
            </small>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                «
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      <div className="modal fade" id="logDetailModal" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Detalle del mensaje</h6>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {!detail ? (
                <div className="text-muted">Sin datos.</div>
              ) : (
                <div className="vstack gap-2">
                  <div>
                    <strong>ID:</strong> {detail.id}
                  </div>
                  <div>
                    <strong>Fecha:</strong> {new Date(detail.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>Módulo:</strong> {detail.module_name || detail.module_id}
                  </div>
                  <div>
                    <strong>Teléfono:</strong> {detail.phone || '-'}
                  </div>
                  <div>
                    <strong>Estatus:</strong> {badge(detail.status)}
                  </div>

                  {detail.error && (
                    <div className="alert alert-warning mb-0">
                      <strong>Error:</strong> {detail.error}
                    </div>
                  )}

                  {detail.payload && (
                    <>
                      <hr className="my-2" />
                      <div>
                        <strong>Payload/Vars:</strong>
                      </div>
                      <pre className="mb-0 bg-light p-2 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(detail.payload, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MonitoringPage;
