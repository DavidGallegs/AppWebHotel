import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';

// 1. Definimos la interfaz del usuario que viene de Laravel para que TS no se queje
interface LaravelUser {
  id: string;
  name: string;
  email: string;
  token: string;
}

export default defineConfig({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // 2. Esta función es el "corazón" del login
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // LLAMADA AL BACKEND (Dentro de la red de Docker)
          const response = await fetch("http://backend:8000/api/login", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          // Si Laravel dice que ok, devolvemos el objeto usuario
          if (response.ok && data.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              token: data.token, // Guardamos el token de Laravel (Sanctum/JWT)
            };
          }

          return null; // Login fallido
        } catch (error) {
          console.error("Error en la conexión con Laravel:", error);
          return null;
        }
      }
    })
  ],
  // 3. Los Callbacks: El puente para que los datos sobrevivan entre páginas
  callbacks: {
    async jwt({ token, user }) {
      // Si acabamos de loguear, metemos los datos del usuario en el JWT de Auth-Astro
      if (user) {
        token.userData = user;
      }
      return token;
    },
    async session({ session, token }) {
      // Pasamos los datos del JWT a la sesión que leeremos en el cliente (React)
      if (session.user) {
        session.user = token.userData as any;
      }
      return session;
    }
  }
});