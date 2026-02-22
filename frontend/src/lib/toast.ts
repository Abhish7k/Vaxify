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
};
