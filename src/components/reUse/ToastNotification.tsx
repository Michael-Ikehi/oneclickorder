'use client';

import { Toaster, toast } from "react-hot-toast";

const ToastNotification: React.FC = () => {
  return <Toaster position="top-center" reverseOrder={false} />;
};

type ToastType = "success" | "error";

export const showToast = (message: string, type: ToastType = "success", duration: number = 5000) => {
  if (type === "success") {
    toast.success(message, { duration });
  } else if (type === "error") {
    toast.error(message, { duration });
  }
};

export default ToastNotification;
