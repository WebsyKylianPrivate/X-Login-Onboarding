// Hook pour gérer les toasts
import { useState } from "react";
import type { Toast } from "../types";

interface UseToastReturn {
  toast: Toast | null;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  closeToast: () => void;
}

export const useToast = (): UseToastReturn => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  return { toast, showToast, closeToast };
};

