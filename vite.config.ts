import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/CRWebApp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico}'],
      },
      manifest: {
        name: 'Thought Records',
        short_name: 'Thoughts',
        description: 'Private CBT thought records — everything stays on your device.',
        display: 'standalone',
        theme_color: '#FAF8F4',
        background_color: '#FAF8F4',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
