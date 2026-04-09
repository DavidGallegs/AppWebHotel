// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  server: {
    port: 4321,
    host: true, // Esto es vital para que Docker pueda exponer la red hacia afuera
  }
});