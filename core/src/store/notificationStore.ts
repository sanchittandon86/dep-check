import { create } from 'zustand';

const MAX_NOTIFICATIONS = 50;

export interface MfeNotificationDetail {
  source: string;
  type: string;
  title: string;
  message: string;
  timestamp: number;
}

export interface NotificationItem extends MfeNotificationDetail {
  id: string;
  read: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  addNotification: (detail: MfeNotificationDetail) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (detail) =>
    set((state) => {
      const item: NotificationItem = {
        ...detail,
        id: generateId(),
        read: false,
      };
      const next = [item, ...state.notifications].slice(0, MAX_NOTIFICATIONS);
      return { notifications: next };
    }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearAll: () => set({ notifications: [] }),
}));

export function useUnreadNotificationCount(): number {
  return useNotificationStore((state) =>
    state.notifications.filter((n) => !n.read).length
  );
}