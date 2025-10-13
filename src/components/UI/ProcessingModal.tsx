import React from 'react';

export const ProcessingModal: React.FC<{ show: boolean; text?: string }> = ({ show, text }) => (
  <div
    className={`modal ${show ? 'd-block' : ''}`}
    tabIndex={-1}
    style={{ background: 'rgba(0,0,0,.35)' }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center p-5">
          <div className="spinner-border" role="status" aria-hidden="true"></div>
          <p className="mt-3 mb-0">{text ?? 'Procesando...'}</p>
        </div>
      </div>
    </div>
  </div>
);

export default ProcessingModal;
