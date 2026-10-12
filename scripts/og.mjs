import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const out = new URL('../public/og/', import.meta.url);
const font = new URL('../public/fonts/geist-latin.woff2', import.meta.url).href;
await mkdir(out, { recursive: true });

const pages = [
  ['home', 'Local Qwen on a real R9700', 'Independent consumer notes for Radeon AI'],
  ['calculator', 'Quant + Hardware Calculator', 'Weights, KV, and overhead vs card VRAM'],
  ['budget', 'Setup by budget', 'Starter through the two-R9700 Pro rig'],
  ['abliterated', 'Abliterated models', 'Educational catalog. Official instruct first.'],
  ['stacks', 'Recommended stacks', 'Daily driver and fast agent from our rig'],
  ['backends', 'Which backend?', 'llama.cpp first. Strata when you need speed.'],
  ['gpus', 'GPU directory', 'Radeon cards, gfx IDs, official ROCm rows'],
  ['rocm', 'What is ROCm', 'The open compute stack, in plain English'],
  ['forum', 'Forum', 'Community threads — off on this static build'],
  ['start', 'Getting started', 'GPU → ROCm → llama.cpp → harness'],
  ['account', 'Saved rigs', 'Optional accounts. Off unless enabled.'],
  ['search', 'Search', 'Pagefind over the living notes'],
  ['default', 'amdai', 'Independent Radeon AI notes. Not affiliated with AMD.'],
];

const html = (title, lede) => `<!doctype html>
<html><head><meta charset="utf-8">
<style>
@font-face{font-family:Geist;src:url('${font}') format('woff2');font-weight:100 900;font-display:block}
body{margin:0;width:1200px;height:630px;background:#08080b;color:#f4efe8;font-family:Geist,ui-sans-serif,system-ui,sans-serif;overflow:hidden}
.grid{position:absolute;inset:0;background-image:linear-gradient(to right,#2c2724 1px,transparent 1px),linear-gradient(to bottom,#2c2724 1px,transparent 1px);background-size:40px 40px;mask-image:radial-gradient(ellipse at 80% 30%,#000 10%,transparent 70%);opacity:.7}
.glow{position:absolute;right:40px;top:40px;width:420px;height:420px;background:radial-gradient(circle,rgba(226,74,47,.28),transparent 68%)}
.inner{position:relative;padding:64px 72px}
.mark{display:flex;align-items:center;gap:14px;font-size:28px;letter-spacing:-.04em;font-weight:560}
.chip{width:28px;height:28px;border:1.6px solid #e24a2f;border-radius:6px}
.ai{color:#e24a2f}
h1{margin:48px 0 0;font-size:68px;letter-spacing:-.04em;line-height:1.02;max-width:14ch;font-weight:560}
p{margin:22px 0 0;font-size:26px;color:#b9b1a7;max-width:28ch}
.foot{position:absolute;left:72px;bottom:48px;font-size:16px;color:#7d766d}
</style></head>
<body>
<div class="grid"></div><div class="glow"></div>
<div class="inner">
  <div class="mark"><span class="chip"></span>amd<span class="ai">ai</span></div>
  <h1>${title}</h1>
  <p>${lede}</p>
</div>
<div class="foot">Independent, not affiliated with AMD · amdai.net</div>
</body></html>`;

const browser = await chromium.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

for (const [slug, title, lede] of pages) {
  const file = new URL(`./og-tmp-${slug}.html`, import.meta.url);
  await writeFile(file, html(title, lede));
  await page.goto(file.href, { waitUntil: 'networkidle' });
  await page.screenshot({ path: new URL(`${slug}.png`, out).pathname, type: 'png' });
  console.log('og', slug);
}

await browser.close();
