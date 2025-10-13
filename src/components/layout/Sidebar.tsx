import React, { useState } from 'react';
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

const SectionBtn: React.FC<{
  open: boolean;
  onClick: () => void;
  title: string;
  controls: string;
}> = ({ open, onClick, title, controls }) => (
  <button
    className="btn w-100 text-start d-flex align-items-center justify-content-between px-2"
    type="button"
    aria-controls={controls}
    aria-expanded={open}
    onClick={onClick}
    style={{ background: 'transparent' }}
  >
    <span className="fw-semibold">{title}</span>
    <span>{open ? '▾' : '▸'}</span>
  </button>
);

const MenuContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [openMant, setOpenMant] = useState(pathname.startsWith('/maintenance'));
  const [openTpl, setOpenTpl] = useState(pathname.startsWith('/templates'));
  const [openCfg, setOpenCfg] = useState(pathname.startsWith('/settings'));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    onNavigate?.();
  };

  return (
    <div className="p-3">
      <div className="mb-3">
        <h6 className="mb-0">DGA · Management</h6>
        <small className="text-muted">Menú</small>
      </div>

      <div className="list-group mb-3">
        <LinkItem to="/">Inicio</LinkItem>
      </div>

      {/* Mantenimientos */}
      <div className="mb-2">
        <SectionBtn
          open={openMant}
          onClick={() => setOpenMant((s) => !s)}
          title="Mantenimientos"
          controls="sec-mant"
        />
        <div id="sec-mant" hidden={!openMant} className="list-group">
          <LinkItem to="/maintenance/institutions">Instituciones</LinkItem>
          <LinkItem to="/maintenance/areas">Áreas</LinkItem>
          <LinkItem to="/maintenance/gerencies">Gerencias</LinkItem>
          <LinkItem to="/maintenance/departments">Departamentos</LinkItem>
          <LinkItem to="/maintenance/systems">Sistemas</LinkItem>
          <LinkItem to="/maintenance/modules">Módulos</LinkItem>
        </div>
      </div>

      {/* Plantillas */}
      <div className="mb-2">
        <SectionBtn
          open={openTpl}
          onClick={() => setOpenTpl((s) => !s)}
          title="Plantillas"
          controls="sec-tpl"
        />
        <div id="sec-tpl" hidden={!openTpl} className="list-group">
          <LinkItem to="/templates/creation">Creación de plantillas</LinkItem>
          <LinkItem to="/templates/test">Prueba de plantillas</LinkItem>
        </div>
      </div>

      {/* Configuraciones */}
      <div className="mb-2">
        <SectionBtn
          open={openCfg}
          onClick={() => setOpenCfg((s) => !s)}
          title="Configuraciones"
          controls="sec-cfg"
        />
        <div id="sec-cfg" hidden={!openCfg} className="list-group">
          <LinkItem to="/settings/users">Usuarios</LinkItem>
          <LinkItem to="/settings/monitoring">Monitoreo</LinkItem>
        </div>
      </div>

      <hr />
      <button className="btn btn-outline-danger w-100" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};

const Sidebar: React.FC = () => {
  // Desktop sticky (>= lg)
  // Offcanvas móvil (< lg)
  return (
    <>
      {/* Desktop */}
      <aside
        className="d-none d-lg-block bg-white border-end"
        style={{
          minWidth: 260,
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}
      >
        <MenuContent />
      </aside>

      {/* Mobile Offcanvas */}
      <div
        className="offcanvas offcanvas-start d-lg-none"
        tabIndex={-1}
        id="appSidebar"
        aria-labelledby="appSidebarLabel"
      >
        <div className="offcanvas-header">
          <h5 id="appSidebarLabel" className="mb-0">
            Menú
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Cerrar"
          ></button>
        </div>
        <div className="offcanvas-body p-0">
          <MenuContent
            onNavigate={() => {
              // cerrar offcanvas al navegar
              const el = document.getElementById('appSidebar');
              if (el) (window as any).bootstrap?.Offcanvas.getOrCreateInstance(el)?.hide();
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
