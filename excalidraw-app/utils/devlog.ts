export const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
};

export const devWarn = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

export const devError = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export const devOnce = (() => {
  const seen = new Set<string>();
  return (key: string, ...args: unknown[]) => {
    if (!seen.has(key)) {
      seen.add(key);
      devLog(...args);
    }
  };
})();
