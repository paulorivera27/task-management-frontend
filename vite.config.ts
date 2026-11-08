import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Mirrors nginx: the API is same-origin during development too.
const api = { target: process.env.DEV_API_URL ?? 'http://localhost:4000' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: { '/graphql': api, '/auth': api },
  },
  test: {
    css: false,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    environmentOptions: { jsdom: { url: 'http://localhost:3000/' } },
    // Node's fetch rejects the relative default, so tests talk to an absolute origin that MSW intercepts.
    env: { VITE_API_URL: 'http://localhost:4000/graphql' },
  },
})
