/** Build-time feature flags. Off = static SSG, no database. */

export function flagOn(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

export function accountsEnabled(): boolean {
  return flagOn(process.env.ACCOUNTS_ENABLED);
}

export function forumEnabled(): boolean {
  return flagOn(process.env.FORUM_ENABLED);
}
