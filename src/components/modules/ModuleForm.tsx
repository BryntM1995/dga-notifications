import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Processing from '../common/Processing';
import type { ModuleInput } from '../../services/resources';
import { listSystemsOptions, type Option } from '../../services/catalogs';

const schema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  system_id: z.coerce.number().int().positive('Seleccione un sistema'),
  status: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  title: string;
  initial?: Partial<ModuleInput>;
  onSubmit: (payload: ModuleInput) => Promise<void>;
  modalId: string;
};

const ModuleForm: React.FC<Props> = ({ title, initial, onSubmit, modalId }) => {
  const [systems, setSystems] = useState<Option[]>([]);
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
      system_id: initial?.system_id ?? 0,
      status: (initial?.status ?? 1) === 1,
    },
  });

  useEffect(() => {
    listSystemsOptions().then(setSystems);
  }, []);
  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      system_id: initial?.system_id ?? 0,
      status: (initial?.status ?? 1) === 1,
    });
  }, [initial, reset]);

  const submit = async (v: FormValues) => {
    setProcessing(true);
    setError(null);
    try {
      await onSubmit({ name: v.name, system_id: v.system_id, status: v.status ? 1 : 0 });
      (document.getElementById(modalId + '_close') as HTMLButtonElement)?.click();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal fade" id={modalId} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit(submit)}>
            <div className="modal-header">
              <h6 className="modal-title">{title}</h6>
              <button
                id={modalId + '_close'}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>
            <div className="modal-body">
              {processing && <Processing />}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Sistema</label>
                <select
                  className={`form-select ${errors.system_id ? 'is-invalid' : ''}`}
                  {...register('system_id')}
                >
                  <option value={0}>Seleccione...</option>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.system_id && (
                  <div className="invalid-feedback">{errors.system_id.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre del módulo</label>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  {...register('name')}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={modalId + '_st'}
                  {...register('status')}
                />
                <label htmlFor={modalId + '_st'} className="form-check-label">
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
export default ModuleForm;
