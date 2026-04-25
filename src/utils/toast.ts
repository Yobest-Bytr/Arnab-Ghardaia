import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message);
};

/**
 * Robust error handler that ensures we never show "[object Object]"
 */
export const showError = (error: any) => {
  console.error("Error caught by showError:", error);
  
  let message = "An unexpected error occurred";

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null) {
    // Handle Supabase error objects or other plain objects
    message = error.message || error.error_description || error.msg || error.error || JSON.stringify(error);
    
    // If JSON.stringify returned "{}" or something unhelpful, use a fallback
    if (message === "{}" || message === "[]") {
      message = "Neural link error (check console for details)";
    }
  }

  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};
