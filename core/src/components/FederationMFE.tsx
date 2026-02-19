import React, { Suspense, lazy } from 'react'
import type { ModuleWithAvailability } from '@/hooks/useModules'

// Lazy-loaded federated apps. Keys must match module.json "id" for modules that use
// federation (have baseUrl). Core vite.config builds remotes from module.json; add
// a new lazy import + entry here when you add a new MFE to module.json.
const OMSApp = lazy(() => import('oms/App'))
const DashboardApp = lazy(() => import('dashboard/App'))

const REMOTE_APPS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  oms: OMSApp,
  dashboard: DashboardApp,
}

interface FederationMFEProps {
  module: ModuleWithAvailability
}

function FederatedFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
      Loading remote app…
    </div>
  )
}

/**
 * Renders a remote MFE via Module Federation (same page, shared React).
 * Only use for modules that are exposed as federation remotes.
 */
export function FederationMFE({ module }: FederationMFEProps) {
  const RemoteApp = REMOTE_APPS[module.id]

  if (!RemoteApp) {
    return (
      <p className="text-muted-foreground">
        Unknown module: {module.id}. Add it to REMOTE_APPS in FederationMFE.
      </p>
    )
  }

  return (
    <Suspense fallback={<FederatedFallback />}>
      <RemoteApp />
    </Suspense>
  )
}
