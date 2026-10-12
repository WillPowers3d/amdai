const MAX_BODY = 20_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeHref(raw: string): string | null {
  const url = raw.trim();
  if (!url || url.length > 500) return null;
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.href;
  } catch {
    return null;
  }
  return null;
}

export function countLinks(markdown: string): number {
  const md = [...markdown.matchAll(/\[[^\]]*]\(([^)]+)\)/g)].filter((m) => safeHref(m[1]));
  const raw = [...markdown.matchAll(/https?:\/\/[^\s)]+/gi)];
  return md.length + raw.length;
}

function renderInline(escaped: string): string {
  let out = escaped;
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const safe = safeHref(href.replace(/&amp;/g, '&'));
    return safe ? `<a href="${escapeHtml(safe)}" rel="nofollow noopener">${text}</a>` : text;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^\*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return out;
}

function renderBlock(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('## ')) return `<h2>${renderInline(trimmed.slice(3))}</h2>`;
  if (trimmed.startsWith('### ')) return `<h3>${renderInline(trimmed.slice(4))}</h3>`;
  if (trimmed.startsWith('> ')) {
    const quote = trimmed
      .split('\n')
      .map((line) => line.replace(/^>\s?/, ''))
      .join(' ');
    return `<blockquote>${renderInline(quote)}</blockquote>`;
  }
  const lines = trimmed.split('\n');
  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    const items = lines.map((line) => `<li>${renderInline(line.replace(/^[-*]\s+/, ''))}</li>`).join('');
    return `<ul>${items}</ul>`;
  }
  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    const items = lines.map((line) => `<li>${renderInline(line.replace(/^\d+\.\s+/, ''))}</li>`).join('');
    return `<ol>${items}</ol>`;
  }
  return `<p>${renderInline(lines.join(' '))}</p>`;
}

/** Escape-first Markdown. User HTML never becomes tags. Code fences keep their contents escaped. */
export function renderForumMarkdown(input: string): string {
  const src = input.replace(/\r\n/g, '\n').slice(0, MAX_BODY);
  const fences: string[] = [];
  const withPlaceholders = src.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, body) => {
    const i = fences.length;
    const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
    fences.push(`<pre><code${cls}>${escapeHtml(body.replace(/\n$/, ''))}</code></pre>`);
    return `\n\n%%FENCE${i}%%\n\n`;
  });
  const escaped = escapeHtml(withPlaceholders);
  const html = escaped
    .split(/\n{2,}/)
    .map((block) => {
      const fence = block.trim().match(/^%%FENCE(\d+)%%$/);
      if (fence) return fences[Number(fence[1])] ?? '';
      return renderBlock(block);
    })
    .filter(Boolean)
    .join('\n');
  return html;
}

const ALLOWED = new Set(['p', 'br', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote']);

/** Defense in depth on already-rendered HTML. Strips unknown tags and bad hrefs. */
export function sanitizeForumHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (full, name: string, attrs = '') => {
    const tag = name.toLowerCase();
    const closing = full.startsWith('</');
    if (!ALLOWED.has(tag)) return '';
    if (closing) return `</${tag}>`;
    if (tag === 'a') {
      const href = /href="([^"]*)"/.exec(attrs)?.[1];
      const safe = href ? safeHref(href) : null;
      return safe ? `<a href="${escapeHtml(safe)}" rel="nofollow noopener">` : '<span>';
    }
    if (tag === 'code') {
      const cls = /class="(language-[a-zA-Z0-9_-]+)"/.exec(attrs)?.[1];
      return cls ? `<code class="${cls}">` : '<code>';
    }
    return `<${tag}>`;
  });
}

export function forumHtml(markdown: string): string {
  return sanitizeForumHtml(renderForumMarkdown(markdown));
}
