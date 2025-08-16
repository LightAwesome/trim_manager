// FILE: src/components/ui/ConfirmDialog.jsx
import React from 'react';
import Modal from './Modal';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-dialog-content">
        <p>{children}</p>
      </div>
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
