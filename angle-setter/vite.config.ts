import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Use a base path only for production (GitHub Pages). Dev stays at "/".
  base: mode === 'production' ? '/uwgas/' : '/',
  plugins: [react()],
}))
