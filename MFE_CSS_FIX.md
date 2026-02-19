# MFE CSS & Layout Fix — Root Cause Analysis & Resolution

## Problem Statement

Three microfrontends — `core` (shell), `dashboard`, and `oms` — were built using
**Module Federation** (`@originjs/vite-plugin-federation`) with **Tailwind CSS v4**
and **shadcn/ui**. Each MFE looked correct in standalone (`npm run dev`) but when
loaded inside Core's sidebar layout, everything broke:

- Layout was distorted (wrong height, overflow, double padding)
- shadcn components were unstyled or mis-sized
- Backgrounds and colors were wrong
- `h1` headings were enormous
- Dark/light mode behaved inconsistently

---

## Root Causes (All 4 Found)

### Cause 1 — Remote CSS injected into Core's DOM via federation expose

When `@originjs/vite-plugin-federation` builds a remote, it bundles **all CSS reachable
from the expose entry** (`remoteEntry.tsx → App.tsx`) into a file named
`__federation_expose_App-*.css`. This file is **automatically injected into Core's
`<head>`** at runtime when the remote is lazy-loaded.

Dashboard's `App.tsx` had `import "./App.css"` which contained:

```css
/* dashboard/src/App.css */
#root {
  width: 100%;
  min-height: 100vh;
}
```

When Core loaded Dashboard, this CSS was injected and applied `min-height: 100vh`
to **Core's own `#root` element** — a DOM node Core has no idea is being targeted.

---

### Cause 2 — Vite Hello World template `body` CSS left in Core

Core's `index.css` still contained the default Vite starter template CSS that is
generated for the demo "Hello World" page. This CSS should never be in a real app:

```css
/* core/src/index.css — VITE TEMPLATE LEFTOVERS */
body {
  display: flex;        /* centers #root inside body */
  place-items: center;  /* vertically + horizontally centers everything */
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;     /* inflates every h1 in every loaded MFE */
  line-height: 1.1;
}
```

`display: flex; place-items: center` on `body` centered `#root` in the viewport.
The shadcn `Sidebar` component expects `body` to flow normally, not be a centering
flex container. This broke the entire sidebar layout structure.

The `h1` rule made every heading rendered by Dashboard or OMS appear at `3.2em`
regardless of the Tailwind class applied.

---

### Cause 3 — Remote root components assumed they were the full page

Both remote App roots used `min-h-screen` (= `100vh`) and page-level backgrounds:

```tsx
// dashboard/src/App.tsx
<div className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">

// oms/src/App.tsx
<div className="min-h-screen bg-background text-foreground antialiased">
```

When embedded inside Core's sidebar content area (which itself has height
constraints), `min-h-screen` forced the remote to demand full viewport height
inside a constrained container → overflow, unwanted scrollbars, broken flex layout.

`bg-muted/30` in Dashboard created a grey tinted box inside Core's white/dark
content area — visible as a strange grey rectangle in the MFE slot.

`bg-background text-foreground antialiased` in OMS were redundant because Core's
`@layer base { body { ... } }` already applies these to the whole page.

---

### Cause 4 — `color-scheme` mismatch between Core and Dashboard

```css
/* core/src/index.css */
color-scheme: light;        /* light only */

/* dashboard/src/index.css */
color-scheme: light dark;   /* auto light/dark */
```

When Dashboard's CSS was injected after Core's, it changed the page-level
`color-scheme`. This caused browser-native elements (scrollbars, `<select>`,
`<input>`, `<date>`) to switch between light-only and auto rendering mid-session.

---

## Before → After: File-by-File Changes

---

### `core/src/index.css`

**Before:**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  color-scheme: light;          /* ← light only */
  /* ...variables... */
}

a {
  font-weight: 500;
  color: inherit;
  text-decoration: inherit;
}

body {
  margin: 0;
  display: flex;                /* ← Vite template: centers #root */
  place-items: center;          /* ← Vite template: centers content */
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;             /* ← Vite template: inflates all h1s */
  line-height: 1.1;
}

/* Let shadcn/Tailwind control button styles - no global dark background */

@theme inline { /* ...token mappings... */ }
.dark { /* ...dark variables... */ }
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

**After:**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

/* Core scans remote source files → generates all their Tailwind classes.
   Remotes rely on Core's CSS; they do not inject their own global CSS when federated. */
@source "../../dashboard/src";
@source "../../oms/src";

@custom-variant dark (&:is(.dark *));
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  color-scheme: light dark;     /* ← matches remotes, no mid-session switch */
  /* ...variables unchanged... */
}

a {
  font-weight: 500;
  color: inherit;
  text-decoration: inherit;
}

