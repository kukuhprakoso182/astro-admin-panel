// @ts-check
import { defineConfig, sessionDrivers  } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
  },

  output: 'server',

  adapter: node({
    mode: 'standalone',
  }),

  session: {
    driver: sessionDrivers.memory(),
  },
});