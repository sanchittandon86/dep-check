import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import {
  LayoutDashboard,
  ClipboardList,
  Globe,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useModules } from '@/hooks/useModules';

const ICON_MAP: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  ClipboardList,
};

const AppSidebar = () => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { availableModules, loading } = useModules();

  return (
    <Sidebar collapsible="icon" className="flex h-full flex-col justify-between">
      <div className="flex flex-col flex-1 min-h-0">
        {/* User Greeting - "Hello! Avinash" */}
        <SidebarHeader className="shrink-0 border-b px-4 py-3 group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-semibold truncate">Hello! {user?.name || 'User'}</p>
        </SidebarHeader>

        {/* Navigation - dynamically from module.json (only available MFEs) */}
        <SidebarContent className="flex-1 min-h-0 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="px-2 gap-0.5">
                {loading ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-muted-foreground" disabled>
                      <span className="text-sm">Loading...</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : (
                  availableModules.map((item) => {
                    const IconComponent = ICON_MAP[item.icon] ?? LayoutDashboard;
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={cn(
                            'w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground',
                            'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-medium'
                          )}
                        >
                          <NavLink
                            to={item.path}
                            onClick={() => {
                              if (isMobile) setOpenMobile(false);
                            }}
                            className="flex items-center gap-2 text-inherit [&_svg]:text-inherit"
                          >
                            <IconComponent className="h-5 w-5 shrink-0" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>

      {/* Footer - Language & Logout (no extra line) */}
      <SidebarFooter className="shrink-0 border-t p-2">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Arabic"
              className="w-full justify-start bg-background border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Globe className="h-4 w-4" />
              <span>Arabic</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              className="w-full justify-start bg-background border text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => useAuthStore.getState().logout()}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
