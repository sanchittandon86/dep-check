import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { strictPort: true, port: 5175 },
  build: {
    rollupOptions: {
      output: {
        // Fixed name for remote entry so host can load /assets/remoteEntry.js
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId?.includes('remoteEntry')) return 'assets/remoteEntry.js'
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    react({
      // React Compiler disabled: useMemoCache conflicts with host's shared React in Module Federation
    }),
    federation({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/remoteEntry.tsx',
      },
      shared: {
        react: { requiredVersion: '^19.0.0', singleton: true },
        'react-dom': { requiredVersion: '^19.0.0', singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
})
