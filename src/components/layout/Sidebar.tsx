import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const LinkItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      'list-group-item list-group-item-action border-0 py-2 ' +
      (isActive ? 'active fw-semibold' : '')
    }
  >
    {children}
  </NavLink>
);

const Section: React.FC<{
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ id, title, isOpen, onToggle, children }) => (
  <div className="mb-2">
    <button
      aria-controls={id}
      aria-expanded={isOpen}
      className="btn w-100 text-start d-flex align-items-center justify-content-between px-2"
      onClick={onToggle}
      type="button"
      style={{ background: 'transparent' }}
    >
      <span className="fw-semibold">{title}</span>
      <span className="ms-2">{isOpen ? '▾' : '▸'}</span>
    </button>
    <div id={id} hidden={!isOpen} className="list-group">
      {children}
    </div>
  </div>
);

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useAuth();

  // abrir secciones según la ruta actual
  const isMant = useMemo(() => pathname.startsWith('/maintenance'), [pathname]);
  const isTpl = useMemo(() => pathname.startsWith('/templates'), [pathname]);
  const isCfg = useMemo(() => pathname.startsWith('/settings'), [pathname]);

  const [openMant, setOpenMant] = useState(isMant);
  const [openTpl, setOpenTpl] = useState(isTpl);
  const [openCfg, setOpenCfg] = useState(isCfg);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className="bg-white border-end"
      style={{
        minWidth: 260,
        position: 'sticky',
        top: 0,
        height: 'calc(100vh - 64px)', // si tu Topbar mide ~64px
        overflowY: 'auto',
      }}
    >
      <div className="p-3">
        <div className="mb-3">
          <h6 className="mb-0">DGA · Notificaciones</h6>
          <small className="text-muted">Menú</small>
        </div>

        <div className="list-group mb-3">
          <LinkItem to="/">Inicio</LinkItem>
        </div>

        <Section
          id="mant"
          title="Mantenimientos"
          isOpen={openMant}
          onToggle={() => setOpenMant((s) => !s)}
        >
          <LinkItem to="/maintenance/institutions">Instituciones</LinkItem>
          <LinkItem to="/maintenance/areas">Áreas</LinkItem>
          <LinkItem to="/maintenance/gerencies">Gerencias</LinkItem>
          <LinkItem to="/maintenance/departments">Departamentos</LinkItem>
          <LinkItem to="/maintenance/systems">Sistemas</LinkItem>
          <LinkItem to="/maintenance/modules">Módulos</LinkItem>
        </Section>

        <Section
          id="tpl"
          title="Plantillas"
          isOpen={openTpl}
          onToggle={() => setOpenTpl((s) => !s)}
        >
          <LinkItem to="/templates/creation">Creación de plantillas</LinkItem>
          <LinkItem to="/templates/test">Prueba de plantillas</LinkItem>
        </Section>

        <Section
          id="cfg"
          title="Configuraciones"
          isOpen={openCfg}
          onToggle={() => setOpenCfg((s) => !s)}
        >
          <LinkItem to="/settings/users">Usuarios</LinkItem>
          <LinkItem to="/settings/monitoring">Monitoreo</LinkItem>
        </Section>

        <hr />
        <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
