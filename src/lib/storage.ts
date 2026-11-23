/** localStorage wrappers that never throw (private mode, quota, disabled storage, bad JSON). */

export function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const STORAGE_KEYS = {
  session: "typeset:session:v1",
  saved: "typeset:saved:v1",
  catalog: "typeset:catalog:v1",
} as const;
