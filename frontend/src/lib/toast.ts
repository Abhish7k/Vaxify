import { toast } from "sonner";

export const toastUtils = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        backgroundColor: "#e7f9ed",
        color: "#0f7a28",
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        backgroundColor: "#ffe5e5",
        color: "#b00000",
      },
    });
  },
  warning: (message: string) => {
    toast.warning(message, {
      style: {
        backgroundColor: "#fffbeb",
        color: "#92400e",
      },
    });
  },
  info: (message: string) => {
    toast.info(message, {
      style: {
        backgroundColor: "#eff6ff",
        color: "#1e40af",
      },
    });
  },
};
