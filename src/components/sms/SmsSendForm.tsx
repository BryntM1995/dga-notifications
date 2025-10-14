import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Processing from '../common/Processing';
import type { SendSmsInput } from '../../services/sms';

const schema = z.object({
  phone: z
    .string()
    .trim()
    .min(8, 'Teléfono muy corto')
    .regex(/^\+?\d{7,15}$/, 'Formato de teléfono inválido'),
  template: z.coerce.number().min(1, 'Seleccione una plantilla válida'),
  varsLine: z.string().trim().optional(), // coma-separados
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onSend: (payload: SendSmsInput) => Promise<void>;
  processing?: boolean;
};

const SmsSendForm: React.FC<Props> = ({ onSend, processing }) => {
  const [err, setErr] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', template: 0, varsLine: '' },
  });

  const submit = async (v: FormValues) => {
    setErr(null);
    const vars =
      v.varsLine && v.varsLine.length
        ? v.varsLine
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    try {
      await onSend({ phone: v.phone.trim(), template: v.template, vars });
      reset((curr) => ({ phone: '', template: curr.template, varsLine: '' }));
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar el SMS.');
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="card">
      <div className="card-body">
        <h6 className="card-title mb-3">Enviar SMS con plantilla</h6>

        {processing && <Processing />}
        {err && <div className="alert alert-danger py-2">{err}</div>}

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Teléfono destino</label>
            <input
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="8091234567"
              {...register('phone')}
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">Plantilla</label>
            <input
              type="number"
              className={`form-control ${errors.template ? 'is-invalid' : ''}`}
              placeholder="ID de plantilla (ej. 1)"
              {...register('template')}
            />
            {errors.template && <div className="invalid-feedback">{errors.template.message}</div>}
          </div>

          <div className="col-md-12">
            <label className="form-label">Variables (opcional)</label>
            <input
              className={`form-control ${errors.varsLine ? 'is-invalid' : ''}`}
              placeholder="Ej.: Juan Perez, SOL-12345"
              {...register('varsLine')}
            />
            <div className="form-text"></div>
            {errors.varsLine && <div className="invalid-feedback">{errors.varsLine.message}</div>}
          </div>
        </div>
      </div>

      <div className="card-footer text-end">
        <button className="btn btn-primary" type="submit" disabled={!!processing}>
          Enviar SMS
        </button>
      </div>
    </form>
  );
};

export default SmsSendForm;
