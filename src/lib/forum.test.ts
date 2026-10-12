import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { accountsEnabled, forumEnabled } from './flags';
import { categoryForErrorTags, forumCategories, safeNextPath, slugifyTitle } from './forum-categories';
import { countLinks, forumHtml, safeHref } from './forum-sanitize';
import {
  NEW_ACCOUNT_QUIET_MS,
  canEdit,
  canPost,
  canReply,
  canSolve,
  canVote,
  honeypotTripped,
  mergeRole,
  newAccountQuotaExceeded,
  newUserLinkLimited,
  roleFromEnv,
  validateComposer,
  type ForumActor,
} from './forum-perms';

const slugs = forumCategories.map((c) => c.slug);

function actor(partial: Partial<ForumActor> = {}): ForumActor {
  return {
    id: 'usr_a',
    email: 'a@example.com',
    role: 'user',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    ...partial,
  };
}

describe('forum flags', () => {
  it('does not enable the forum without accounts', () => {
    const prevA = process.env.ACCOUNTS_ENABLED;
    const prevF = process.env.FORUM_ENABLED;
    process.env.FORUM_ENABLED = '1';
    delete process.env.ACCOUNTS_ENABLED;
    assert.equal(accountsEnabled(), false);
    assert.equal(forumEnabled(), false);
    if (prevA === undefined) delete process.env.ACCOUNTS_ENABLED;
    else process.env.ACCOUNTS_ENABLED = prevA;
    if (prevF === undefined) delete process.env.FORUM_ENABLED;
    else process.env.FORUM_ENABLED = prevF;
  });
});

describe('forum sanitization', () => {
  it('keeps markdown and fenced code, escapes raw HTML', () => {
    const html = forumHtml('Hello **world** and `code`.\n\n```js\n<script>alert(1)</script>\n```\n');
    assert.match(html, /<strong>world<\/strong>/);
    assert.match(html, /<code>code<\/code>/);
    assert.match(html, /<pre><code class="language-js">/);
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>/);
  });

  it('drops javascript hrefs and unknown tags', () => {
    const html = forumHtml('See [xss](javascript:alert(1)) and <img src=x onerror=alert(1)>');
    assert.doesNotMatch(html, /javascript:/i);
    assert.doesNotMatch(html, /<img/i);
    assert.match(html, /xss/);
  });

  it('allows http(s) and site-relative links only', () => {
    assert.equal(safeHref('https://rocm.docs.amd.com/en/latest/'), 'https://rocm.docs.amd.com/en/latest/');
    assert.equal(safeHref('/forum/rules'), '/forum/rules');
    assert.equal(safeHref('javascript:alert(1)'), null);
    assert.equal(safeHref('data:text/html,hi'), null);
    assert.equal(safeHref('//evil.example'), null);
  });

  it('counts markdown and raw links', () => {
    assert.equal(countLinks('no links here'), 0);
    assert.ok(countLinks('[a](https://example.com) and https://amdai.net/rocm') >= 2);
  });
});

describe('forum permissions', () => {
  it('maps ADMIN_EMAILS to admin and never demotes a stored admin', () => {
    assert.equal(roleFromEnv('will@example.com', 'will@example.com, other@x.com'), 'admin');
    assert.equal(roleFromEnv('mod@example.com', '', 'mod@example.com'), 'mod');
    assert.equal(mergeRole('admin', 'user'), 'admin');
    assert.equal(mergeRole('user', 'mod'), 'mod');
  });

  it('throttles brand-new accounts and locked threads', () => {
    const fresh = actor({ createdAt: Date.now() - 30_000 });
    assert.equal(canPost(fresh).ok, false);
    assert.equal(canPost(fresh).reason, 'new_account');
    assert.equal(canPost(actor()).ok, true);
    assert.equal(canReply(actor(), { locked: true, hidden: false }).ok, false);
    assert.equal(canReply(actor({ role: 'mod' }), { locked: true, hidden: false }).ok, true);
    assert.ok(Date.now() - NEW_ACCOUNT_QUIET_MS < Date.now());
  });

  it('lets the OP mark solved and only the author edit (unless mod)', () => {
    const op = actor({ id: 'usr_op' });
    const other = actor({ id: 'usr_b' });
    const mod = actor({ id: 'usr_m', role: 'mod' });
    assert.equal(canSolve(op, { authorId: 'usr_op' }), true);
    assert.equal(canSolve(other, { authorId: 'usr_op' }), false);
    assert.equal(canSolve(mod, { authorId: 'usr_op' }), true);
    assert.equal(canEdit(op, { authorId: 'usr_op', hidden: false }, { locked: false }), true);
    assert.equal(canEdit(other, { authorId: 'usr_op', hidden: false }, { locked: false }), false);
    assert.equal(canEdit(op, { authorId: 'usr_op', hidden: false }, { locked: true }), false);
    assert.equal(canEdit(mod, { authorId: 'usr_op', hidden: false }, { locked: true }), true);
  });

  it('blocks self-upvotes and trips the honeypot', () => {
    const me = actor();
    assert.equal(canVote(me, { authorId: 'usr_a' }), false);
    assert.equal(canVote(me, { authorId: 'usr_b' }), true);
    assert.equal(honeypotTripped('https://spam.example'), true);
    assert.equal(honeypotTripped(''), false);
    assert.equal(honeypotTripped('   '), false);
  });

  it('enforces new-user link cap and first-day quotas', () => {
    const baby = actor({ createdAt: Date.now() - 60 * 60 * 1000 });
    assert.equal(newUserLinkLimited(baby, 3), true);
    assert.equal(newUserLinkLimited(baby, 2), false);
    const old = actor({ createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000 });
    assert.equal(newUserLinkLimited(old, 8), false);
    assert.equal(newAccountQuotaExceeded(baby, { threads: 3, replies: 0 }, 'thread'), true);
    assert.equal(newAccountQuotaExceeded(baby, { threads: 2, replies: 0 }, 'thread'), false);
    assert.equal(newAccountQuotaExceeded(old, { threads: 99, replies: 99 }, 'thread'), false);
  });

  it('validates composer fields', () => {
    const bad = validateComposer({ title: 'Hi', body: 'short', category: 'llamacpp', categories: slugs });
    assert.equal(bad.ok, false);
    const ok = validateComposer({
      title: 'hipErrorNoBinaryForGpu on gfx1201',
      body: 'Built llama.cpp HIP without AMDGPU_TARGETS=gfx1201.',
      category: 'llamacpp',
      categories: slugs,
    });
    assert.equal(ok.ok, true);
  });

  it('rejects open-redirect next paths and maps error tags', () => {
    assert.equal(safeNextPath('/forum/new'), '/forum/new');
    assert.equal(safeNextPath('https://evil.example'), null);
    assert.equal(safeNextPath('//evil.example'), null);
    assert.equal(categoryForErrorTags(['ollama', 'gfx1201']), 'ollama-lm-studio');
    assert.equal(categoryForErrorTags(['hip', 'compile']), 'llamacpp');
    assert.equal(slugifyTitle('hipErrorNoBinaryForGpu!!!'), 'hiperrornobinaryforgpu');
  });
});
