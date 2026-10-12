/** Build-time feature flags. Off = static SSG, no database. */

export function flagOn(value: string | undefined): boolean {
  return value === '1' || value === 'true';
}

export function accountsEnabled(): boolean {
  return flagOn(process.env.ACCOUNTS_ENABLED);
}

export function forumRequested(): boolean {
  return flagOn(process.env.FORUM_ENABLED);
}

/** Forum needs accounts (same SQLite, same session). Off unless both flags are on. */
export function forumEnabled(): boolean {
  return forumRequested() && accountsEnabled();
}
