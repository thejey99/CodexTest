const SAVE_KEY = "emberfall-save";

export const saveGame = <T>(state: T) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
};

export const loadGame = <T>() => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};
