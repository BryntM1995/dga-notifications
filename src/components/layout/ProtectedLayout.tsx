import React from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const ProtectedLayout: React.FC = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Topbar />

      <div className="flex-grow-1">
        <div className="container-fluid py-3">
          <div className="row g-3">
            <div className="col-12 col-lg-3 col-xl-2">
              {/* En móvil no se ve (Offcanvas cubrirá ese rol) */}
              <Sidebar />
            </div>
            <div className="col-12 col-lg-9 col-xl-10">
              <div className="card shadow-sm">
                <div className="card-body">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectedLayout;
