/**
 * Tiny JSON highlighter for the public API preview panel.
 * No highlighter dependency. Theme colors live in CSS (.json-*).
 */

export type JsonTokenKind = 'key' | 'string' | 'number' | 'keyword' | 'punct' | 'space';

export type JsonToken = {
  kind: JsonTokenKind;
  text: string;
};

const KEYWORD = /^(true|false|null)/;
const NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readString(source: string, start: number): { text: string; end: number } | null {
  if (source[start] !== '"') return null;
  let i = start + 1;
  while (i < source.length) {
    const ch = source[i]!;
    if (ch === '\\') {
      i += 2;
      continue;
    }
    if (ch === '"') return { text: source.slice(start, i + 1), end: i + 1 };
    i += 1;
  }
  return { text: source.slice(start), end: source.length };
}

export function tokenizeJson(source: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i]!;
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      const start = i;
      i += 1;
      while (i < source.length && /[ \t\n\r]/.test(source[i]!)) i += 1;
      tokens.push({ kind: 'space', text: source.slice(start, i) });
      continue;
    }
    if ('{}[]:,'.includes(ch)) {
      tokens.push({ kind: 'punct', text: ch });
      i += 1;
      continue;
    }
    if (ch === '"') {
      const str = readString(source, i);
      if (!str) break;
      tokens.push({ kind: 'string', text: str.text });
      i = str.end;
      continue;
    }
    const slice = source.slice(i);
    const keyword = slice.match(KEYWORD);
    if (keyword && (i + keyword[0].length === source.length || /[\s,\]}]/.test(source[i + keyword[0].length] ?? ''))) {
      tokens.push({ kind: 'keyword', text: keyword[0] });
      i += keyword[0].length;
      continue;
    }
    const number = slice.match(NUMBER);
    if (number) {
      tokens.push({ kind: 'number', text: number[0] });
      i += number[0].length;
      continue;
    }
    tokens.push({ kind: 'punct', text: ch });
    i += 1;
  }

  for (let t = 0; t < tokens.length; t += 1) {
    const token = tokens[t]!;
    if (token.kind !== 'string') continue;
    let look = t + 1;
    while (look < tokens.length && tokens[look]!.kind === 'space') look += 1;
    if (tokens[look]?.kind === 'punct' && tokens[look]?.text === ':') {
      token.kind = 'key';
    }
  }
  return tokens;
}

export function highlightJson(source: string): string {
  return tokenizeJson(source)
    .map((token) => {
      if (token.kind === 'space') return escapeHtml(token.text);
      return `<span class="json-${token.kind}">${escapeHtml(token.text)}</span>`;
    })
    .join('');
}

export function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function highlightPrettyJson(value: unknown): string {
  return highlightJson(prettyJson(value));
}
