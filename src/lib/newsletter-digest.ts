/**
 * Draft the AMDai Lab Notes digest from what actually changed.
 * Sending stays off unless NEWSLETTER_SEND=1 and the command passes --send.
 */

import { NEWSLETTER_CADENCE, NEWSLETTER_NAME, NEWSLETTER_SEND_FLAG, type NewsletterTopicId } from './newsletter';

/** Same line as the site footer / disclosure page. Do not invent a different disclosure. */
export const DIGEST_AFFILIATE_LINE = 'As an Amazon Associate I earn from qualifying purchases.';

export const NEWSLETTER_PREVIEW_DIR = 'artifacts/newsletter';
export const NEWSLETTER_PREVIEW_HTML = `${NEWSLETTER_PREVIEW_DIR}/preview.html`;
export const NEWSLETTER_PREVIEW_TEXT = `${NEWSLETTER_PREVIEW_DIR}/preview.txt`;
export const NEWSLETTER_LAST_ISSUE = `${NEWSLETTER_PREVIEW_DIR}/last-issue.json`;

export type DigestSourceItem = {
  topic: NewsletterTopicId;
  title: string;
  href: string;
  date: string;
  summary: string;
};

export type DigestIssue = {
  name: string;
  since: string;
  until: string;
  items: DigestSourceItem[];
  html: string;
  text: string;
  hasAffiliateLinks: boolean;
  empty: boolean;
};

const RETAILER = /amazon\.|amzn\.to|bhphotovideo|rakuten|newegg/i;
const Q4 = `q${'4'}`;
const BANNED = new RegExp(`Qwen2\\.5|Qwen3-8B|floor is ${Q4}|${Q4} floor|${Q4} and up only`, 'i');

export function newsletterSendAllowed(env: NodeJS.ProcessEnv = process.env, argv: string[] = process.argv): {
  allowed: boolean;
  reason: string;
} {
  const flagged = argv.includes('--send');
  const switchOn = env[NEWSLETTER_SEND_FLAG] === '1' || env[NEWSLETTER_SEND_FLAG] === 'true';
  if (!flagged) return { allowed: false, reason: 'Pass --send to mail a built digest.' };
  if (!switchOn) return { allowed: false, reason: `${NEWSLETTER_SEND_FLAG} is off. Sending stays disabled.` };
  return { allowed: true, reason: 'send' };
}

export function hasAffiliateHref(href: string): boolean {
  return RETAILER.test(href);
}

export function dayKey(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const raw = value instanceof Date ? value.toISOString() : String(value);
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

export function afterSince(date: string | Date | null | undefined, since: string): boolean {
  const day = dayKey(date);
  if (!day) return false;
  return day > since;
}

export function assertDigestSafe(blob: string): string[] {
  const errors: string[] = [];
  if (BANNED.test(blob)) errors.push('banned model or Q4-floor phrase');
  if (/\b(?:IQ[12]_[A-Z0-9]+|Q[12]_[A-Z0-9]+)\b/.test(blob)) errors.push('Q1/Q2 listed');
  if (/<img\b/i.test(blob)) errors.push('tracking or image pixel');
  return errors;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildDigest(input: {
  since: string;
  until: string;
  items: DigestSourceItem[];
  unsubUrl?: string;
}): DigestIssue {
  const items = input.items
    .filter((item) => afterSince(item.date, input.since) && dayKey(item.date) && dayKey(item.date)! <= input.until)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  const hasAffiliateLinks = items.some((item) => hasAffiliateHref(item.href));
  const disclosure = hasAffiliateLinks ? DIGEST_AFFILIATE_LINE : '';
  const lines = [
    NEWSLETTER_NAME,
    `${input.since} → ${input.until}`,
    NEWSLETTER_CADENCE,
    '',
  ];
  if (!items.length) {
    lines.push('Nothing cited changed in this window. No invented tok/s.');
  } else {
    for (const item of items) {
      lines.push(`${item.title} (${item.date})`);
      lines.push(item.summary);
      lines.push(item.href);
      lines.push('');
    }
  }
  if (disclosure) {
    lines.push(disclosure);
    lines.push('');
  }
  lines.push('No tracking pixel. One-click unsubscribe does not need an account.');
  if (input.unsubUrl) lines.push(`Unsubscribe: ${input.unsubUrl}`);
  const text = `${lines.join('\n').trim()}\n`;

  const groups = NEWSLETTER_NAME;
  const sections = (['runs', 'guides', 'problems', 'stack-lab'] as const)
    .map((topic) => {
      const rows = items.filter((item) => item.topic === topic);
      if (!rows.length) return '';
      const lis = rows
        .map(
          (item) =>
            `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a> <span>(${escapeHtml(item.date)})</span><p>${escapeHtml(item.summary)}</p></li>`,
        )
        .join('');
      return `<h2>${escapeHtml(topic)}</h2><ul>${lis}</ul>`;
    })
    .join('');
  const html = [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>',
    escapeHtml(groups),
    '</title></head><body>',
    `<h1>${escapeHtml(NEWSLETTER_NAME)}</h1>`,
    `<p>${escapeHtml(input.since)} → ${escapeHtml(input.until)}</p>`,
    `<p>${escapeHtml(NEWSLETTER_CADENCE)}</p>`,
    sections || '<p>Nothing cited changed in this window. No invented tok/s.</p>',
    disclosure ? `<p>${escapeHtml(disclosure)}</p>` : '',
    '<p>No tracking pixel. One-click unsubscribe does not need an account.</p>',
    input.unsubUrl ? `<p><a href="${escapeHtml(input.unsubUrl)}">Unsubscribe</a></p>` : '',
    '</body></html>',
  ].join('');

  const issue: DigestIssue = {
    name: NEWSLETTER_NAME,
    since: input.since,
    until: input.until,
    items,
    html,
    text,
    hasAffiliateLinks,
    empty: items.length === 0,
  };
  const unsafe = assertDigestSafe(`${issue.html}\n${issue.text}`);
  if (unsafe.length) throw new Error(`digest unsafe: ${unsafe.join('; ')}`);
  return issue;
}
