import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Confirm from '../../components/common/Confirm';
import UserForm from '../../components/users/UserForm';
import { UsersApi, type UserRow, type UserInput } from '../../services/resources';

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const UsersPage: React.FC = () => {
  const [allRows, setAllRows] = useState<UserRow[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setErr(null);
    try {
      setAllRows(await UsersApi.list());
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
    if (!nq) return allRows;
    return allRows.filter(
      (r) =>
        normalize(r.name).includes(nq) ||
        normalize(r.username).includes(nq) ||
        normalize(r.email).includes(nq) ||
        normalize(r.department).includes(nq),
    );
  }, [allRows, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const cp = Math.min(page, totalPages);
  const slice = filtered.slice((cp - 1) * perPage, cp * perPage);

  const openCreate = () =>
    setEditing({
      id: 0,
      name: '',
      last_name: '',
      username: '',
      email: '',
      department: '',
      status: 1,
    });

  const save = async (payload: UserInput, isEdit: boolean) => {
    if (!editing) return;
    if (isEdit && editing.id) await UsersApi.update(editing.id, payload);
    else await UsersApi.create(payload);
    await fetchAll();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await UsersApi.remove(deleting.id);
    setDeleting(null);
    await fetchAll();
  };

  return (
    <>
      <PageHeader title="Usuarios" id="CONF-USR-001" />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="input-group" style={{ maxWidth: 420 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="Buscar por nombre, usuario, email o departamento…"
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
          data-bs-target="#userModal"
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
                <th>Usuario</th>
                <th>Email</th>
                <th>Departamento</th>
                <th style={{ width: 120 }}>Estatus</th>
                <th style={{ width: 130 }} />
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted">
                    {q ? 'Sin coincidencias' : 'Sin registros'}
                  </td>
                </tr>
              ) : (
                slice.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td>{r.username}</td>
                    <td>{r.email}</td>
                    <td>{r.department || '-'}</td>
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
                        data-bs-target="#userModal"
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

      <UserForm
        modalId="userModal"
        title={editing?.id ? 'Editar usuario' : 'Crear usuario'}
        initial={editing ?? undefined}
        onSubmit={save}
      />

      <Confirm
        title="Eliminar usuario"
        message={`¿Eliminar a "${deleting?.name}"?`}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default UsersPage;
