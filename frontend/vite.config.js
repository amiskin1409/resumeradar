import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the FastAPI backend during development
      '/api': {
        // 127.0.0.1 (not "localhost") so Node never resolves to ::1 first,
        // which uvicorn does not bind to.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
