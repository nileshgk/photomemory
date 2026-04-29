import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true // Important for Docker port mapping
  },
  build: {
    outDir: 'dist', // Ensures the build output matches what our Dockerfile expects
  }
})
