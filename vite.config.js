import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/..." apunta a src/ (ej: import { Button } from "@/components/ui/button")
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
})
