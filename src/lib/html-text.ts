/**
 * Site-wide sentence separators. Astro compressHTML and component boundaries
 * used to glue “wheels.HIP” and “[2]Vulkan”. These helpers insert real text
 * nodes between blocks / citations and fail the build if glue remains.
 */

const PROTECT = /<(pre|script|style|textarea)\b[^>]*>[\s\S]*?<\/\1>/gi;
const BLOCK_CLOSE =
  /<\/(p|h[1-6]|li|ul|ol|dl|dt|dd|div|section|article|aside|blockquote|table|thead|tbody|tfoot|tr|figure|header|footer|nav|main|form|details|summary)>/gi;

export const GLUE_PERIOD = /([a-z]|\])\.[A-Z]/g;
export const GLUE_BRACKET = /\][A-Za-z]/g;

export function insertBlockSeparators(html: string): string {
  const stash: string[] = [];
  let out = html.replace(PROTECT, (chunk) => {
    stash.push(chunk);
    return `\u0000P${stash.length - 1}\u0000`;
  });

  out = out.replace(/<\/sup>(?=[A-Za-z<])/g, '</sup> ');
  out = out.replace(/([a-z)\]"'])\.(<)/g, '$1. $2');
  out = out.replace(/\](?=[A-Za-z])/g, '] ');
  out = out.replace(BLOCK_CLOSE, (tag) => `${tag}\n`);

  return out.replace(/\u0000P(\d+)\u0000/g, (_, i) => stash[Number(i)] ?? '');
}

export function htmlToVisibleText(html: string): string {
  let text = html;
  text = text.replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  text = text.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  return text;
}

export type GlueHit = { index: number; match: string; snippet: string };

export function gluedSentenceHits(text: string): GlueHit[] {
  const hits: GlueHit[] = [];
  for (const re of [new RegExp(GLUE_PERIOD.source, 'g'), new RegExp(GLUE_BRACKET.source, 'g')]) {
    let match: RegExpExecArray | null;
    while ((match = re.exec(text))) {
      const start = Math.max(0, match.index - 28);
      hits.push({
        index: match.index,
        match: match[0],
        snippet: text.slice(start, match.index + 32).replace(/\s+/g, ' ').trim(),
      });
    }
  }
  return hits;
}

export function assertHtmlTextSeparated(html: string, file = 'html'): string[] {
  const hits = gluedSentenceHits(htmlToVisibleText(html));
  return hits.map((hit) => `${file}:${hit.index} “${hit.match}” … ${hit.snippet}`);
}
