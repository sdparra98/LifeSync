import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Define 'process.env' para evitar erros de 'process is not defined' no navegador
  define: {
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('lucide-react')) return 'vendor-ui';
            return 'vendor';
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/'
    }
  }
});