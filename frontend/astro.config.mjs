// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import auth from 'auth-astro';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({

  output: 'server',

  integrations: [react(), mdx(), auth()],

  server: {
    port: 4321,
    host: true, // Esto es vital para que Docker pueda exponer la red hacia afuera
  },

  adapter: node({
    mode: 'standalone'
  })
});