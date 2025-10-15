/**
 * Servicio de logging que solo funciona en desarrollo
 * En producción, todos los logs se silencian automáticamente
 */

const isDevelopment = import.meta.env.MODE === 'development';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // Los errores SIEMPRE se muestran (incluso en producción)
    console.error(...args);
  },

  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  }
};

export default logger;
