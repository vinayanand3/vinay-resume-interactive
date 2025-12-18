import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This is crucial for GitHub Pages. It must match your repository name.
  // Allow overriding for preview deploys (e.g. /vinay-resume/preview/)
  base: process.env.VITE_BASE ?? '/vinay-resume/',
  build: {
    rollupOptions: {
      output: {
        // Split long-lived vendor code for better caching.
        manualChunks: {
          react: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});