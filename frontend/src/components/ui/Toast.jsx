// FILE: src/components/ui/Toast.jsx
import React from 'react';
import { useToast } from '../../contexts/ToastContext';

function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`} onClick={() => removeToast(toast.id)}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default Toast;
