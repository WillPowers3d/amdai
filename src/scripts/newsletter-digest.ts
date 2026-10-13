/**
 * Draft the AMDai Lab Notes digest from cited changes since the last issue.
 * Sending is off unless NEWSLETTER_SEND=1 and you pass --send.
 *
 *   npx tsx src/scripts/newsletter-digest.ts
 *   NEWSLETTER_SEND=1 npx tsx src/scripts/newsletter-digest.ts --send
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { collectDigestItems } from '../lib/newsletter-collect';
import {
  NEWSLETTER_LAST_ISSUE,
  NEWSLETTER_PREVIEW_HTML,
  NEWSLETTER_PREVIEW_TEXT,
  buildDigest,
  dayKey,
  newsletterSendAllowed,
} from '../lib/newsletter-digest';
import { NEWSLETTER_NAME } from '../lib/newsletter';

function previewDirs(): string[] {
  return ['/opt/cursor/artifacts/newsletter', join(process.cwd(), 'artifacts/newsletter')];
}

function lastSince(until: string): string {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), NEWSLETTER_LAST_ISSUE), 'utf8')) as { until?: string };
    return dayKey(raw.until) ?? until;
  } catch {
    const d = new Date(`${until}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7);
    return d.toISOString().slice(0, 10);
  }
}

function writePreviews(html: string, text: string): string[] {
  const written: string[] = [];
  for (const dir of previewDirs()) {
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'preview.html'), html.endsWith('\n') ? html : `${html}\n`);
      writeFileSync(join(dir, 'preview.txt'), text.endsWith('\n') ? text : `${text}\n`);
      written.push(join(dir, 'preview.html'));
    } catch {
      /* optional */
    }
  }
  return written;
}

async function main() {
  const until = dayKey(new Date()) ?? new Date().toISOString().slice(0, 10);
  const since = lastSince(until);
  const issue = buildDigest({
    since,
    until,
    items: collectDigestItems(),
  });
  const written = writePreviews(issue.html, issue.text);
  console.log(`digest: ${issue.items.length} item(s) ${since} → ${until}`);
  console.log(`digest: preview ${NEWSLETTER_PREVIEW_HTML} and ${NEWSLETTER_PREVIEW_TEXT}`);
  for (const path of written) console.log(`digest: wrote ${path}`);

  const gate = newsletterSendAllowed();
  if (!gate.allowed) {
    console.log(`digest: not mailed — ${gate.reason}`);
    return;
  }
  const { newsletterEnabled } = await import('../lib/flags');
  if (!newsletterEnabled()) {
    console.error('digest: NEWSLETTER_ENABLED / ACCOUNTS_ENABLED is off. No store to send from.');
    process.exit(1);
  }
  const { getNewsletterStore } = await import('../server/newsletter-store');
  const { sendMail, unsubscribeUrl } = await import('../server/mail');
  const store = getNewsletterStore();
  let sent = 0;
  for (const sub of store.listConfirmed()) {
    if (!sub.topics.length) continue;
    const filtered = issue.items.filter((item) => sub.topics.includes(item.topic));
    if (!filtered.length) continue;
    const personalized = buildDigest({
      since,
      until,
      items: filtered,
      unsubUrl: unsubscribeUrl(sub.unsubToken),
    });
    await sendMail(sub.email, `${NEWSLETTER_NAME} · ${until}`, personalized.text, {
      html: personalized.html,
      unsubUrl: unsubscribeUrl(sub.unsubToken),
    });
    sent += 1;
  }
  const lastPath = join(process.cwd(), NEWSLETTER_LAST_ISSUE);
  mkdirSync(dirname(lastPath), { recursive: true });
  writeFileSync(
    lastPath,
    `${JSON.stringify({ name: NEWSLETTER_NAME, since, until, count: issue.items.length, sent: true, mailed: sent }, null, 2)}\n`,
  );
  console.log(`digest: mailed ${sent} confirmed subscriber(s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
