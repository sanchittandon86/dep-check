# MFE POC — Implementation Summary

This document summarizes what has been created and implemented in the Microfrontend Proof of Concept (MFE POC) to date.

---

## 1. Overview

- **Monorepo** with three React + Vite applications: **Core** (host shell), **Dashboard**, and **OMS** (Order Management System).
- **Module Federation** via `@originjs/vite-plugin-federation`: Core loads Dashboard and OMS as remotes; remotes run in the same page with shared React (no iframes).
- **Dynamic module discovery**: Core reads `core/public/module.json` to build the sidebar and routes; only MFEs that are **up and reachable** are shown and routable.

---

## 2. Core (Host Shell)

### 2.1 Responsibilities

- Shell layout: sidebar + header + main content area.
- Loads and displays remote MFEs (Dashboard, OMS) inside the main area via Module Federation.
- Single source of truth for navigation and remote URLs: `module.json`.
- Global notifications (from any MFE) and theme.

### 2.2 Implemented Features

| Feature | Description |
|--------|-------------|
| **Dynamic sidebar** | `AppSidebar` — Nav items from `module.json`; only modules that pass health check (HEAD/GET to `baseUrl`) are shown. Icons mapped in `app-sidebar.tsx` (`ICON_MAP`). |
| **Header** | Fixed top bar: hamburger, logo (بنك مسقط / Bank Muscat), theme toggle, notifications dropdown, account dropdown (logout). |
| **Theme toggle** | Light/dark via `ThemeToggle`; uses `@/lib/theme` (`initTheme`, `applyTheme`). |
| **Notifications** | Central store (`notificationStore.ts`); toast (Sonner) + dropdown in header; unread count badge; mark all read. |
| **MFE notifications** | `useMfeNotifications` listens for `mfe:notification` custom events; adds to store and shows toast by type (success/error/warning/info). |
| **Auth (mock)** | `useAuthStore`: mock user (e.g. Avinash), login/logout; user name in sidebar and header. |
| **Routing** | React Router; routes generated from `availableModules`; each module gets `path/*` → `FederationMFE`; default redirect to first available module or “No modules available”. |
| **Federation** | `FederationMFE.tsx` lazy-loads `oms/App` and `dashboard/App`; remotes config derived from `module.json` in `vite.config.ts`. |

### 2.3 Key Files

- `core/src/App.tsx` — `BrowserRouter`, `SidebarProvider`, `AppLayout`, `Routes`, `Toaster`, `useMfeNotifications`.
- `core/src/components/app-sidebar.tsx` — Dynamic nav from `useModules()`, greeting, Arabic, Logout.
- `core/src/components/header.tsx` — Menu, logo, theme, notifications dropdown, account menu.
- `core/src/components/FederationMFE.tsx` — Lazy remotes and `Suspense` fallback.
- `core/src/hooks/useModules.ts` — Fetches `module.json`, health-check per `baseUrl`, returns `availableModules`.
- `core/src/hooks/useMfeNotifications.ts` — Subscribes to `mfe:notification`, updates store + toasts.
- `core/src/store/` — `notificationStore.ts`, auth and theme in `index.ts`.
- `core/public/module.json` — Module list (id, path, label, icon, baseUrl).

---

## 3. Dashboard (Remote MFE)

### 3.1 Responsibilities

- Customer portfolio overview: total value, invested, cash, holdings table.
- “Trade” from a holding deep-links to OMS create-order for that instrument.

### 3.2 Implemented Features

| Feature | Description |
|--------|-------------|
| **Portfolio card** | `PortfolioCard`: customer name/ID, Total Value (with day change %), Invested, Cash Balance; holdings table (Symbol, Name, Qty, Value, Change %, Trade). |
| **Mock data** | `portfolio-mock.ts`: customer and holdings (e.g. AAPL, MSFT, GOOGL, AMZN, VOO, NVDA) with `SYMBOL_TO_INSTRUMENT_ID` for Trade link. |
| **Trade deep-link** | “Trade” button navigates to `/oms/order/{instrumentId}` (e.g. INS001 for AAPL). |
| **Federation** | Exposes `./App` via `remoteEntry.tsx`; build + preview as `dev:remote` on port 5175. |

### 3.3 Key Files

- `dashboard/src/App.tsx` — Dashboard title + `PortfolioCard`.
- `dashboard/src/components/PortfolioCard.tsx` — Portfolio summary and holdings table with Trade.
- `dashboard/src/data/portfolio-mock.ts` — Types and mock portfolio.

---

## 4. OMS (Order Management System, Remote MFE)

