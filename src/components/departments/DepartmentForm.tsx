import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DepartmentInput } from '../../services/departments';
import { listDepartmentsOptions, listSubdirections, type Option } from '../../services/catalogs';
import Processing from '../common/Processing';

const schema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  subdirection_id: z.coerce.number().int().positive('Seleccione un área'),
  management_id: z.coerce.number().int().positive('Seleccione una gerencia'),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  initial?: Partial<DepartmentInput>;
  onSubmit: (values: DepartmentInput) => Promise<void>;
  title: string;
  onClose?: () => void;
};

const DepartmentForm: React.FC<Props> = ({ initial, onSubmit, title, onClose }) => {
  const [areas, setAreas] = useState<Option[]>([]);
  const [gerencias, setGerencias] = useState<Option[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      subdirection_id: initial?.subdirection_id ?? 0,
      management_id: initial?.management_id ?? 0,
      status: (initial?.status ?? 1) === 1, // boolean en el form
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      subdirection_id: initial?.subdirection_id ?? 0,
      management_id: initial?.management_id ?? 0,
      status: (initial?.status ?? 1) === 1,
    });
  }, [initial, reset]);

  useEffect(() => {
    Promise.all([listSubdirections(), listDepartmentsOptions()]).then(([a, g]) => {
      setAreas(a);
      setGerencias(g);
    });
  }, []);

  const submit = async (v: FormValues) => {
    setProcessing(true);
    setError(null);
    try {
      const payload: DepartmentInput = {
        name: v.name,
        subdirection_id: v.subdirection_id,
        management_id: v.management_id,
        status: v.status ? 1 : 0,
      };
      await onSubmit(payload);
      onClose?.();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal fade" id="deptModal" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit(submit)}>
            <div className="modal-header">
              <h6 className="modal-title">{title}</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body">
              {processing && <Processing />}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Área</label>
                <select
                  className={`form-select ${errors.subdirection_id ? 'is-invalid' : ''}`}
                  {...register('subdirection_id')}
                >
                  <option value={0}>Seleccione...</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {errors.subdirection_id && (
                  <div className="invalid-feedback">{errors.subdirection_id.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Gerencia</label>
                <select
                  className={`form-select ${errors.management_id ? 'is-invalid' : ''}`}
                  {...register('management_id')}
                >
                  <option value={0}>Seleccione...</option>
                  {gerencias.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                {errors.management_id && (
                  <div className="invalid-feedback">{errors.management_id.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre del departamento</label>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Ej. Departamento de Desarrollo"
                  {...register('name')}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              <div className="mb-3 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="status"
                  {...register('status')}
                />
                <label htmlFor="status" className="form-check-label">
                  Habilitado
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" data-bs-dismiss="modal" type="button">
                Salir
              </button>
              <button className="btn btn-primary" type="submit">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;
