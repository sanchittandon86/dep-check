import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/theme-toggle';
import { useAuthStore, useNotificationStore, useUnreadNotificationCount } from '@/store';
import { Menu, User, LogOut, Bell, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/store';

function formatRelativeTime(timestamp: number): string {
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day > 1 ? 's' : ''} ago`;
}


function NotificationItemRow({ item }: { item: NotificationItem }) {
  const borderClass =
    item.type === 'error'
      ? 'border-l-destructive'
      : item.type === 'warning'
        ? 'border-l-yellow-500'
        : item.type === 'success'
          ? 'border-l-green-500'
          : 'border-l-primary';
  return (
    <div
      className={cn(
        'border-l-2 pl-2 py-1.5 px-2 rounded-r text-left text-sm',
        borderClass
      )}
    >
      <div className="font-medium">{item.title}</div>
      <div className="text-muted-foreground text-xs line-clamp-2">{item.message}</div>
      <div className="text-muted-foreground text-xs mt-0.5">{formatRelativeTime(item.timestamp)}</div>
    </div>
  );
}


const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const user = useAuthStore((state) => state.user);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useUnreadNotificationCount();
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return (
    <header className="bg-background border-b h-14 flex items-center justify-between px-4 md:px-6 fixed top-0 left-0 right-0 z-50">
      {/* Left - Hamburger (same style as M logo) + Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle menu"
          className="h-8 w-8 shrink-0 rounded border bg-background"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border rounded flex items-center justify-center shrink-0 bg-background">
            <span className="font-bold text-sm">M</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-medium">بنك مسقط</span>
            <span className="text-xs text-muted-foreground">Bank Muscat</span>
          </div>
        </div>
      </div>

      {/* Right - Theme toggle + Account button */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu
          onOpenChange={(open) => {
            if (open) markAllAsRead();
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Notifications"
              className="h-8 w-8 shrink-0 rounded border bg-background relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    markAllAsRead();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className="flex flex-col items-stretch p-0 cursor-default focus:bg-accent"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <NotificationItemRow item={item} />
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Account menu"
              className="h-8 w-8 shrink-0 rounded border bg-background"
            >
              <span className="font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Account Info
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => useAuthStore.getState().logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
