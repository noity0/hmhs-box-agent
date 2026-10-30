// Safe Storage Helper for sandboxed iframes
const memoryStorage = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      // In sandboxed iframes, localStorage may throw SecurityError
    }
    return memoryStorage.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      // In sandboxed iframes, localStorage may throw SecurityError
    }
    memoryStorage.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      // Ignore
    }
    memoryStorage.delete(key);
  },
};
