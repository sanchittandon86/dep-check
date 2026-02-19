import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'
import path from "path"
import { fileURLToPath } from "url"
import { readFileSync } from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Derive federation remotes from module.json (single source of truth)
const moduleJsonPath = path.resolve(__dirname, "public", "module.json")
const moduleJson = JSON.parse(readFileSync(moduleJsonPath, "utf-8")) as {
  modules: Array<{ id: string; baseUrl: string }>
}
const federationRemotes: Record<string, string> = {}
for (const m of moduleJson.modules ?? []) {
  if (m.baseUrl && m.baseUrl.trim() !== "") {
    const base = m.baseUrl.replace(/\/$/, "")
    federationRemotes[m.id] = `${base}/remoteEntry.js`
  }
}

// https://vite.dev/config/
export default defineConfig({
  server: { strictPort: true, port: 5173 },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    federation({
      name: 'core',
      remotes: federationRemotes,
      shared: {
        react: { requiredVersion: '^19.0.0', singleton: true },
        'react-dom': { requiredVersion: '^19.0.0', singleton: true },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
