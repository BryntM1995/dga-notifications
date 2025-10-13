import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ManagementInput } from '../../services/managements';
import { listSubdirections, type Option } from '../../services/catalogs';
import Processing from '../common/Processing';

const schema = z.object({
  name: z.string().trim().min(3, 'Nombre muy corto'),
  subdirection_id: z.coerce.number().min(1, 'Seleccione un área'),
  status: z.coerce.number().refine((v) => v === 0 || v === 1, 'Estatus inválido'),
});

type Props = {
  initial?: Partial<ManagementInput>;
  title: string;
  onSubmit: (values: ManagementInput) => Promise<void>;
  onClose?: () => void;
};

const ManagementForm: React.FC<Props> = ({ initial, title, onSubmit, onClose }) => {
  const [areas, setAreas] = useState<Option[]>([]);
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ManagementInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', subdirection_id: 0, status: 1, ...initial },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      subdirection_id: initial?.subdirection_id ?? 0,
      status: (initial?.status ?? 1) as 0 | 1,
    });
  }, [initial, reset]);

  useEffect(() => {
    listSubdirections().then(setAreas);
  }, []);

  const submit = async (v: ManagementInput) => {
    setProcessing(true);
    setErr(null);
    try {
      await onSubmit({ ...v, name: v.name.trim() });
      onClose?.();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo guardar.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal fade" id="managementModal" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit(submit)}>
            <div className="modal-header">
              <h6 className="modal-title">{title}</h6>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body">
              {processing && <Processing />}
              {err && <div className="alert alert-danger py-2">{err}</div>}

              <div className="mb-3">
                <label className="form-label">Área</label>
                <select
                  className={`form-select ${errors.subdirection_id ? 'is-invalid' : ''}`}
                  {...register('subdirection_id')}
                >
                  <option value={0}>Seleccione…</option>
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
                <label className="form-label">Nombre de la gerencia</label>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Ej. Gerencia de Sistemas"
                  {...register('name')}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              <div className="form-check mb-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="mgmtStatus"
                  {...register('status')}
                  onChange={(e) => (e.currentTarget.value = e.currentTarget.checked ? '1' : '0')}
                  defaultChecked={(initial?.status ?? 1) === 1}
                />
                <label htmlFor="mgmtStatus" className="form-check-label">
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

export default ManagementForm;
