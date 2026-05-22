// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import auth from 'auth-astro';
import node from '@astrojs/node';

/* * ARCHIVO: astro.config.mjs
 * Propósito: Conecta todo nuestro Stack tecnológico.
 */
export default defineConfig({
  // output: 'server' indica que Astro funcionará como un servidor Node, no como archivos estáticos HTML
  output: 'server',

  // Cargamos nuestras islas de React, soporte Markdown y el sistema de Auth
  integrations: [react(), mdx(), auth()],

  server: {
    port: 4321,
    // host: true es para Docker. Permite que el contenedor de Astro 
    // escuche peticiones desde fuera de su propia "caja".
    host: true, 
  },

  adapter: node({
    mode: 'standalone'
  })
});