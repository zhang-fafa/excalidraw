export type ToastType = "success" | "error" | "warning" | "info";

export type ToastOptions = {
  type?: ToastType;
  durationMs?: number | "infinite";
  closable?: boolean;
};

export type ShowToast = (message: string, options?: ToastOptions) => void;

let showToastImpl: ShowToast | null = null;

export const registerToast = (impl: ShowToast) => {
  showToastImpl = impl;
};

export const showToast = (message: string, options?: ToastOptions) => {
  if (showToastImpl) {
    showToastImpl(message, options);
  } else {
    console.warn("Toast not registered:", message, options);
  }
};

export const showSuccess = (
  message: string,
  options?: Omit<ToastOptions, "type">,
) => showToast(message, { ...options, type: "success" });
export const showError = (
  message: string,
  options?: Omit<ToastOptions, "type">,
) => showToast(message, { ...options, type: "error" });
export const showWarning = (
  message: string,
  options?: Omit<ToastOptions, "type">,
) => showToast(message, { ...options, type: "warning" });
export const showInfo = (
  message: string,
  options?: Omit<ToastOptions, "type">,
) => showToast(message, { ...options, type: "info" });
