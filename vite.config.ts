import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    target: 'es2020',
    // Keep the 3D libraries in their own chunk so the initial UI paints fast.
    // (All of three/r3f — including the GLTF loader used by the optional player
    // models — loads lazily with the hero, after first paint.)
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
        },
      },
    },
  },
})
