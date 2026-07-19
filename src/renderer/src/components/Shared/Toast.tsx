import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useUIStore, Toast as ToastType } from "../../store/uiStore";
import "./Toast.css";

export const Toast: React.FC<{ toast: ToastType; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[toast.type];

  return (
    <div className={`toast toast--${toast.type} animate-slide-in-right`}>
      <div className="toast__icon">
        <Icon size={20} />
      </div>
      <div className="toast__content">
        <h4 className="toast__title">{toast.title}</h4>
        {toast.message && <p className="toast__message">{toast.message}</p>}
      </div>
      <button
        className="toast__close"
        onClick={onClose}
        aria-label="Close toast"
      >
        <X size={16} />
      </button>
      {toast.duration && toast.duration > 0 && (
        <div
          className="toast__progress"
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      )}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