/* body flex/h1 blocks removed entirely */

@theme inline { /* ...unchanged... */ }
.dark { /* ...unchanged... */ }
@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

**What changed and why:**

| Change | Why |
|--------|-----|
| Added `@source` for remote dirs | Core's Tailwind build now covers all classes used by any MFE. No remote needs to generate its own Tailwind CSS when federated. |
| Removed `display: flex; place-items: center` from `body` | Was centering `#root` in the viewport — broke shadcn Sidebar's expected DOM flow. |
| Removed `min-height: 100vh` from `body` | The sidebar layout handles its own height via flex. |
| Removed `h1 { font-size: 3.2em }` | Was inflating every `<h1>` inside every loaded MFE. |
| `color-scheme: light` → `light dark` | Prevents browser-native controls from visually switching when remote CSS loads. |

---

### `dashboard/src/App.tsx`

**Before:**
```tsx
import { PortfolioCard } from "@/components/PortfolioCard"
import "./App.css"                        // ← gets bundled into federation expose CSS

function App() {
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">  {/* ← page-level */}
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold ...">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Customer portfolio overview</p>
        </header>
        <PortfolioCard />
      </div>
    </div>
  )
}
```

**After:**
```tsx
import { PortfolioCard } from "@/components/PortfolioCard"
// App.css import removed — moved to main.tsx (standalone only)

function App() {
  return (
    <div className="max-w-3xl space-y-8">   {/* ← layout-agnostic, Core provides padding */}
      <header>
        <h1 className="text-2xl font-semibold ...">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customer portfolio overview</p>
      </header>
      <PortfolioCard />
    </div>
  )
}
```

**What changed and why:**

| Change | Why |
|--------|-----|
| Removed `import "./App.css"` | `App.css` contained `#root { min-height: 100vh }`. Because `App.tsx` is in the federation expose chain, this CSS was bundled into `__federation_expose_App-*.css` and injected into Core's DOM — applying `min-height: 100vh` to Core's own `#root`. |
| Removed `min-h-screen` | The remote is embedded, not a full page. Core's content area provides the height context. |
| Removed `bg-muted/30` | Created a grey tinted rectangle inside Core's content area. Backgrounds are Core's responsibility. |
| Removed outer padding div (`px-4 py-8`) | Core's `<main className="p-6">` already provides padding. Double-padding was causing excessive spacing. |

---

### `dashboard/src/main.tsx`

**Before:**
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// App.css was imported in App.tsx
import App from './App.tsx'
```

**After:**
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'    // ← moved here: only active in standalone dev mode
import App from './App.tsx'
```

**What changed and why:**

`main.tsx` is the **standalone entry point** — it is never part of the federation
expose chain (`remoteEntry.tsx` exposes `App.tsx`, not `main.tsx`). By moving
`App.css` here, the `#root` sizing still works when you run `npm run dev` on
Dashboard in isolation, but it never leaks into Core's DOM when loaded as a remote.

---

### `oms/src/App.tsx`

**Before:**
```tsx
export function OmsRoutes() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Routes>
        <Route path="/" element={<InstrumentList />} />
        <Route path="/order/:instrumentId" element={<CreateOrder />} />
      </Routes>
    </div>
  );
}
```

**After:**
```tsx
export function OmsRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<InstrumentList />} />
        <Route path="/order/:instrumentId" element={<CreateOrder />} />
      </Routes>
    </div>
  );
}
```

**What changed and why:**

| Change | Why |
|--------|-----|
| Removed `min-h-screen` | Same reason as Dashboard — forces 100vh height inside a constrained container, causing overflow and broken layout. |
| Removed `bg-background` | Core's `@layer base { body { @apply bg-background } }` already sets this on the page. Redundant when embedded. |
| Removed `text-foreground` | Same — inherited from Core's body base styles. |
| Removed `antialiased` | Core's `:root` has `-webkit-font-smoothing: antialiased` globally. Redundant. |

---

### `core/src/App.tsx`

**Before:**
```tsx
<div className="flex flex-1 flex-col gap-4 p-4 pt-20">
  <main className="container py-6">
    {/* MFE renders here */}
  </main>
</div>
```

**After:**
```tsx
<div className="flex flex-1 flex-col pt-14 overflow-auto">
  <main className="flex-1 p-6">
    {/* MFE renders here */}
  </main>
</div>
```

**What changed and why:**

