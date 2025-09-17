export type ShowToast = (message: string) => void;

let showToastImpl: ShowToast | null = null;

export const registerToast = (impl: ShowToast) => {
  showToastImpl = impl;
};

export const showToast = (message: string) => {
  if (showToastImpl) {
    showToastImpl(message);
  } else {
    // Fallback：开发期没有注册时，降级到 console
    console.warn("Toast not registered:", message);
  }
};

export const showError = (message: string) => showToast(message);
