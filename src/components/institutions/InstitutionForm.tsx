import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { InstitutionInput } from '../../services/institutions';
import Processing from '../common/Processing';

const schema = z.object({
  name: z.string().trim().min(3, 'Nombre muy corto'),
  acronym: z.string().trim().max(20, 'Máx 20 caracteres').optional(),
  status: z.coerce.number().refine((v) => v === 0 || v === 1, 'Estatus inválido'),
});

type Props = {
  initial?: Partial<InstitutionInput>;
  title: string;
  onSubmit: (values: InstitutionInput) => Promise<void>;
  onClose?: () => void;
};

const InstitutionForm: React.FC<Props> = ({ initial, title, onSubmit, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InstitutionInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', acronym: '', status: 1, ...initial },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      acronym: initial?.acronym ?? '',
      status: (initial?.status ?? 1) as 0 | 1,
    });
  }, [initial, reset]);

  const submit = async (v: InstitutionInput) => {
    setProcessing(true);
    setErr(null);
    try {
      const payload: InstitutionInput = {
        name: v.name.trim(),
        acronym: v.acronym?.trim() || undefined,
        status: v.status,
      };
      await onSubmit(payload);
      onClose?.();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo guardar.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal fade" id="institutionModal" aria-hidden="true">
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
                <label className="form-label">Nombre de la institución</label>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Ej. Empresa Tecnológica Alpha"
                  {...register('name')}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                <div className="form-text">Campo obligatorio.</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Acrónimo</label>
                <input
                  className={`form-control ${errors.acronym ? 'is-invalid' : ''}`}
                  placeholder="Ej. ETA"
                  {...register('acronym')}
                />
                {errors.acronym && <div className="invalid-feedback">{errors.acronym.message}</div>}
                <div className="form-text">Opcional: máximo 20 caracteres.</div>
              </div>

              <div className="mb-2 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="instStatus"
                  {...register('status')}
                  onChange={(e) => (e.currentTarget.value = e.currentTarget.checked ? '1' : '0')}
                  defaultChecked={(initial?.status ?? 1) === 1}
                />
                <label htmlFor="instStatus" className="form-check-label">
                  Habilitado
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">
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

export default InstitutionForm;
