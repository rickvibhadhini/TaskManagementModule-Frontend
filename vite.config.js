import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    port: 5173, // Explicitly set the port to match your CORS configuration
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // Your Spring Boot server
        changeOrigin: true,
        secure: false
      }
    }
  }
}) 