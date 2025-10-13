import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Confirm from '../../components/common/Confirm';
import SystemForm from '../../components/systems/SystemForm';
import { SystemsApi, type SystemEntity, type SystemInput } from '../../services/systems';

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const SystemsPage: React.FC = () => {
  const [all, setAll] = useState<SystemEntity[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [editing, setEditing] = useState<SystemEntity | null>(null);
  const [deleting, setDeleting] = useState<SystemEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await SystemsApi.list();
      setAll(res);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return all;
    return all.filter((r) => normalize(r.name).includes(nq));
  }, [all, q]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [pages, page]);

  const openCreate = () => setEditing({ id: 0, name: '', status: 1 });
  const openEdit = (row: SystemEntity) => setEditing(row);
  const closeForm = () => setEditing(null);

  const save = async (v: SystemInput) => {
    if (!editing) return;
    if (editing.id) await SystemsApi.update(editing.id, v);
    else await SystemsApi.create(v);
    await load();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await SystemsApi.remove(deleting.id);
    setDeleting(null);
    await load();
  };

  return (
    <>
      <PageHeader title="Sistemas" id="MANT-SYS-001" />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="Buscar por nombre…"
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
          data-bs-target="#systemModal"
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
                <th>Nombre</th>
                <th style={{ width: 120 }}>Estatus</th>
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    Sin registros
                  </td>
                </tr>
              ) : (
                slice.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
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
                        data-bs-target="#systemModal"
                        onClick={() => openEdit(r)}
                        title="Editar"
                      >
                        <i className="fas fa-pen" />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#confirmModal"
                        onClick={() => setDeleting(r)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash" />
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

      <SystemForm
        initial={editing ?? undefined}
        title={editing?.id ? 'Editar sistema' : 'Crear sistema'}
        onSubmit={save}
        onClose={closeForm}
      />

      <Confirm
        title="Eliminar sistema"
        message={`¿Seguro que deseas eliminar "${deleting?.name}"?`}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default SystemsPage;
