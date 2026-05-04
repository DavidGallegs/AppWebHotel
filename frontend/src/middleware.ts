// src/middleware.ts
import { getSession } from 'auth-astro/server';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const session = await getSession(context.request);
  const { pathname } = context.url;

  // 1. LISTA DE RUTAS PRIVADAS (Solo para usuarios logueados)
  const privateRoutes = ['/reserva','/dashboard','/admin'];
  
  // Comprobamos si la URL actual EMPIEZA por alguna de las rutas privadas
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    // Si es privada y no hay sesión, lo echamos al login
    return context.redirect('/login');
  }

  // 2. LISTA DE RUTAS DE AUTENTICACIÓN (Solo para invitados)
  const authRoutes = ['/login', '/join'];
  
  // Comprobamos si la URL actual ES EXACTAMENTE alguna de estas
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && session) {
    // Si ya tiene sesión e intenta ir al login/join, lo mandamos al inicio
    return context.redirect('/');
  }

  // 3. Si pasa todos los filtros, le mostramos la página normal
  return next();
});