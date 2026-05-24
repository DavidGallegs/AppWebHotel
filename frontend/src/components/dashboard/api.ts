import axios from 'axios';

/* * ARCHIVO: api.ts
 * Propósito: Instancia optimizada y segura de Axios para producción y local.
 */
export const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL + "/api",
  
  // SOLUCIÓN AL PROBLEMA 1: Fuerza a Axios a viajar SIEMPRE con las cookies 
  // (laravel_session y XSRF-TOKEN) en entornos de IPs cruzadas como AWS.
  withCredentials: true, 
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/* * FUNCIÓN: setAuthToken
 * SOLUCIÓN AL PROBLEMA 2: En lugar de usar interceptores que se acumulan infinitamente,
 * inyectamos o removemos el Token directamente en la configuración por defecto de Axios.
 * Es limpio, directo y seguro contra cambios de sesión.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    // Si hay token, se asigna al header común de forma global
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Si es null (Cierre de sesión), se elimina por completo el header
    delete api.defaults.headers.common['Authorization'];
  }
};