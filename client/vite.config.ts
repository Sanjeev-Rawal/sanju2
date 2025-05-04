import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // map `@/` to the `src/` folder
      '@': resolve(__dirname, 'src'),
    },
  },
})
