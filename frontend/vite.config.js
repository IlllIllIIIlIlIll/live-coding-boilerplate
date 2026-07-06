import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // bind to 0.0.0.0 so the dev server is reachable over LAN (e.g. from a phone)
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app', '.ngrok-free.dev'], // ngrok tunnel domains
    proxy: {
      // Only the frontend needs an ngrok tunnel — API calls are proxied to the
      // backend here, so the phone only ever talks to one HTTPS origin.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