### 4.1 Responsibilities

- Instrument search and selection.
- Create order flow: transaction type (Buy/Sell/SIP/SWP), bank account, order type (MKT/LMT), quantity/amount, FX when needed, fee options, submit.
- Sends success/error notifications to the shell via `mfe:notification`.

### 4.2 Implemented Features

| Feature | Description |
|--------|-------------|
| **Instrument list** | `InstrumentList`: search (name, ticker, asset type), card grid; click card → create order for that instrument. |
| **Create order** | `CreateOrder`: instrument summary, bank account select, transaction type (Buy/Sell/SIP/SWP), order type (MKT/LMT), order-by (quantity/amount), quantity/amount/limit price, FX rate and total in account currency for multi-currency, fee exception, SIP/SWP fields (start date, frequency, tenure, etc.). |
| **OMS store** | `useOmsStore` (Zustand): instruments, bank accounts, search, selected instrument, order form, computed (FX rate, effective price, total, derived quantity, total in account currency), `submitOrder` (mock delay + success/failure, dispatches notification). |
| **Notification dispatcher** | `eventDispatcher.js`: `dispatchNotification({ type, title, message })` — dispatches `mfe:notification` and updates local `useOmsNotificationStore`. |
| **Data** | `instruments.js`, `bankAccounts`, `fxRates` for mock data. |
| **Federation** | Exposes `./App` via `remoteEntry.tsx` (exports `OmsRoutes` for host); `dev:remote` on port 5174. |

### 4.3 Key Files

- `oms/src/App.tsx` — `OmsRoutes` (Instrument list `/`, Create order `/order/:instrumentId`); default `App` wraps with `BrowserRouter` for standalone.
- `oms/src/remoteEntry.tsx` — Exposes `OmsRoutes` as default for host (no duplicate router).
- `oms/src/pages/InstrumentList.jsx` — Search and instrument cards.
- `oms/src/pages/CreateOrder.jsx` — Full order form and submit.
- `oms/src/store/useOmsStore.js` — Instruments, search, selection, order form, FX, submit, validation.
- `oms/src/store/useOmsNotificationStore.js` — Local notification list (optional).
- `oms/src/utils/eventDispatcher.js` — `mfe:notification` + local store.
- `oms/notification_dispatcher.md` — Short note on OMS notifications.

---

## 5. Cross-Cutting

### 5.1 Module configuration

- **`core/public/module.json`**  
  - `dashboard`: path `/dashboard`, baseUrl `http://localhost:5175`, icon `LayoutDashboard`.  
  - `oms`: path `/oms`, baseUrl `http://localhost:5174`, icon `ClipboardList`.  
- Adding an MFE: add entry in `module.json`, add icon in `app-sidebar.tsx` `ICON_MAP`, add lazy import and key in `FederationMFE.tsx` `REMOTE_APPS`, and add types in `core/src/types/federation.d.ts`.

### 5.2 Tech stack (shared)

- **React 19**, **Vite 7**, **React Router 7**.
- **Tailwind CSS v4** (`@tailwindcss/vite`).
- **Zustand** (core + OMS).
- **Radix UI** / **shadcn**-style components (button, card, dropdown, sidebar, etc.).
- **Sonner** (core toasts).
- **Module Federation**: `@originjs/vite-plugin-federation`; host reads remotes from `module.json`; remotes expose `./App` via `remoteEntry.tsx`.

### 5.3 Run instructions

- **Core**: `cd core && npm run dev` (port 5173).
- **Dashboard**: `cd dashboard && npm run dev:remote` (build + preview 5175).
- **OMS**: `cd oms && npm run dev:remote` (build + preview 5174).
- Open http://localhost:5173; sidebar shows only MFEs that are up; navigating to Dashboard or OMS loads the remote in the same page.

---

## 6. Summary Table

| Area | Implemented |
|------|-------------|
| Core shell | Layout, dynamic sidebar from `module.json`, health check, header (theme, notifications, account), auth mock |
| Notifications | Central store in Core, `mfe:notification` listener, toasts + dropdown, OMS dispatcher |
| Theme | Light/dark toggle in Core header |
| Federation | Core as host; Dashboard & OMS as remotes; remotes from `module.json`; lazy load + Suspense |
| Dashboard | Portfolio card, holdings table, Trade → OMS deep-link |
| OMS | Instrument list with search, create order (Buy/Sell/SIP/SWP, MKT/LMT, FX, fees), submit with notifications |

This file reflects the state of the repository as of the last update. For setup and run steps, see the main [README.md](./README.md).
