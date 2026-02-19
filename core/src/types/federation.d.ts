/**
 * Module Federation remote types.
 * Declare remote modules so TypeScript accepts dynamic imports.
 */
declare module 'oms/App' {
  import type { ComponentType } from 'react'
  const App: ComponentType
  export default App
}

declare module 'dashboard/App' {
  import type { ComponentType } from 'react'
  const App: ComponentType
  export default App
}
