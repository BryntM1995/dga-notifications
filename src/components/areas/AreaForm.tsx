import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AreaInput } from '../../services/areas';
import Processing from '../common/Processing';

const schema = z.object({
  name: z.string().trim().min(2, 'Nombre muy corto'),
  status: z.coerce.number().refine((v) => v === 0 || v === 1, 'Estatus inválido'),
});

type Props = {
  initial?: Partial<AreaInput>;
  title: string;
  onSubmit: (values: AreaInput) => Promise<void>;
  onClose?: () => void;
};

const AreaForm: React.FC<Props> = ({ initial, title, onSubmit, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AreaInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', status: 1, ...initial },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      status: (initial?.status ?? 1) as 0 | 1,
    });
  }, [initial, reset]);

  const submit = async (v: AreaInput) => {
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
    <div className="modal fade" id="areaModal" aria-hidden="true">
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
                <label className="form-label">Nombre del área</label>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Ej. Subdirección de TI"
                  {...register('name')}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              <div className="form-check mb-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="areaStatus"
                  {...register('status')}
                  onChange={(e) => (e.currentTarget.value = e.currentTarget.checked ? '1' : '0')}
                  defaultChecked={(initial?.status ?? 1) === 1}
                />
                <label htmlFor="areaStatus" className="form-check-label">
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

export default AreaForm;
