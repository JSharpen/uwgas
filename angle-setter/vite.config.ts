import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/uwgas/',   // 👈 this is for GitHub Pages URL
  plugins: [react()],
})
