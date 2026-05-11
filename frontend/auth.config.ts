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
        password: { label: "Password", type: "password" },
        otp: { label: "Código 2FA", type: "text" } // <-- 1. AÑADIMOS EL CAMPO OTP
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // El backend de docker interno
          const response = await fetch("http://backend:80/api/login", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              otp: credentials.otp, // <-- 2. SE LO ENVIAMOS A LARAVEL
            }),
          });

          const data = await response.json();
          console.log("RESPUESTA DE LARAVEL:", data);

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