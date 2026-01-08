
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Aumenta o limite do aviso para 1000kb (útil para apps com bibliotecas pesadas como Firebase)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Separa bibliotecas grandes em chunks menores e independentes
        manualChunks: {
          'firebase-bundle': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-charts': ['recharts'],
          'vendor': ['react', 'react-dom', 'lucide-react']
        }
      }
    }
  }
});
