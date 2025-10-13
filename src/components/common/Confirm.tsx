import React from 'react';

type Props = {
  title: string;
  message: string;
  okText?: string;
  cancelText?: string;
  onConfirm: () => void;
};

const Confirm: React.FC<Props> = ({
  title,
  message,
  okText = 'Eliminar',
  cancelText = 'Cancelar',
  onConfirm,
}) => {
  return (
    <div className="modal fade" id="confirmModal" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">{title}</h6>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" data-bs-dismiss="modal">
              {cancelText}
            </button>
            <button className="btn btn-danger" data-bs-dismiss="modal" onClick={onConfirm}>
              {okText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
