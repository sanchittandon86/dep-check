import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AppSidebar from "@/components/app-sidebar"
import Header from "@/components/header"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { useModules } from "@/hooks/useModules"
import { FederationMFE } from "@/components/FederationMFE"
import { Toaster } from "sonner"
import { useMfeNotifications } from "@/hooks/useMfeNotifications"

// Wrapper to handle sidebar toggle from Header
const AppLayout = () => {
  const { toggleSidebar } = useSidebar();
  const { availableModules, loading } = useModules();
  useMfeNotifications();

  return (
    <SidebarInset>
      <Header onMenuClick={toggleSidebar} />
      <div className="flex flex-1 flex-col pt-14 overflow-auto">
        {/* MFE slot: remote apps render inside <main> via Routes / Module Federation.
            Shell keeps: SidebarProvider + AppSidebar (left) + this SidebarInset (header + main).
            Each route can lazy-load a remote MFE component as the element. */}
        <main className="flex-1 p-6">
          {loading ? (
            <p className="text-muted-foreground">Loading modules...</p>
          ) : (
            <Routes>
              {availableModules.map((m) => (
                <Route
                  key={m.id}
                  path={`${m.path}/*`}
                  element={<FederationMFE module={m} />}
                />
              ))}
              <Route
                path="*"
                element={
                  availableModules.length > 0 ? (
                    <Navigate to={availableModules[0].path} replace />
                  ) : (
                    <p className="text-muted-foreground">No modules available. Check that at least one MFE is running.</p>
                  )
                }
              />
            </Routes>
          )}
        </main>
      </div>
    </SidebarInset>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppSidebar />
        <AppLayout />
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}
