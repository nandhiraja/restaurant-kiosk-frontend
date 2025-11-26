import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/

const NGROK_URL = 'https://4351c8539fe4.ngrok-free.app';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,               // default Vite port
    strictPort: true,         // fail if port is busy
    open: true,               // auto-open browser
    https: false,             // keep it http for local
    proxy: {
      // 🔥 Proxy all /api calls to Ngrok backend
      '/api': {
        target: NGROK_URL,    // backend public URL
        changeOrigin: true,   // adjust origin header
        secure: false,        // allow self-signed certs
        rewrite: (path) => path.replace(/^\/api/, ''), // optional: remove /api prefix
      },
    },
  }
})
