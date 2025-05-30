import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    port: 5173, 
    allowedHosts: [
      'practica-final-sw2-frontend.onrender.com', 
      'localhost', 
    ],
  },
});