| Change | Why |
|--------|-----|
| `p-4 pt-20` → `pt-14` | Header is `h-14` (= 3.5rem = 56px). `pt-14` precisely offsets the fixed header. The old `pt-20` (80px) left 24px of dead space below the header. The old `p-4` added side padding that remotes then doubled. |
| Removed `gap-4` | Gap between flex children created extra space between header offset div and `<main>`. |
| Added `overflow-auto` | Makes the content area scroll independently. Without this, the entire page scrolled including the sidebar. |
| Removed `container` from `<main>` | `container` applies a `max-width` + `mx-auto`. Each MFE should own its own max-width constraint. Double-constraining (Core + remote) caused content to be too narrow. |
| `py-6` → `p-6` | Symmetric padding on all sides. Remotes no longer add their own padding so Core must provide it. |
| Added `flex-1` to `<main>` | Ensures the main area fills all available vertical space below the header. |

---

## How It Works Now

```
Browser DOM
└── body  (margin:0, bg-background via @layer base — set once by Core)
    └── #root
        └── BrowserRouter
            └── SidebarProvider  (flex row, full screen)
                ├── AppSidebar   (fixed width or icon-collapsed)
                └── SidebarInset (flex-1, fills remaining width)
                    ├── Header   (position:fixed, h-14, z-50)
                    └── div.pt-14.overflow-auto   (scrollable content area)
                        └── main.flex-1.p-6
                            └── <FederationMFE>   (remote renders here)
                                └── Dashboard or OMS component
                                    (layout-agnostic, no min-h-screen,
                                     no page backgrounds, no extra padding)
```

### CSS Ownership — Single Source of Truth

```
Core owns (loaded once, always present):
  ✓ @import "tailwindcss"          → all utility classes for Core + all remotes
  ✓ @import "shadcn/tailwind.css"  → shadcn component base styles
  ✓ :root { --background, --foreground, ... }  → design tokens
  ✓ .dark { ... }                  → dark theme overrides
  ✓ @theme inline { ... }          → Tailwind v4 token mappings
  ✓ @layer base { body { ... } }   → base background + text colour

Remotes provide (components only, no global CSS in the federation expose):
  ✓ React component tree
  ✓ Tailwind utility classes on elements (Core has already generated them via @source)
  ✗ No :root variable redefinitions (Core owns these)
  ✗ No @import "tailwindcss" in expose chain (Core provides it)
  ✗ No min-h-screen on root divs (not a full page)
  ✗ No body-level backgrounds (inherited from Core)
```

### Module Federation CSS Injection — Before vs After

**Before:**
```
Core loads Dashboard →
  federation injects __federation_expose_App-*.css containing:
    - App.css: #root { min-height: 100vh }   ← corrupts Core's #root
  Dashboard App renders with min-h-screen + bg-muted/30
  Core's body has display:flex; place-items:center  ← misaligns layout
  Result: broken layout, wrong colours, double padding
```

**After:**
```
Core loads Dashboard →
  federation has no CSS in expose chain (App.css removed from App.tsx)
  Dashboard App renders as a plain layout-agnostic component
  Core's body flows normally (no flex centering)
  Core's CSS already includes all Tailwind classes Dashboard needs (via @source)
  Result: clean layout, correct colours, single padding layer
```

---

## Generic Contract for Any Future MFE

Every new MFE added to this system must follow these rules:

| Rule | Correct | Wrong |
|------|---------|-------|
| Global CSS import location | `main.tsx` only | `App.tsx` or any file in expose chain |
| Root component height | `h-full` or no height class | `min-h-screen`, `h-screen` |
| Root component background | None (inherited from Core) | `bg-background`, `bg-white`, etc. |
| Root component text colour | None (inherited from Core) | `text-foreground`, `text-gray-900` |
| Padding/spacing | Use Tailwind utilities internally | Don't replicate Core's outer padding |
| `remoteEntry.tsx` | Re-exports component only, no CSS imports | Must not import `index.css` or `App.css` |
| `index.css` | Only for standalone development | Not for federation |
| `App.css` (if needed) | Import in `main.tsx` only | Not in `App.tsx` |
| Max-width constraints | MFE controls its own (`max-w-3xl`, etc.) | Don't rely on Core's `container` class |

### Checklist for registering a new MFE in Core

1. Add entry to `core/public/module.json` with `id`, `path`, `label`, `icon`, `baseUrl`
2. Add `@source "../../<mfe-name>/src"` to `core/src/index.css`
3. Add lazy import to `core/src/components/FederationMFE.tsx`
4. Add icon to `ICON_MAP` in `core/src/components/app-sidebar.tsx`
5. Ensure new MFE's `remoteEntry.tsx` has no CSS imports
6. Ensure new MFE's root component has no `min-h-screen` or page-level backgrounds
