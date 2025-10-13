import React from 'react';

const Topbar: React.FC = () => {
  const isMock = import.meta.env.VITE_MOCK_AUTH === 'true';

  return (
    <header className="d-flex align-items-center justify-content-between p-3 bg-dark text-white shadow-sm">
      <h5 className="mb-0 fw-bold">📦 DGA - Notificaciones</h5>

      <div className="d-flex align-items-center">
        {isMock && <span className="badge bg-warning text-dark ms-2">API OFFLINE (MOCK)</span>}
      </div>
    </header>
  );
};

export default Topbar;
