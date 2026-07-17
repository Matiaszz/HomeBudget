import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API calls to the app service
      '/api': {
        target: process.env.services__server__https__0 || 
                process.env.services__server__http__0 || 
                process.env.SERVER_HTTPS || 
                process.env.SERVER_HTTP || 
                'http://127.0.0.1:5314',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
