import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  // This is crucial for GitHub Pages. It must match your repository name.
  // Allow overriding for preview deploys (e.g. /vinay-resume/preview/)
  base: process.env.VITE_BASE ?? '/vinay-resume-interactive/',
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