#!/usr/bin/env python3
"""Lint buy links in built HTML (dist/) or links.json from crawl.py.
Fails if (a) one page has the same visible/aria text on buy links to different products,
(b) a buy label shows a raw slug like 'rx-6700-xt', or (c) a bare URL is a /go/ link's text.
Usage: buy_label_lint.py dist/   |  buy_label_lint.py links.json   |  --selftest"""
import sys,os,re,json,collections as C
from html.parser import HTMLParser
SLUG=re.compile(r'\b(rx-\d{4}|w\d{4})(-[a-z]+)*\b')
class P(HTMLParser):
    def __init__(s): super().__init__(); s.st=[]; s.out=[]
    def handle_starttag(s,t,a):
        if t=='a': a=dict(a); s.st.append({'href':a.get('href') or '','aria':a.get('aria-label'),'text':''})
    def handle_endtag(s,t):
        if t=='a' and s.st: x=s.st.pop(); x['text']=' '.join(x['text'].split()); s.out.append(x)
    def handle_data(s,d):
        for x in s.st: x['text']+=d
def check(page,links):
    errs=[]; by=C.defaultdict(set)
    for l in links:
        if '/go/' not in l['href']: continue
        name=l.get('aria') or l['text']; prod=l['href'].split('?')[0]
        by[name].add(prod)
        if SLUG.search(l['text']): errs.append(f'{page}: raw slug in label "{l["text"]}"')
        if l['text'].startswith('http'): errs.append(f'{page}: bare URL label')
    for n,s in by.items():
        if len(s)>1: errs.append(f'{page}: "{n}" names {len(s)} different products')
    return errs
def main(a):
    errs=[]
    if a.endswith('.json'):
        g=C.defaultdict(list)
        for l in json.load(open(a))['links']: g[l['page']].append(l)
        for p,ls in g.items(): errs+=check(p,ls)
    else:
        for root,_,fs in os.walk(a):
            for f in fs:
                if f.endswith('.html'):
                    p=P(); p.feed(open(os.path.join(root,f),encoding='utf-8',errors='replace').read()); errs+=check(os.path.join(root,f),p.out)
    for e in errs: print(e)
    print(f'{len(errs)} problems'); return 1 if errs else 0
def selftest():
    bad='<a href="/go/newegg/a/">Also at Newegg</a><a href="/go/newegg/b/">Also at Newegg</a><a href="/go/newegg/c/">Or add a second rx-6700-xt</a>'
    good='<a href="/go/newegg/a/" aria-label="Check Radeon RX 9070 XT price at Newegg">Newegg</a><a href="/go/newegg/b/" aria-label="Check Radeon AI PRO R9700 price at Newegg">Newegg</a><a href="/go/newegg/c/">Or add a second Radeon RX 6700 XT</a>'
    r=[]
    for h in (bad,good): p=P(); p.feed(h); r.append(len(check('t',p.out)))
    ok=r==[2,0]; print('selftest',r,'PASS' if ok else 'FAIL'); return 0 if ok else 1
if __name__=='__main__':
    sys.exit(selftest() if sys.argv[1:]==['--selftest'] else main(sys.argv[1]))
