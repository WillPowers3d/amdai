/** Visible brand. Domain, URLs, package names, and amdai-bench stay lowercase. */
export const BRAND = 'AMDai';
/** Open Graph site_name and the public hostname stay lowercase. */
export const OG_SITE_NAME = 'amdai';

/** Homepage hero. Keep this exact string everywhere it is shown. */
export const HERO_HEADLINE = 'Local Qwen on a R9700. Reliably.';

export const site = {
  name: 'R9700 Lab Notes',
  wordmark: BRAND,
  shortName: BRAND,
  tagline: 'Local AI on consumer AMD Radeon — ROCm notes from a real R9700 test rig.',
  description:
    'The consumer AMD ROCm notebook: llama.cpp and Qwen on Radeon GPUs, grounded in a two-R9700 test rig. Daily driver, fast agent stack, GPU directory, and a quant + hardware calculator.',
  officialGpu: 'AMD Radeon AI PRO R9700',
  informalGpu: 'R9700 Pro',
};

const OG_PAGES = new Set([
  'home',
  'calculator',
  'budget',
  'abliterated',
  'stacks',
  'backends',
  'gpus',
  'rocm',
  'forum',
  'start',
  'account',
  'search',
  'glossary',
  'compare',
  'compare-one-vs-two-gpu',
  'compare-q4-q5-q6',
  'results',
  'bios',
  'qwen',
  'flash-ram-offload',
  'flash-daily',
  'qwen36-dual',
  'benchmarks',
  'default',
]);

