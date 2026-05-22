import { getSession } from 'auth-astro/server';
import { defineMiddleware } from 'astro:middleware';

/* * ARCHIVO: middleware.ts
 * Propósito: Este archivo se ejecuta ANTES de que cualquier página cargue. 
 * Es el portero de la discoteca: verifica quién tiene permiso para pasar a qué salas.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const session = await getSession(context.request);
  const { pathname } = context.url;

  // 1. ZONAS RESTRINGIDAS: Solo clientes con pulsera (Sesión iniciada)
  const privateRoutes = ['/reserva', '/dashboard', '/admin'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !session) {
    return context.redirect('/login');
  }

  // 2. ZONAS DE INVITADOS: Si ya tienes pulsera, no necesitas hacer la cola del login
  const authRoutes = ['/login', '/join', '/forgetPassword'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && session) {
    return context.redirect('/');
  }

  // 3. ZONAS VIP (Administración): Solo para el personal autorizado
  if (pathname.startsWith('/admin')) {
    const userRole = (session as any)?.user?.role;
    if (userRole !== 'admin') {
      return context.redirect('/');
    }
  }

  // Si todo está en orden, abrimos las puertas
  return next();
});