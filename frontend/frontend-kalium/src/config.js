const API_ORIGIN = (
  import.meta.env.VITE_API_URL || `http://${'localhost'}:${8080}`
).replace(/\/$/, '');

export const API_ORIGIN_URL = API_ORIGIN;
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const WS_URL = `${API_ORIGIN}/ws`;
