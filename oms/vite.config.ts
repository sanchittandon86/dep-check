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
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.facadeModuleId?.includes('remoteEntry')) return 'assets/remoteEntry.js'
          return 'assets/[name]-[hash].js'
        },
      },
    },
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
      shared: {
        react: { requiredVersion: '^19.0.0', singleton: true },
        'react-dom': { requiredVersion: '^19.0.0', singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
})
