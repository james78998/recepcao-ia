import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
    // Apenas frontend (src/ da raiz do projeto).
    // Testes do backend ficam em server/ e rodam com Jest: cd server && npm test
    include: ['./src/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', 'server/**'],
  },
})
