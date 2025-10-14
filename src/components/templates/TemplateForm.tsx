import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Processing from '../common/Processing';
import type { TemplateInput } from '../../services/resources';
import { listDepartmentsOptions, listModulesOptions, type Option } from '../../services/catalogs';

const schema = z.object({
  department_id: z.coerce.number().int().positive('Seleccione un departamento'),
  module_id: z.coerce.number().int().positive('Seleccione un módulo'),
  message: z.string().min(10, 'Mensaje muy corto'),
  status: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  title: string;
  initial?: Partial<TemplateInput>;
  onSubmit: (payload: TemplateInput) => Promise<void>;
  modalId: string;
};

const TemplateForm: React.FC<Props> = ({ title, initial, onSubmit, modalId }) => {
  const [departments, setDepartments] = useState<Option[]>([]);
  const [modules, setModules] = useState<Option[]>([]);
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
      department_id: initial?.department_id ?? 0,
      module_id: initial?.module_id ?? 0,
      message: initial?.message ?? '',
      status: (initial?.status ?? 1) === 1,
    },
  });

  useEffect(() => {
    listDepartmentsOptions().then(setDepartments);
    listModulesOptions().then(setModules);
  }, []);
  useEffect(() => {
    reset({
      department_id: initial?.department_id ?? 0,
      module_id: initial?.module_id ?? 0,
      message: initial?.message ?? '',
      status: (initial?.status ?? 1) === 1,
    });
  }, [initial, reset]);

  const submit = async (v: FormValues) => {
    setProcessing(true);
    setError(null);
    try {
      await onSubmit({ ...v, status: v.status ? 1 : 0 });
      (document.getElementById(modalId + '_close') as HTMLButtonElement)?.click();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar.');
    } finally {
      setProcessing(false);
    }
  };

  const insertVar = (n: number) => {
    const ta = document.getElementById(modalId + '_msg') as HTMLTextAreaElement;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    ta.value = `${before} VAR${n} ${after}`;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.focus();
  };

  return (
    <div className="modal fade" id={modalId} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
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

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Departamento</label>
                  <select
                    className={`form-select ${errors.department_id ? 'is-invalid' : ''}`}
                    {...register('department_id')}
                  >
                    <option value={0}>Seleccione...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <div className="invalid-feedback">{errors.department_id.message}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Módulo</label>
                  <select
                    className={`form-select ${errors.module_id ? 'is-invalid' : ''}`}
                    {...register('module_id')}
                  >
                    <option value={0}>Seleccione...</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {errors.module_id && (
                    <div className="invalid-feedback">{errors.module_id.message}</div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <div className="d-flex gap-2 flex-wrap mb-2">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => insertVar(n)}
                    >
                      VAR{n}
                    </button>
                  ))}
                </div>
                <label className="form-label">Mensaje</label>
                <textarea
                  id={modalId + '_msg'}
                  rows={4}
                  className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                  {...register('message')}
                />
                {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
              </div>

              <div className="form-check mt-3">
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
export default TemplateForm;
