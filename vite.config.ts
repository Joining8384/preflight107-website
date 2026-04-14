import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Serve index.html for all routes so /dashboard works without a 404
    historyApiFallback: true,
  }
})
