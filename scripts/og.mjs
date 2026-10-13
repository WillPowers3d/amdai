import { chromium } from 'playwright';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = new URL('../public/og/', import.meta.url);
const font = new URL('../public/fonts/geist-latin.woff2', import.meta.url).href;
await mkdir(out, { recursive: true });

const pages = [
  ['home', 'Local Qwen on a R9700. Reliably.', 'Independent consumer notes for Radeon AI'],
  ['calculator', 'Quant + Hardware Calculator', 'Weights, KV, and overhead vs card VRAM'],
  ['budget', 'Setup by budget', 'Starter through the two-R9700 Pro rig'],
  ['abliterated', 'Abliterated models', 'Educational catalog. Official instruct first.'],
  ['stacks', 'Recommended stacks', 'Daily driver and fast agent from our rig'],
  ['backends', 'Which backend?', 'llama.cpp first. Strata when you need speed.'],
  ['gpus', 'GPU directory', 'Radeon cards, gfx IDs, official ROCm rows'],
  ['gpus-r9700', 'Radeon AI PRO R9700', '32 GB measured 35B. One GPU vs two.'],
  ['rocm', 'What is ROCm', 'The open compute stack, in plain English'],
  ['forum', 'Forum', 'Community threads — off on this static build'],
  ['start', 'Getting started', 'GPU → ROCm → llama.cpp → harness'],
  ['account', 'Saved rigs', 'Optional accounts. Off unless enabled.'],
  ['search', 'Search', 'Pagefind over the living notes'],
  ['glossary', 'Glossary', 'Plain-English jargon for a home Radeon box'],
  ['compare', 'Compare 35B', 'One GPU vs split, and Q6 / Q5 / Q4 plus a Q3 estimate'],
  ['compare-one-vs-two-gpu', 'One R9700 vs two', 'Split across both cards — from official run cards'],
  ['compare-q4-q5-q6', 'Q6 vs Q5 vs Q4', 'Same 35B quants. Q3 is a labeled estimate'],
  ['results', 'Official run cards', 'amdai-bench/run@1 from amdai on local-desktop'],
  ['bios', 'BIOS for local AI', 'Above 4G, ReBAR/SAM, CSM, x8/x8 vs x16/x4'],
  ['qwen', 'Qwen 3.6 / 3.8', 'Every current file × quant. Measured cells from cards'],
  ['flash-ram-offload', 'Flash on DDR5', 'Experts on system RAM. Measured DIMM speed'],
  ['flash-daily', 'Flash daily driver', 'Q3–Q6 VRAM + DDR5 offload at full 262K'],
  ['qwen36-dual', '35B on two cards', 'Split vs two copies of UD-Q5 on two R9700s'],
  ['benchmarks', 'R9700 benchmarks', 'First-party tok/s. No leaderboard spam'],
  ['default', 'AMDai', 'Independent Radeon AI notes. Not affiliated with AMD.'],
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
  <div class="mark"><span class="chip"></span>AMD<span class="ai">ai</span></div>
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
  const file = join(tmpdir(), `amdai-og-${slug}.html`);
  await writeFile(file, html(title, lede));
  await page.goto(`file://${file}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: new URL(`${slug}.png`, out).pathname, type: 'png' });
  await unlink(file).catch(() => {});
  console.log('og', slug);
}

await browser.close();
