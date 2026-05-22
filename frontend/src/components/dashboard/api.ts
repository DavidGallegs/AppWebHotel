import axios from 'axios';

/* * ARCHIVO: api.ts
 * Propósito: Aquí creamos una instancia personalizada de Axios. 
 * ¿Por qué? Para no tener que escribir la URL base ni los headers (Content-Type) 
 * cada vez que hacemos una petición en el resto de la aplicación. Es nuestra "autopista" al backend.
 */
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/* * FUNCIÓN: setAuthToken
 * Propósito: Actúa como un "guardia de seguridad". 
 * Cuando el usuario inicia sesión y tenemos su Token, usamos esta función.
 * A partir de ese momento, el "interceptor" inyectará automáticamente ese Token 
 * en TODAS las peticiones futuras. Así el backend de Laravel sabe quién está llamando.
 */
export const setAuthToken = (token: string) => {
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};