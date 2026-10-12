import { accountsEnabled } from '../lib/flags';
import { stackUpdates } from '../lib/stack-updates';
import { updatesForRig } from '../lib/rig-match';

async function main() {
  if (!accountsEnabled()) {
    console.error('ACCOUNTS_ENABLED is off. Notify does not run on the static build.');
    process.exit(1);
  }
  const digest = process.argv.includes('--digest') || process.argv.includes('--weekly');
  const { sqlAll, sqlGet, sqlRun } = await import('../server/db/client');
  const { listRigs, toMatch } = await import('../server/rigs');
  const { sendMail, unsubscribeUrl } = await import('../server/mail');
  const { newId } = await import('../server/crypto');
  type User = { id: string; email: string; notify_instant: number; notify_weekly: number; unsub_token: string };
  const allUsers = sqlAll<User>('SELECT id, email, notify_instant, notify_weekly, unsub_token FROM users');
  const catalog = stackUpdates().filter((u) => !u.todo);
  let sent = 0;
  for (const user of allUsers) {
    if (digest && !user.notify_weekly) continue;
    if (!digest && !user.notify_instant) continue;
    const rigs = await listRigs(user.id);
    const lines: string[] = [];
    for (const rig of rigs) {
      for (const update of updatesForRig(toMatch(rig), catalog)) {
        const already = sqlGet('SELECT id FROM notification_log WHERE user_id = ? AND update_id = ?', [user.id, update.id]);
        if (already && !digest) continue;
        lines.push(`${rig.name}: ${update.summary}\n${update.source_url}`);
        if (!already) {
          sqlRun('INSERT INTO notification_log (id, user_id, update_id, channel, sent_at) VALUES (?, ?, ?, ?, ?)', [
            newId('nlog'),
            user.id,
            update.id,
            digest ? 'weekly' : 'instant',
            Date.now(),
          ]);
        }
      }
    }
    if (!lines.length) continue;
    await sendMail(
      user.email,
      digest ? 'Weekly stack updates for your rigs' : 'Stack update for your rig',
      `${lines.join('\n\n')}\n\nUnsubscribe: ${unsubscribeUrl(user.unsub_token)}\n`,
    );
    sent += 1;
  }
  console.log(`notify: mailed ${sent} user(s) (${digest ? 'weekly' : 'instant'})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
