import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // ← 1. On ajoute l'importation du module de chemin

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ← 2. On conserve ton plugin Tailwind v4 intact !
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ← 3. On ajoute le raccourci magique pour Shadcn
    },
  },
})
