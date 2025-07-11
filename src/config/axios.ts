import axios from 'axios';
import { config } from '../config/env';
import { dotnet_api_url } from '../shared/consts/dotnet_api_url';

// singleton para la instancia de axios
const api = axios.create({
  baseURL: config.apiUrl || dotnet_api_url, // Usar la URL del env o fallback desde dotnet_api_url
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