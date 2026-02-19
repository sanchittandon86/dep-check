import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { strictPort: true, port: 5174 },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  plugins: [
    react({
      // React Compiler disabled: useMemoCache conflicts with host's shared React in Module Federation
    }),
    tailwindcss(),
    federation({
      name: 'oms',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/remoteEntry.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
})
