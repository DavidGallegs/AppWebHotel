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
  trustHost: true,
  useSecureCookies: false,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "Código 2FA", type: "text" } 
      },
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
              otp: credentials.otp, 
            }),
          });

          const data = await response.json();

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
  callbacks: {
    // --- LA NUEVA REGLA QUE ARREGLA EL GPS ---
    async redirect({ url, baseUrl }) {
      // Si Auth.js intenta enviarnos a la IP de AWS o a una ruta relativa, lo permitimos siempre
      if (url.includes('35.180.46.142') || url.startsWith('/')) {
        return url;
      }
      // Si se vuelve loco y quiere llevarnos a localhost, lo forzamos a la IP
      return 'http://35.180.46.142:4321';
    },
    // -----------------------------------------
    
    async jwt({ token, user }) {
      if (user) token.userData = user;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user = token.userData as any;
      return session;
    }
  }
});