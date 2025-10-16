import toast from 'react-hot-toast';

/**
 * Hook personalizado para notificaciones toast
 * Proporciona métodos consistentes para mostrar mensajes al usuario
 */
export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    toast(message, {
      duration: 3500,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  };

  const showLoading = (message = 'Cargando...', options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#fff',
        fontWeight: '500',
      },
      ...options,
    });
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  /**
   * Muestra un toast de promesa con estados de loading, success y error
   */
  const showPromise = (promise, messages = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Procesando...',
        success: messages.success || '¡Operación exitosa!',
        error: messages.error || 'Ha ocurrido un error',
      },
      {
        position: 'top-right',
        success: {
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }
    );
  };

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    dismiss,
    dismissAll,
    promise: showPromise,
  };
};
