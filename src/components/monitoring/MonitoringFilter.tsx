import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(['', '0', '1', '2']).optional(),
  module_id: z.coerce.number().optional(),
  date_from: z.string().optional(), // YYYY-MM-DD
  date_to: z.string().optional(),
});

export type MonitoringFilterValues = z.infer<typeof schema>;

type Props = {
  onApply: (values: MonitoringFilterValues) => void;
  modules?: { id: number; name: string }[];
  defaultValues?: Partial<MonitoringFilterValues>;
};

const MonitoringFilter: React.FC<Props> = ({ onApply, modules = [], defaultValues }) => {
  const { register, handleSubmit, reset } = useForm<MonitoringFilterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q: '',
      status: '',
      module_id: 0,
      date_from: '',
      date_to: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onApply)} className="card mb-3">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Buscar</label>
            <input
              className="form-control"
              placeholder="teléfono, módulo, ID…"
              {...register('q')}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Estatus</label>
            <select className="form-select" {...register('status')}>
              <option value="">Todos</option>
              <option value="1">SUCCESS</option>
              <option value="0">FAILED</option>
              <option value="2">QUEUE</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Módulo</label>
            <select className="form-select" {...register('module_id')}>
              <option value={0}>Todos</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Desde</label>
            <input type="date" className="form-control" {...register('date_from')} />
          </div>

          <div className="col-md-2">
            <label className="form-label">Hasta</label>
            <input type="date" className="form-control" {...register('date_to')} />
          </div>
        </div>
      </div>

      <div className="card-footer d-flex gap-2 justify-content-end">
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => reset()}
          title="Limpiar filtros"
        >
          Limpiar
        </button>
        <button className="btn btn-primary" type="submit">
          Aplicar filtros
        </button>
      </div>
    </form>
  );
};

export default MonitoringFilter;
