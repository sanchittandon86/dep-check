import { useEffect } from "react";
import { toast } from "sonner";
import { useNotificationStore } from "@/store";

export function useMfeNotifications() {
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const detail = e.detail as { source?: string; type: string; title: string; message: string; timestamp?: number };
      useNotificationStore.getState().addNotification({
        source: detail.source ?? "mfe",
        type: detail.type ?? "info",
        title: detail.title ?? "",
        message: detail.message ?? "",
        timestamp: detail.timestamp ?? Date.now(),
      });

      const { type, title, message } = detail;

      switch (type) {
        case "success":
          toast.success(title, { description: message });
          break;
        case "error":
          toast.error(title, { description: message });
          break;
        case "warning":
          toast.warning(title, { description: message });
          break;
        default:
          toast.info(title, { description: message });
      }
    };

    window.addEventListener("mfe:notification", handler as EventListener);
    return () => {
      window.removeEventListener("mfe:notification", handler as EventListener);
    };
  }, []);
}