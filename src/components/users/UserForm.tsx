import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Processing from '../common/Processing';
import type { UserInput, UserRow } from '../../services/resources';

const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  last_name: z.string().optional(),
  username: z.string().min(3, 'Usuario muy corto'),
  email: z.string().email('Email inválido'),
  password: z.string().optional(), // requerido solo al crear
  department: z.string().optional(),
  status: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

type Props = {
  title: string;
  initial?: Partial<UserRow>; // si tiene id => edición
  onSubmit: (payload: UserInput, isEdit: boolean) => Promise<void>;
  modalId: string;
};

const UserForm: React.FC<Props> = ({ title, initial, onSubmit, modalId }) => {
  const [processing, setProcessing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isEdit = !!initial?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      last_name: initial?.last_name ?? '',
      username: initial?.username ?? '',
      email: initial?.email ?? '',
      password: '',
      department: initial?.department ?? '',
      status: (initial?.status ?? 1) === 1,
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      last_name: initial?.last_name ?? '',
      username: initial?.username ?? '',
      email: initial?.email ?? '',
      password: '',
      department: initial?.department ?? '',
      status: (initial?.status ?? 1) === 1,
    });
  }, [initial, reset]);

  const submit = async (v: FormValues) => {
    setProcessing(true);
    setErr(null);
    try {
      const payload: UserInput = {
        name: v.name,
        last_name: v.last_name || undefined,
        username: v.username,
        email: v.email,
        department: v.department || undefined,
        status: v.status ? 1 : 0,
      };
      // password: solo al crear o si el usuario la ingresó en edición
      if (!isEdit || (v.password && v.password.length >= 6)) {
        if (v.password) payload.password = v.password;
      }
      await onSubmit(payload, isEdit);
      (document.getElementById(modalId + '_close') as HTMLButtonElement)?.click();
    } catch (e: any) {
      setErr(e?.message || 'No se pudo guardar.');
    } finally {
      setProcessing(false);
    }
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
              {err && <div className="alert alert-danger py-2">{err}</div>}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre</label>
                  <input
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name')}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Apellido</label>
                  <input
                    className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                    {...register('last_name')}
                  />
                  {errors.last_name && (
                    <div className="invalid-feedback">{errors.last_name.message}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Usuario</label>
                  <input
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    {...register('username')}
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username.message}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    {...register('email')}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Departamento</label>
                  <input
                    className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                    {...register('department')}
                  />
                  {errors.department && (
                    <div className="invalid-feedback">{errors.department.message}</div>
                  )}
                </div>

                {/* Solo pedir password en creación. En edición es opcional */}
                <div className="col-md-6">
                  <label className="form-label">Contraseña {isEdit ? '(opcional)' : ''}</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password')}
                  />
                  {isEdit ? (
                    <div className="form-text">Déjalo vacío si no deseas cambiarla.</div>
                  ) : (
                    <div className="form-text">Mínimo 6 caracteres.</div>
                  )}
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check mt-4">
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

export default UserForm;
