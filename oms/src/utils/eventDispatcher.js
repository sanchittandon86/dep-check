import { useOmsNotificationStore } from '../store/useOmsNotificationStore';

export function dispatchNotification({ type = 'success', title, message }) {
  const detail = { source: 'oms', type, title, message, timestamp: Date.now() };
  const event = new CustomEvent('mfe:notification', { detail });

  window.dispatchEvent(event);
  useOmsNotificationStore.getState().addNotification(detail);
}
