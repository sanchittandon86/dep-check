import { create } from 'zustand'

interface User {
  name: string
  email: string
}

interface AuthState {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { name: 'Avinash', email: 'avinash@bankmuscat.com' }, // Default mock user
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}))

interface ThemeState {
  color: string
  setColor: (color: string) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  color: 'black', // Default theme
  setColor: (color) => set({ color }),
}))


export {
  useNotificationStore,
  useUnreadNotificationCount,
  type NotificationItem,
  type MfeNotificationDetail,
} from './notificationStore'