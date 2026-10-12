import type { APIContext } from 'astro';
import { checkCsrf } from './csrf';
import { listRigs } from './rigs';
import type { RigSnapshot } from '../lib/forum-types';

export async function readForumBody(request: Request): Promise<{ fields: Record<string, string>; csrf: string | null }> {
  const ctype = request.headers.get('content-type') || '';
  if (ctype.includes('application/json')) {
    const json = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(json)) {
      if (value != null) fields[key] = String(value);
    }
    return { fields, csrf: null };
  }
  const form = await request.formData();
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') fields[key] = value;
  }
  return { fields, csrf: fields._csrf || null };
}

export function csrfOk(request: Request, cookies: APIContext['cookies'], bodyToken: string | null): boolean {
  return checkCsrf(request, cookies, bodyToken);
}

export function failRedirect(url: URL, reason: string, fallback: string): string {
  const next = new URL(fallback, url.origin);
  next.searchParams.set('error', reason);
  return next.pathname + next.search;
}

export async function rigSnapshotForUser(userId: string, rigId: string | undefined): Promise<RigSnapshot | null> {
  if (!rigId) return null;
  const rows = await listRigs(userId);
  const rig = rows.find((row) => row.id === rigId);
  if (!rig) return null;
  return {
    name: rig.name,
    gpu: rig.gpu,
    gfx: rig.gfx,
    rocmVersion: rig.rocm_version,
    backend: rig.backend,
    backendVersion: rig.backend_version,
    os: rig.os,
    distro: rig.distro,
  };
}
