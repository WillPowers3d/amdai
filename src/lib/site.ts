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

export { ogSlug, ogImageAlt, ogImagePath, ogImageUrl } from './og';

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
  group: 'path' | 'tools' | 'learn';
};

export const homeLink: NavItem = {
  href: '/',
  label: 'Home',
  description: 'What works this week and the map of the site',
  group: 'path',
};

export const primaryNav: NavItem[] = [
  { href: '/start', label: 'Getting started', description: 'Check a rig, Ubuntu setup, then a measured 35B recipe', group: 'path' },
  { href: '/setup', label: 'First-run setup', description: 'Ubuntu 24.04+ to first token, plus an honest Windows path', group: 'path' },
  { href: '/gpus/r9700', label: 'R9700', description: 'Measured 35B on the 32 GB Radeon AI PRO R9700 — one GPU vs two, cited run cards', group: 'path' },
  { href: '/stacks', label: 'Stacks', description: 'Daily driver and fast-agent cards from our test rig', group: 'path' },
  { href: '/flash-daily', label: 'Flash daily driver', description: 'Qwen 3.8 Flash VRAM + DDR5 offload at Q3–Q6, full 262K', group: 'path' },
  { href: '/qwen36-dual', label: '35B on two cards', description: 'Split vs two copies of UD-Q5_K_XL on two R9700s — measured on local-desktop', group: 'path' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU', description: 'When a second R9700 helps or hurts — llama.cpp first, cited local-desktop 35B and Flash', group: 'path' },
  { href: '/stack-lab', label: 'Stack Lab', description: 'Ubuntu 24.04+ companion — packages not published yet; records amdai-bench cards', group: 'path' },
  { href: '/calculator', label: 'Calculator', description: 'Size a model, ask what a Radeon can run, or read a speed floor — Q3 through BF16', group: 'tools' },
  { href: '/budget', label: 'Budget', description: 'Starter → Pro Radeon builds, no invented prices', group: 'tools' },
  { href: '/compare', label: 'Compare 35B', description: 'One GPU vs split, and Q6 / Q5 / Q4 plus a labeled Q3 estimate — from local-desktop run cards', group: 'tools' },
  { href: '/qwen', label: 'Qwen compare', description: 'Every current 3.6 / 3.8 model × quant — sortable, filterable, measured cells from run cards', group: 'tools' },
  { href: '/benchmarks', label: 'Benchmarks', description: 'Cited 35B llama.cpp matrix from local-desktop run cards — Flash stays its own block', group: 'tools' },
  { href: '/results', label: 'Results', description: 'Official amdai-bench/run@1 cards — amdai’s verified local-desktop tests, exact launch command', group: 'tools' },
  { href: '/gpus', label: 'GPU directory', description: 'Radeon cards, gfx IDs, VRAM, official ROCm rows, tested recipes', group: 'tools' },
  { href: '/models', label: 'Models', description: 'House Qwen models with reverse recipe tables and HF cards', group: 'tools' },
  { href: '/quants', label: 'Quants', description: 'Q3–Q8, UD dynamic, KV types, why Q1/Q2 stay off', group: 'tools' },
  { href: '/backends', label: 'Backends', description: 'Inference engines compared — llama.cpp first', group: 'tools' },
  { href: '/faq', label: 'FAQ', description: 'First-time Radeon local-LLM questions — GPU, quants, measured speed, RAM', group: 'learn' },
  { href: '/glossary', label: 'Glossary', description: 'Plain-English jargon — ROCm, GGUF, Q3–Q6, KV cache, run cards', group: 'learn' },
  { href: '/rocm', label: 'ROCm', description: 'What it is — stack, gfx IDs, Vulkan vs HIP, versions', group: 'learn' },
  { href: '/rocm-problems', label: 'ROCm problems', description: "Open problems and how you can help — cited only", group: 'learn' },
  { href: '/software', label: 'AI software', description: 'llama.cpp first; vLLM and Strata as tries', group: 'learn' },
  { href: '/abliterated', label: 'Abliterated', description: 'Hub: what it is, how to vet files, catalog — educational only', group: 'learn' },
  { href: '/harnesses', label: 'Harnesses', description: 'What to plug your local model into — agents, chat UIs, ComfyUI', group: 'learn' },
  { href: '/hardware', label: 'Hardware', description: 'PSU, cooling, noise, VRAM vs model size', group: 'learn' },
  { href: '/bios', label: 'BIOS', description: 'Above 4G, ReBAR/SAM, CSM, x8/x8 vs x16/x4 — cited chipset notes', group: 'learn' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload', description: 'Run Flash with experts on DDR5 — kits, measured DIMM speed, launch shape', group: 'learn' },
  { href: '/tutorials', label: 'Tutorials', description: 'Practical how-tos for this stack', group: 'learn' },
  { href: '/troubleshooting', label: 'Troubleshooting', description: 'GPU not seen, wrong wheel, CPU fallback', group: 'learn' },
  { href: '/troubleshoot/errors', label: 'Error paste', description: 'Match a log against cited ROCm / Ollama patterns', group: 'learn' },
  { href: '/updates', label: 'Updates', description: 'RSS + ROCm × llama.cpp × vLLM 0.31 matrix', group: 'learn' },
  { href: '/blog', label: 'Blog', description: 'Longer posts and ROCm version notes', group: 'learn' },
  { href: '/forum', label: 'Forum', description: 'Threads, rig badges, solved marks — off unless FORUM_ENABLED', group: 'learn' },
  { href: '/newsletter', label: 'Digest', description: 'Email-only Lab Notes digest — run cards, guides, ROCm problems, Stack Lab', group: 'learn' },
  { href: '/account', label: 'Account', description: 'Optional saved rigs and stack-update alerts', group: 'learn' },
  { href: '/privacy', label: 'Privacy', description: 'What optional accounts and the Lab Notes digest store', group: 'learn' },
  { href: '/contribute', label: 'Contribute', description: 'Submit a Radeon recipe as JSON — log required, no invented tok/s', group: 'learn' },
  { href: '/wanted', label: 'Wanted', description: 'Radeon × model gaps we want sourced recipes for', group: 'learn' },
  { href: '/credits', label: 'Credits', description: 'Sybil / 0xSero attribution and the local-desktop first-party set', group: 'learn' },
  { href: '/disclosure', label: 'Disclosure', description: 'Amazon Associates, Rakuten, B&H — and what is not affiliate', group: 'learn' },
];

export const allNav: NavItem[] = [homeLink, ...primaryNav];

export const navGroups: { id: NavItem['group']; label: string }[] = [
  { id: 'path', label: 'Path' },
  { id: 'tools', label: 'Tools' },
  { id: 'learn', label: 'Learn' },
];
