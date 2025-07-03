import axios from 'axios';
import { config } from '../config/env';

// singleton para la instancia de axios
const api = axios.create({
  baseURL: config.apiUrl || "https://localhost:4024/api/", // Usar la URL del env o fallback
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token
api.interceptors.request.use((config) => {
  // Obtener token del sessionStorage en lugar de usar hook
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token; // El token ya incluye "Bearer " desde AuthContext
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar sessionStorage y redirigir a la ruta correcta
      sessionStorage.clear();
      window.location.href = '/login'; // Cambiado de '/auth' a '/login'
    }
    return Promise.reject(error);
  }
);

export default api;