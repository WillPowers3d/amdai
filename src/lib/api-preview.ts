/**
 * Helpers for the /api endpoint preview panel.
 * Keep this file browser-safe: no fs, no Node APIs.
 */

export const API_PREVIEW_PATH = /^\/api\/v1\/[a-z0-9-]+\.json$/i;

export function apiEndpointStem(path: string): string | null {
  const clean = path.trim().split(/[?#]/)[0] ?? '';
  const match = clean.match(/^\/api\/v1\/([a-z0-9-]+)\.json$/i);
  return match?.[1] ?? null;
}

export function isSafeApiPreviewPath(path: string): boolean {
  return API_PREVIEW_PATH.test(path.trim().split(/[?#]/)[0] ?? '');
}

export function hashFromStem(stem: string): string {
  return `#${stem}`;
}

export function stemFromHash(hash: string): string {
  return hash.replace(/^#/, '').trim();
}

export function isPlainActivate(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}
