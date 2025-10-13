import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Confirm from '../../components/common/Confirm';
import ModuleForm from '../../components/modules/ModuleForm';
import { Modules, type Module, type ModuleInput } from '../../services/resources';

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const ModulesPage: React.FC = () => {
  const [allRows, setAllRows] = useState<Module[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [editing, setEditing] = useState<Module | null>(null);
  const [deleting, setDeleting] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      setAllRows(await Modules.list());
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cargar.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return nq
      ? allRows.filter(
          (r) => normalize(r.name).includes(nq) || normalize(r.system_name).includes(nq),
        )
      : allRows;
  }, [allRows, q]);

  const total = filtered.length,
    totalPages = Math.max(1, Math.ceil(total / perPage)),
    cp = Math.min(page, totalPages);
  const slice = filtered.slice((cp - 1) * perPage, cp * perPage);

  const save = async (payload: ModuleInput) => {
    if (!editing) return;
    if (editing.id) await Modules.update(editing.id, payload);
    else await Modules.create(payload);
    await fetchAll();
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    await Modules.remove(deleting.id);
    setDeleting(null);
    await fetchAll();
  };

  return (
    <>
      <PageHeader title="Módulos" id="MANT-MOD-001" />
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="Buscar por nombre o sistema..."
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
          data-bs-target="#moduleModal"
          onClick={() => setEditing({ id: 0, name: '', status: 1, system_id: 0 })}
        >
          Agregar
        </button>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {loading ? (
        <div className="d-flex gap-2 align-items-center">
          <span className="spinner-border spinner-border-sm"></span>
          <span>Cargando...</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead className="table-secondary">
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Nombre</th>
                <th>Sistema</th>
                <th style={{ width: 120 }}>Estatus</th>
                <th style={{ width: 130 }} />
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    {q ? 'Sin coincidencias' : 'Sin registros'}
                  </td>
                </tr>
              ) : (
                slice.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td>{r.system_name || r.system_id}</td>
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
                        data-bs-target="#moduleModal"
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

      <ModuleForm
        modalId="moduleModal"
        title={editing?.id ? 'Editar módulo' : 'Crear módulo'}
        initial={editing ?? undefined}
        onSubmit={save}
      />
      <Confirm
        title="Eliminar módulo"
        message={`¿Eliminar "${deleting?.name}"?`}
        onConfirm={confirmDelete}
      />
    </>
  );
};
export default ModulesPage;
