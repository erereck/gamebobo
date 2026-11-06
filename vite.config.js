import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/gamebobo/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 800, rollupOptions: { output: { manualChunks: { three: ['three'], react: ['react', 'react-dom'] } } } },
  // Cópias de trabalho dos agentes ficam em .claude/worktrees; o vigia do Vite não deve entrar lá.
  server: { host: '127.0.0.1', port: 5173, watch: { ignored: ['**/.claude/**', '**/dist/**'] } },
  preview: { host: '127.0.0.1', port: 4173 },
})
