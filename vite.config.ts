import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
