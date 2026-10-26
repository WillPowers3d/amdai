/**
 * Scrubbed-token denylist. Tokens are assembled from parts so the literals
 * never appear in the repository (including after a history rewrite).
 */

const HOST = ['wt', 'pai', '1'].join('');
const GIVEN = ['wil', 'liam'].join('');
const HANDLE = ['will', 'powers'].join('');

export const PII_TEXT = new RegExp(`${HOST}|${GIVEN}|${HANDLE}`, 'i');
export const PII_HOST = new RegExp(HOST, 'i');
