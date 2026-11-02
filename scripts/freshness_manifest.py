"""Honest per-page 'modified' dates from rendered content.
Hash only the page's <main> (minus the 'Last updated' line and dated price stamps' volatile
query params), compare with the committed manifest, and bump `modified` only when the hash changes.
Usage: python3 freshness_manifest.py <dist_dir_or_'live'> manifest.json [--today YYYY-MM-DD] [--check]
       python3 freshness_manifest.py --selftest
Output: manifest.json {path: {hash, modified}}; feed `modified` to setDate()/lastmodFor().
Paths are stored without a trailing slash (except /) so they match seo.ts setDate() keys."""
import hashlib, json, os, re, sys, datetime, urllib.request
def norm_path(p):
    if not p.startswith('/'): p = '/' + p
    if p != '/' and p.endswith('/'): p = p[:-1]
    return p or '/'
def main_text(html):
    m = re.search(r'<main\b.*?</main>', html, re.S)
    h = m.group(0) if m else html
    h = re.sub(r'<script.*?</script>|<style.*?</style>', '', h, flags=re.S)
    h = re.sub(r'Last updated\s*(?:<[^>]+>\s*)*\d{4}-\d{2}-\d{2}', '', h)      # the date line itself
    h = re.sub(r'(href="[^"?]+)\?[^"]*"', r'\1"', h)                            # src= tracking params
    h = re.sub(r'\s(?:class|style|data-[\w-]+|astro-[\w-]+)="[^"]*"', '', h)     # cosmetic attrs
    h = re.sub(r'\s+', ' ', h)
    return h.strip()
def digest(html): return hashlib.sha256(main_text(html).encode()).hexdigest()[:16]
def update(pages, manifest, today):
    out, changed = {}, []
    for path, html in pages.items():
        d = digest(html); old = manifest.get(path) or manifest.get(path + '/') or manifest.get(norm_path(path))
        if old and old['hash'] == d: out[path] = old
        else: out[path] = {'hash': d, 'modified': today}; changed.append(path)
    return out, changed
def load_live(sitemap='raw/sitemap-0.xml', prefixes=('/can-run/', '/compare/')):
    s = open(sitemap).read(); pages = {}
    for u in re.findall(r'<loc>(.*?)</loc>', s):
        p = norm_path(u.replace('https://amdai.net', ''))
        if any(p == pref.rstrip('/') or p.startswith(pref) for pref in prefixes):
            r = urllib.request.Request(u, headers={'User-Agent': 'amdai-freshness'})
            pages[p] = urllib.request.urlopen(r, timeout=30).read().decode('utf-8', 'replace')
    return pages
def load_dist(d):
    pages = {}
    for root, _, files in os.walk(d):
        if 'index.html' in files:
            p = '/' + os.path.relpath(root, d).strip('.') + '/'
            p = norm_path(p.replace('//', '/'))
            pages[p] = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
    return pages
def selftest():
    a = '<main><p>Last updated 2026-10-14</p><a href="/go/newegg/r9700?src=x" class="b">Buy</a></main>'
    b = a.replace('2026-10-14', '2026-10-31').replace('src=x', 'src=y').replace('class="b"', 'class="c"')
    c = a.replace('Buy', 'Buy 96 GB kit')
    assert digest(a) == digest(b), 'date line / tracking / class must not count'
    assert digest(a) != digest(c), 'real content change must count'
    m, ch = update({'/p': a}, {}, '2026-10-14'); assert ch == ['/p']
    m2, ch2 = update({'/p': b}, m, '2026-10-31'); assert ch2 == [] and m2['/p']['modified'] == '2026-10-14'
    m3, ch3 = update({'/p': c}, m2, '2026-10-31'); assert ch3 == ['/p'] and m3['/p']['modified'] == '2026-10-31'
    print('selftest ok 5/5')
if __name__ == '__main__':
    if '--selftest' in sys.argv: selftest(); sys.exit()
    src, mf = sys.argv[1], sys.argv[2]
    today = sys.argv[sys.argv.index('--today')+1] if '--today' in sys.argv else datetime.date.today().isoformat()
    check = '--check' in sys.argv
    pages = load_live() if src == 'live' else load_dist(src)
    man = json.load(open(mf)) if os.path.exists(mf) else {}
    out, changed = update(pages, man, today)
    if check:
        if changed:
            print(f'{len(pages)} pages, {len(changed)} changed (manifest stale)')
            for p in changed[:20]: print(p)
            sys.exit(1)
        print(f'{len(pages)} pages, 0 changed')
        sys.exit(0)
    json.dump(out, open(mf, 'w'), indent=1, sort_keys=True)
    print(f'{len(pages)} pages, {len(changed)} changed -> modified={today}')
