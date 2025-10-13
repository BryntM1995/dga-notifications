import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import {
  listDepartmentsAll,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type DepartmentInput,
} from '../../services/departments';
import type { Department } from '../../types/department';
import DepartmentForm from '../../components/departments/DepartmentForm';
import Confirm from '../../components/common/Confirm';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const normalize = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

const Departments: React.FC = () => {
  const [allRows, setAllRows] = useState<Department[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listDepartmentsAll();
      setAllRows(res);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // filtro local SOLO por nombre (puedes agregar más campos si quieres)
  const filteredRows = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return allRows;
    return allRows.filter((r) => normalize(r.name).includes(nq));
  }, [allRows, q]);

  // paginación local
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageRows = filteredRows.slice(start, start + perPage);

  // reset página al cambiar búsqueda
  useEffect(() => setPage(1), [q]);

  const openCreate = () =>
    setEditing({ id: 0, name: '', status: 1, subdirection_id: 0, management_id: 0 });

  const openEdit = (row: Department) => setEditing(row);
  const closeForm = () => setEditing(null);

  const save = async (values: DepartmentInput) => {
    if (!editing) return;
    if (editing.id) await updateDepartment(editing.id, values);
    else await createDepartment(values);
    await fetchAll();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await deleteDepartment(deleting.id);
    setDeleting(null);
    await fetchAll();
  };

  return (
    <>
      <PageHeader title="Departamentos" id="MANT-DEP-001" />

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text">🔍</span>
          <input
            className="form-control"
            placeholder="Buscar por nombre..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#deptModal"
          onClick={openCreate}
        >
          Agregar
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex align-items-center gap-2">
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
                <th>Áreas</th>
                <th>Gerencias</th>
                <th style={{ width: 120 }}>Estatus</th>
                <th style={{ width: 130 }} />
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    {q ? 'Sin coincidencias' : 'Sin registros'}
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td>{r.subdirection_name || r.subdirection_id}</td>
                    <td>{r.management_name || r.management_id}</td>
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
                        data-bs-target="#deptModal"
                        onClick={() => openEdit(r)}
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#confirmModal"
                        onClick={() => setDeleting(r)}
                        title="Eliminar"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Registros: {total} · Página {currentPage} / {totalPages}
            </small>
            <div className="btn-group">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                «
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      <DepartmentForm
        initial={editing ?? undefined}
        title={editing?.id ? 'Editar Departamento' : 'Crear Departamento'}
        onSubmit={save}
        onClose={closeForm}
      />

      <Confirm
        title="Eliminar departamento"
        message={`¿Seguro que deseas eliminar "${deleting?.name}"?`}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default Departments;
