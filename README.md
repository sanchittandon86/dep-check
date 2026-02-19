# MFE POC — Microfrontend Proof of Concept
 
A monorepo containing three independent React + Vite microfrontend applications.
 
## Projects
 
| Project | Description | Path |
|---------|-------------|------|
| **Dashboard** | Dashboard microfrontend | [`dashboard/`](./dashboard) |
| **Core** | Core/shared microfrontend module | [`core/`](./core) |
| **OMS** | Order Management System microfrontend | [`oms/`](./oms) |
 
## Dynamic modules (Core)

The Core app reads **`core/public/module.json`** to build the navbar and routes. Only MFEs that are **up and reachable** are shown in the sidebar and routable.

- **Dashboard** — Separate MFE; `baseUrl` is `http://localhost:5175`, route `/dashboard`. Run with `cd dashboard && npm run dev:remote`. It appears in the navbar only when the dashboard app is up.
- **OMS** — `baseUrl` is `http://localhost:5174`, route `/oms`. Run with `cd oms && npm run dev:remote`. It appears in the navbar only when the OMS app is up.

If an MFE dev server runs on a different port, update its `baseUrl` in `module.json`. For cross-origin health checks, MFEs may need to allow CORS from the Core origin.

To add more MFEs, add entries to `module.json` and register the icon name in `core/src/components/app-sidebar.tsx` (`ICON_MAP`).

## Module Federation

Core loads OMS and Dashboard as **remotes** via `@originjs/vite-plugin-federation`. When you click Dashboard or OMS in the sidebar, the corresponding remote app is loaded and rendered in the same page (no iframe); React is shared so only one instance runs.

- **Federation needs built remotes:** Run Core with `npm run dev`; run Dashboard and OMS with `npm run dev:remote` (build + preview). Then open http://localhost:5173. **Run all three** for full experience: `core` (5173), `oms` (5174), `dashboard` (5175). Start remotes before or after core; the shell will load them when you navigate to their route.
- Remotes expose `./App` (via `remoteEntry.tsx`); the host lazy-loads `oms/App` and `dashboard/App`. Core derives federation remote URLs from `core/public/module.json` (baseUrl + `/assets/remoteEntry.js`). Adding a new federated MFE: add it to `module.json`, expose it in the MFE’s vite config, then register a lazy import in `core/src/components/FederationMFE.tsx` (`REMOTE_APPS`) (and types in `core/src/types/federation.d.ts`).

## Quick Start (Module Federation)

Install deps once per app, then run core + remotes:

```bash
# 1) Core (host)
cd core
npm install
npm run dev

# 2) Dashboard (remote) - build + preview so remoteEntry exists
cd ../dashboard
npm install
npm run dev:remote

# 3) OMS (remote) - build + preview so remoteEntry exists
cd ../oms
npm install
npm run dev:remote
```
 
## Tech Stack
 
- **React** — UI library
- **Vite** — Build tool & dev server
 
## Repository Structure
 
```
mfe_poc/
├── dashboard/       # Dashboard microfrontend
├── core/            # Core/shared microfrontend
├── oms/             # OMS microfrontend
└── README.md        # This file