export function ogSlug(pathname: string) {
  if (!pathname || pathname === '/') return 'home';
  const slug = pathname.replace(/^\//, '').replace(/\/+$/, '').replace(/\//g, '-') || 'home';
  if (slug === 'rocm' || slug.startsWith('rocm-')) return 'rocm';
  if (slug === 'forum' || slug.startsWith('forum-')) return 'forum';
  if (slug === 'harnesses' || slug.startsWith('harnesses-')) return 'stacks';
  if (slug === 'backends' || slug.startsWith('backends-')) return 'backends';
  if (slug === 'results' || slug.startsWith('results-')) return 'results';
  if (slug === 'benchmarks' || slug.startsWith('benchmarks-')) return 'benchmarks';
  if (slug === 'compare' || slug.startsWith('compare-')) {
    return OG_PAGES.has(slug) ? slug : 'compare';
  }
  if (slug === 'models' || slug.startsWith('models-') || slug.startsWith('gpus-') || slug.startsWith('recipes-')) return 'gpus';
  return OG_PAGES.has(slug) ? slug : 'default';
}

export const officialLinks = {
  product:
    'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html',
  rocm: 'https://rocm.docs.amd.com/en/latest/',
  rocmVersions: 'https://rocm.docs.amd.com/en/latest/release/versions.html',
  rocmInstall: 'https://rocm.docs.amd.com/en/latest/install/rocm.html',
  rocm10Notes: 'https://rocm.docs.amd.com/en/docs-10.0.0/about/release-notes.html',
  rocm101Notes: 'https://rocm.docs.amd.com/en/docs-10.1.0/about/release-notes.html',
  rocm101Blog: 'https://rocm.blogs.amd.com/ecosystems-and-partners/rocm-10.1-blog/README.html',
  rocm10Matrix: 'https://rocm.docs.amd.com/en/docs-10.1.0/compatibility/compatibility-matrix.html',
  rocmCli: 'https://rocm.docs.amd.com/projects/rocm-cli/en/latest/getting-started.html',
  rocmCliReleases: 'https://github.com/ROCm/rocm-cli/releases',
  rocmTransition: 'https://rocm.docs.amd.com/en/docs-10.0.0/about/transition-guide-TheRock.html',
  compatibility:
    'https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/system-requirements.html',
  radeonRocm: 'https://rocm.docs.amd.com/projects/radeon-ryzen/en/latest/',
  pytorch: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/frameworks/pytorch/install.html',
  vllmAmd: 'https://rocm.docs.amd.com/projects/ai-ecosystem/en/latest/inference/vllm.html',
  vllmUpstream: 'https://docs.vllm.ai/en/stable/getting_started/installation/gpu/index.html',
  llamaCpp: 'https://github.com/ggml-org/llama.cpp',
  ollama: 'https://ollama.com/',
  tgiAmd: 'https://huggingface.co/docs/text-generation-inference/en/installation_amd',
  strata: 'https://www.stratat.com/en/releases/v0.1.42',
  hermes: 'https://hermes-agent.nousresearch.com/',
  hermesLocal: 'https://hermes-agent.nousresearch.com/docs/user-guide/local-models',
  openclaw: 'https://docs.openclaw.ai/',
  openclawGithub: 'https://github.com/openclaw/openclaw',
  qwen: 'https://huggingface.co/Qwen',
  qwen36: 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B',
  qwen36Gguf: 'https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF',
  qwenFlash: 'https://huggingface.co/Qwen/Qwen3.8-Flash-Next',
  qwenFlashGguf: 'https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF',
  qwen38: 'https://huggingface.co/Qwen/Qwen3.8-27B',
  qwen36Dense: 'https://huggingface.co/Qwen/Qwen3.6-27B',
  coder390:
    'https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer',
};

export type NavItem = {
  href: string;
  label: string;
  description: string;
  group: 'path' | 'stack' | 'practice';
};

export const homeLink: NavItem = {
  href: '/',
  label: 'Home',
  description: 'What works this week and the map of the site',
  group: 'path',
};

export const primaryNav: NavItem[] = [
  { href: '/start', label: 'Getting started', description: 'GPU → ROCm → llama.cpp → optional harness', group: 'path' },
  { href: '/stacks', label: 'Stacks', description: 'Daily driver and fast-agent cards from our test rig', group: 'path' },
  { href: '/qwen', label: 'Qwen compare', description: 'Every current 3.6 / 3.8 model × quant — sortable, filterable, measured cells from run cards', group: 'path' },
  { href: '/compare', label: 'Compare 35B', description: 'One GPU vs split, and Q6 / Q5 / Q4 plus a labeled Q3 estimate — from local-desktop run cards', group: 'path' },
  { href: '/qwen36-dual', label: '35B on two cards', description: 'Split vs two copies of UD-Q5_K_XL on two R9700s — measured on local-desktop', group: 'path' },
  { href: '/flash-daily', label: 'Flash daily driver', description: 'Qwen 3.8 Flash VRAM + DDR5 offload at Q3–Q6, full 262K', group: 'path' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload', description: 'Run Flash with experts on DDR5 — kits, measured DIMM speed, launch shape', group: 'path' },
  { href: '/benchmarks', label: 'Benchmarks', description: 'Cited 35B llama.cpp matrix from local-desktop run cards — Flash stays its own block', group: 'path' },
  { href: '/results', label: 'Results', description: 'Official amdai-bench/run@1 cards — amdai’s verified local-desktop tests, exact launch command', group: 'path' },
  { href: '/budget', label: 'Budget', description: 'Starter → Pro Radeon builds, no invented prices', group: 'path' },
  { href: '/calculator', label: 'Calculator', description: 'Size a model, ask what a Radeon can run, or read a speed floor — Q3 through BF16', group: 'path' },
  { href: '/quants', label: 'Quants', description: 'Q3–Q8, UD dynamic, KV types, why Q1/Q2 stay off', group: 'path' },
  { href: '/gpus', label: 'GPU directory', description: 'Radeon cards, gfx IDs, VRAM, official ROCm rows, tested recipes', group: 'stack' },
  { href: '/models', label: 'Models', description: 'House Qwen models with reverse recipe tables and HF cards', group: 'stack' },
  { href: '/rocm', label: 'ROCm', description: 'What it is — stack, gfx IDs, Vulkan vs HIP, versions', group: 'stack' },
  { href: '/rocm-problems', label: 'ROCm problems', description: "Open problems and how you can help — cited only", group: 'stack' },
  { href: '/backends', label: 'Backends', description: 'Inference engines compared — llama.cpp first', group: 'stack' },
  { href: '/software', label: 'AI software', description: 'llama.cpp first; vLLM and Strata as tries', group: 'stack' },
  { href: '/abliterated', label: 'Abliterated', description: 'Hub: what it is, how to vet files, catalog — educational only', group: 'stack' },
  { href: '/harnesses', label: 'Harnesses', description: 'What to plug your local model into — agents, chat UIs, ComfyUI', group: 'stack' },
  { href: '/hardware', label: 'Hardware', description: 'PSU, cooling, noise, VRAM vs model size', group: 'stack' },
  { href: '/bios', label: 'BIOS', description: 'Above 4G, ReBAR/SAM, CSM, x8/x8 vs x16/x4 — cited chipset notes', group: 'stack' },
  { href: '/stack-lab', label: 'Stack Lab', description: 'Ubuntu companion — same catalog as the YAML', group: 'path' },
  { href: '/tutorials', label: 'Tutorials', description: 'Practical how-tos for this stack', group: 'practice' },
  { href: '/troubleshooting', label: 'Troubleshooting', description: 'GPU not seen, wrong wheel, CPU fallback', group: 'practice' },
  { href: '/troubleshoot/errors', label: 'Error paste', description: 'Match a log against cited ROCm / Ollama patterns', group: 'practice' },
  { href: '/updates', label: 'Updates', description: 'RSS + ROCm × llama.cpp × vLLM 0.31 matrix', group: 'practice' },
  { href: '/faq', label: 'FAQ', description: 'First-time Radeon local-LLM questions — GPU, quants, measured speed, RAM', group: 'practice' },
  { href: '/glossary', label: 'Glossary', description: 'Plain-English jargon — ROCm, GGUF, Q3–Q6, KV cache, run cards', group: 'practice' },
  { href: '/blog', label: 'Blog', description: 'Longer posts and ROCm version notes', group: 'practice' },
  { href: '/forum', label: 'Forum', description: 'Threads, rig badges, solved marks — off unless FORUM_ENABLED', group: 'practice' },
  { href: '/newsletter', label: 'Digest', description: 'Email-only Lab Notes digest — run cards, guides, ROCm problems, Stack Lab', group: 'practice' },
  { href: '/account', label: 'Account', description: 'Optional saved rigs and stack-update alerts', group: 'practice' },
  { href: '/privacy', label: 'Privacy', description: 'What optional accounts and the Lab Notes digest store', group: 'practice' },
  { href: '/contribute', label: 'Contribute', description: 'Submit a Radeon recipe as JSON — log required, no invented tok/s', group: 'practice' },
  { href: '/wanted', label: 'Wanted', description: 'Radeon × model gaps we want sourced recipes for', group: 'practice' },
  { href: '/credits', label: 'Credits', description: 'Sybil / 0xSero attribution and the local-desktop first-party set', group: 'practice' },
  { href: '/disclosure', label: 'Disclosure', description: 'Amazon Associates, Rakuten, B&H — and what is not affiliate', group: 'practice' },
];

export const allNav: NavItem[] = [homeLink, ...primaryNav];

export const navGroups: { id: NavItem['group']; label: string }[] = [
  { id: 'path', label: 'Path' },
  { id: 'stack', label: 'Stack' },
  { id: 'practice', label: 'Practice' },
];
