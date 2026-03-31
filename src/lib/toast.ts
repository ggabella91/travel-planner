import { Toast } from "@base-ui/react/toast";

export const toastManager = Toast.createToastManager();

export const toast = {
  success: (title: string) => toastManager.add({ title, type: "success", timeout: 3000 }),
  error: (title: string) => toastManager.add({ title, type: "error", timeout: 4000, priority: "high" }),
};
