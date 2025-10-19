import React, { useEffect } from 'react';

/**
 * Componente Toast para mostrar notificaciones emergentes
 */
const Toast = ({ message, title, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { icon: 'check_circle', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
      case 'error':
        return { icon: 'error', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
      case 'warning':
        return { icon: 'warning', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
      case 'notification':
        return { icon: 'notifications', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
      default:
        return { icon: 'info', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20' };
    }
  };

  const { icon, color, bg } = getIcon();

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${bg} border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm flex items-start gap-3`}>
        <span className={`material-symbols-outlined ${color} text-2xl flex-shrink-0`}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              {title}
            </p>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Contenedor para múltiples toasts
 */
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast;
