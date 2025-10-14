import React from 'react';
import dgaLogo from '../../assets/dga-logo.svg';

const Topbar: React.FC = () => {
  const isMock = import.meta.env.VITE_MOCK_AUTH === 'true';

  return (
    <header className="topbar bg-info text-white shadow-sm position-sticky top-0 z-3">
      <div
        className="container-fluid d-flex align-items-center justify-content-between"
        style={{ minHeight: 64 }}
      >
        <button
          className="btn btn-outline-light d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#appSidebar"
          aria-controls="appSidebar"
        >
          ☰
        </button>

        <img src={dgaLogo} alt="DGA" style={{ height: 56 }} />

        <div>
          {isMock && <span className="badge bg-warning text-dark ms-2">API OFFLINE (MOCK)</span>}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
