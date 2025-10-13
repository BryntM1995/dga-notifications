import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/useAuth';
import ProcessingModal from '../components/UI/ProcessingModal';
import dgaLogo from '../assets/dga-logo.svg';

const schema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setProcessing(true);
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (e: any) {
      const msg = e?.message?.toLowerCase().includes('unauthorized')
        ? 'Usuario o contraseña inválidos'
        : e.message || 'Error de autenticación';
      setServerError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="card shadow-sm w-100" style={{ maxWidth: 420 }}>
        <div className="card-body p-4">
          <div className="text-center mb-3">
            <img src={dgaLogo} alt="DGA" style={{ height: 56 }} />
            <h5 className="mt-2 mb-0">Dirección General de Aduanas</h5>
            <small className="text-muted">Módulo de Notificaciones</small>
          </div>

          <div className="mb-3">
            <div className="page-id">Sistema: DGA-NOTIF · Pantalla: Login · ID: LOGIN-001</div>
          </div>

          {serverError && <div className="alert alert-danger">{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label required">Usuario</label>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                placeholder="admin"
                {...register('username')}
              />
              <div className="help-text">Ingresa tu usuario.</div>
              {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label required">Contraseña</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('password')}
              />
              <div className="help-text">Mínimo 6 caracteres.</div>
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>

            <button className="btn btn-primary w-100" type="submit">
              Ingresar
            </button>
          </form>
        </div>
      </div>

      <ProcessingModal show={processing} text="Procesando credenciales..." />
    </div>
  );
};

export default Login;
