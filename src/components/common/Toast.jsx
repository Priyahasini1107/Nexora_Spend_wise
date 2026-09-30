import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useExpenses();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'error' ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
          </div>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ color: '#FFFFFF88', display: 'flex', alignItems: 'center' }}
            aria-label="Dismiss toast"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
