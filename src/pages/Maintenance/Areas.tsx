import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Confirm from '../../components/common/Confirm';
import SimpleForm from '../../components/common/SimpleForm';
import { Subdirections, type Subdirection } from '../../services/resources';

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const Areas: React.FC = () => {
  const [allRows, setAllRows] = useState<Subdirection[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [editing, setEditing] = useState<Subdirection | null>(null);
  const [deleting, setDeleting] = useState<Subdirection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      setAllRows(await Subdirections.list());
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    return nq ? allRows.filter((r) => normalize(r.name).includes(nq)) : allRows;
  }, [allRows, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const cp = Math.min(page, totalPages);
  const slice = filtered.slice((cp - 1) * perPage, cp * perPage);

  const save = async (payload: { name: string; status: 0 | 1 }) => {
    if (!editing) return;
    if (editing.id) await Subdirections.update(editing.id, payload);
    else await Subdirections.create(payload);
    await fetchAll();
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    await Subdirections.remove(deleting.id);
    setDeleting(null);
    await fetchAll();
  };

  return (
    <>
      <PageHeader title="Áreas" id="MANT-ARE-001" />
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="Buscar por nombre..."
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
          data-bs-target="#areasModal"
          onClick={() => setEditing({ id: 0, name: '', status: 1 })}
        >
          Agregar
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="d-flex gap-2 align-items-center">
          <span className="spinner-border spinner-border-sm" />
          <span>Cargando...</span>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead className="table-secondary">
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Nombre</th>
                <th style={{ width: 120 }}>Estatus</th>
                <th style={{ width: 130 }} />
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    {q ? 'Sin coincidencias' : 'Sin registros'}
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
                        data-bs-target="#areasModal"
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

      <SimpleForm
        modalId="areasModal"
        title={editing?.id ? 'Editar Área' : 'Crear Área'}
        initial={editing ?? undefined}
        onSubmit={save}
      />
      <Confirm
        title="Eliminar área"
        message={`¿Eliminar "${deleting?.name}"?`}
        onConfirm={confirmDelete}
      />
    </>
  );
};
export default Areas;
