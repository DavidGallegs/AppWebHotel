import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';

interface LaravelUser {
  id: string;
  name: string;
  email: string;
  token: string;
  role: string;
}

export default defineConfig({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // 2. Corazón del login
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const response = await fetch("http://backend:80/api/login", {
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
          console.log(" RESPUESTA DE LARAVEL:", data);

          // Si Laravel dice que ok, devolvemos el objeto usuario
          if (response.ok && data.user) {
            return {
              id: data.user.id.toString(), 
              name: data.user.name,
              email: data.user.email,
              token: data.token, 
              role: data.role,
            } as LaravelUser;
          }

          return null; 
        } catch (error) {
          console.error("Error en la conexión con Laravel:", error);
          return null;
        }
      }
    })
  ],
  // 3. Los Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userData = user;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = token.userData as any;
      }
      return session;
    }
  }
});