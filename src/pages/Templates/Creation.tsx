import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Confirm from '../../components/common/Confirm';
import TemplateForm from '../../components/templates/TemplateForm';
import { Templates, type TemplateEntity, type TemplateInput } from '../../services/resources';

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const TemplatesPage: React.FC = () => {
  const [allRows, setAllRows] = useState<TemplateEntity[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [editing, setEditing] = useState<TemplateEntity | null>(null);
  const [deleting, setDeleting] = useState<TemplateEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      const rows = await Templates.list();
      setAllRows(rows);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cargar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // búsqueda local por: departamento, módulo, mensaje
  const filtered = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return allRows;
    return allRows.filter(
      (r) =>
        normalize(r.department_name).includes(nq) ||
        normalize(r.module_name).includes(nq) ||
        normalize(r.message).includes(nq),
    );
  }, [allRows, q]);

  // paginado client-side
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const cp = Math.min(page, totalPages);
  const slice = filtered.slice((cp - 1) * perPage, cp * perPage);

  const openCreate = () =>
    setEditing({ id: 0, department_id: 0, module_id: 0, message: '', status: 1 });

  const save = async (payload: TemplateInput) => {
    if (!editing) return;
    if (editing.id) await Templates.update(editing.id, payload);
    else await Templates.create(payload);
    await fetchAll();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await Templates.remove(deleting.id);
    setDeleting(null);
    await fetchAll();
  };

  return (
    <>
      <PageHeader title="Plantillas" id="TEMP-CRT-001" />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="input-group" style={{ maxWidth: 420 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="Buscar por departamento, módulo o mensaje…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#tplModal"
          onClick={openCreate}
        >
          Agregar
        </button>
      </div>

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
                <th style={{ width: 80 }}>ID</th>
                <th>Departamento</th>
                <th>Módulo</th>
                <th>Plantilla de mensaje</th>
                <th style={{ width: 120 }}>Estatus</th>
                <th style={{ width: 130 }} />
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    {q ? 'Sin coincidencias' : 'Sin registros'}
                  </td>
                </tr>
              ) : (
                slice.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.department_name || r.department_id}</td>
                    <td>{r.module_name || r.module_id}</td>
                    <td className="text-truncate" style={{ maxWidth: 520 }}>
                      {r.message}
                    </td>
                    <td>
                      {r.status === 1 ? (
                        <span className="badge bg-success">Habilitado</span>
                      ) : (
                        <span className="badge bg-secondary">Deshabilitado</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#tplModal"
                        onClick={() => setEditing(r)}
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#confirmModal"
                        onClick={() => setDeleting(r)}
                        title="Eliminar"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Registros: {total} · Página {cp} / {totalPages}
            </small>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={cp <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                «
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={cp >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal form */}
      <TemplateForm
        modalId="tplModal"
        title={editing?.id ? 'Editar plantilla' : 'Crear plantilla'}
        initial={
          editing
            ? {
                department_id: editing.department_id,
                module_id: editing.module_id,
                message: editing.message,
                status: editing.status,
              }
            : undefined
        }
        onSubmit={save}
      />

      {/* Confirmación */}
      <Confirm
        title="Eliminar plantilla"
        message={`¿Eliminar la plantilla #${deleting?.id}?`}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default TemplatesPage;
