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

/** Newsletter APIs + file store. On with its own flag, or when accounts (same mailer) are on. */
export function newsletterEnabled(): boolean {
  return flagOn(process.env.NEWSLETTER_ENABLED) || accountsEnabled();
}

/** Actual digest mailing. Off unless NEWSLETTER_SEND=1 and the command passes --send. */
export function newsletterSendEnabled(): boolean {
  return flagOn(process.env.NEWSLETTER_SEND);
}
