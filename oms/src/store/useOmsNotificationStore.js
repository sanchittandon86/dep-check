import { create } from 'zustand';

const MAX_NOTIFICATIONS = 50;

function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useOmsNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (detail) =>
    set((state) => {
      const item = {
        ...detail,
        id: generateId(),
        read: false,
      };
      const next = [item, ...state.notifications].slice(0, MAX_NOTIFICATIONS);
      return { notifications: next };
    }),
}));