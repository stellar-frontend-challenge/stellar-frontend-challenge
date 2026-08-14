import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@stellar/stellar-sdk')) return 'stellar';
          if (id.includes('@stellar/freighter-api')) return 'freighter';
          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
