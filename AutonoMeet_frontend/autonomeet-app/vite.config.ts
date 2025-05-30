import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Escuchar en todas las interfaces (necesario para Render)
    port: 5173, // Puerto predeterminado de Vite
    allowedHosts: [
      'practica-final-sw2-frontend.onrender.com', // Permitir el dominio de Render
      'localhost', // Para pruebas locales
    ],
  },
});
