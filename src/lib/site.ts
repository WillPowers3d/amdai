/** Visible brand. Domain, URLs, package names, and amdai-bench stay lowercase. */
export const BRAND = 'AMDai';
/** Open Graph site_name matches the AMDai wordmark. Hostname stays lowercase. */
export const OG_SITE_NAME = 'AMDai';

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
  qwen38Gguf: 'https://huggingface.co/unsloth/Qwen3.8-27B-GGUF',
  qwen36Dense: 'https://huggingface.co/Qwen/Qwen3.6-27B',
  qwen36DenseGguf: 'https://huggingface.co/unsloth/Qwen3.6-27B-GGUF',
  glm53Flash: 'https://huggingface.co/zai-org/GLM-5.3-Flash',
  glm53FlashGguf: 'https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF',
  gptOss20b: 'https://huggingface.co/openai/gpt-oss-20b',
  gptOss20bGguf: 'https://huggingface.co/unsloth/gpt-oss-20b-GGUF',
  gemma327b: 'https://huggingface.co/google/gemma-3-27b-it',
  gemma327bGguf: 'https://huggingface.co/unsloth/gemma-3-27b-it-GGUF',
  llama3370b: 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct',
  llama3370bGguf: 'https://huggingface.co/bartowski/Llama-3.3-70B-Instruct-GGUF',
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
  { href: '/setup/windows', label: 'Windows setup', description: 'Cited llama.cpp Vulkan first-run on Windows. Not measured on local-desktop', group: 'path' },
  { href: '/setup/fedora', label: 'Fedora setup', description: 'Cited Fedora rocm packages + llama.cpp Vulkan. Not verified on our rig', group: 'path' },
  { href: '/setup/arch', label: 'Arch setup', description: 'Cited Arch Wiki RADV + llama.cpp Vulkan. Not verified on our rig', group: 'path' },
  { href: '/setup/docker', label: 'Docker / Podman', description: 'Cited official llama.cpp Vulkan or ROCm images. Not measured on local-desktop', group: 'path' },
  { href: '/setup/lm-studio', label: 'LM Studio', description: 'Cited LM Studio Vulkan or ROCm llama.cpp runtime on Radeon. Not measured on local-desktop', group: 'path' },
  { href: '/setup/coding-assistant', label: 'Coding assistant', description: 'Cited Aider, Cline, and Continue on llama-server /v1. Not a harness tok/s card', group: 'path' },
  { href: '/setup/ollama', label: 'Ollama', description: 'Cited Ollama on Radeon. llama.cpp stays the daily driver. Not measured on local-desktop', group: 'path' },
  { href: '/setup/open-webui', label: 'Open WebUI', description: 'Cited Open WebUI against llama-server /v1. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/r9700', label: 'R9700', description: 'Measured 35B on the 32 GB Radeon AI PRO R9700 — one GPU vs two, cited run cards', group: 'path' },
  { href: '/gpus/strix-halo', label: 'Strix Halo', description: 'Cited Ryzen AI Max+ 395 / Radeon 8060S APU guide. Shared memory. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-9070-xt', label: 'RX 9070 XT', description: '16 GB gfx1201 gaming sibling of the R9700. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-9070', label: 'RX 9070', description: '16 GB gfx1201 non-XT RDNA 4. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-9070-gre', label: 'RX 9070 GRE', description: '12 GB gfx1201 GRE. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-9060-xt', label: 'RX 9060 XT', description: '16 GB gfx1200 budget RDNA 4. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-7900-xtx', label: 'RX 7900 XTX', description: '24 GB gfx1100 RDNA 3. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-7900-xt', label: 'RX 7900 XT', description: '20 GB gfx1100 RDNA 3. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-7900-gre', label: 'RX 7900 GRE', description: '16 GB gfx1100 mid-tier 7900. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-7800-xt', label: 'RX 7800 XT', description: '16 GB gfx1101 RDNA 3. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-7700-xt', label: 'RX 7700 XT', description: '12 GB gfx1101 mid-tier. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-7600-xt', label: 'RX 7600 XT', description: '16 GB gfx1102 budget RDNA 3. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-7600', label: 'RX 7600', description: '8 GB gfx1102 non-XT budget RDNA 3. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-6800-xt', label: 'RX 6800 XT', description: '16 GB gfx1030 RDNA 2. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-6950-xt', label: 'RX 6950 XT', description: '16 GB gfx1030 6950 XT / 6900 XT. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/rx-6700-xt', label: 'RX 6700 XT', description: '12 GB gfx1031 RDNA 2. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/w7900', label: 'PRO W7900', description: '48 GB gfx1100 workstation. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/w7800', label: 'PRO W7800', description: '32 GB gfx1100 workstation. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/w7700', label: 'PRO W7700', description: '16 GB gfx1101 workstation. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/gpus/w6800', label: 'PRO W6800', description: '32 GB gfx1030 workstation. Calculator estimates. Not measured on local-desktop', group: 'path' },
  { href: '/stacks', label: 'Stacks', description: 'Daily driver and fast-agent cards from our test rig', group: 'path' },
  { href: '/flash-daily', label: 'Flash daily driver', description: 'Qwen 3.8 Flash VRAM + DDR5 offload at Q3–Q6, full 262K', group: 'path' },
  { href: '/qwen36-dual', label: '35B on two cards', description: 'Split vs two copies of UD-Q5_K_XL on two R9700s — measured on local-desktop', group: 'path' },
  { href: '/multi-gpu', label: 'Dual / multi-GPU', description: 'When a second R9700 helps or hurts — llama.cpp first, cited local-desktop 35B and Flash', group: 'path' },
  { href: '/stack-lab', label: 'Stack Lab', description: 'Ubuntu 24.04+ companion — packages not published yet; records amdai-bench cards', group: 'path' },
  { href: '/calculator', label: 'Calculator', description: 'Size a model, ask what a Radeon can run, or read a speed floor — Q3 through BF16', group: 'tools' },
  { href: '/budget', label: 'Budget', description: 'Starter → Pro Radeon builds, no invented prices', group: 'tools' },
  { href: '/compare', label: 'Compare 35B', description: 'One GPU vs split, and Q6 / Q5 / Q4 plus a labeled Q3 estimate — from local-desktop run cards', group: 'tools' },
  { href: '/compare/gpus', label: 'Compare GPUs', description: 'Pick two Radeon sheets — VRAM, 35B Q6/Q5/Q4 fit estimates, labeled Q3. No invented prices', group: 'tools' },
  { href: '/compare/models', label: 'Compare models', description: 'Pick two cited /models pages — sizes, context, Q6/Q5/Q4 fit estimates, labeled Q3. No invented prices', group: 'tools' },
  { href: '/can-run', label: 'Can my Radeon run it?', description: 'GPU × model fit from the calculator — Q6/Q5/Q4 plus a labeled Q3 estimate. No invented speeds', group: 'tools' },
  { href: '/qwen', label: 'Qwen compare', description: 'Every current 3.6 / 3.8 model × quant — sortable, filterable, measured cells from run cards', group: 'tools' },
  { href: '/benchmarks', label: 'Benchmarks', description: 'Cited 35B llama.cpp matrix from local-desktop run cards — Flash stays its own block', group: 'tools' },
  { href: '/results', label: 'Results', description: 'Official amdai-bench/run@1 cards — amdai’s verified local-desktop tests, exact launch command', group: 'tools' },
  { href: '/gpus', label: 'GPU directory', description: 'Radeon cards, gfx IDs, VRAM, official ROCm rows, tested recipes', group: 'tools' },
  { href: '/models', label: 'Models', description: 'House Qwen plus cited open-weight pages — official cards, Q6/Q5/Q4, labeled Q3', group: 'tools' },
  { href: '/quants', label: 'Quants', description: 'Q3–Q8, UD dynamic, KV types, why Q1/Q2 stay off', group: 'tools' },
  { href: '/backends', label: 'Backends', description: 'Inference engines compared — llama.cpp first', group: 'tools' },
  { href: '/about', label: 'About', description: 'Who runs AMDai, the local-desktop rig, and editorial independence', group: 'learn' },
  { href: '/methodology', label: 'How we test', description: 'amdai-bench/run@1 cards, labeled estimates, citations, corrections', group: 'learn' },
  { href: '/contact', label: 'Contact', description: 'Honest routes — contribute, ROCm problems, forum when enabled', group: 'learn' },
  { href: '/faq', label: 'FAQ', description: 'First-time Radeon questions — AMDai, GPU, quants, RAM, Stack Lab, affiliates', group: 'learn' },
  { href: '/glossary', label: 'Glossary', description: 'Plain-English jargon — ROCm, GGUF, Q3–Q6, KV cache, run cards', group: 'learn' },
  { href: '/rocm', label: 'ROCm', description: 'What it is — stack, gfx IDs, Vulkan vs HIP, versions', group: 'learn' },
  { href: '/rocm-problems', label: 'ROCm problems', description: "Open problems and how you can help — cited only", group: 'learn' },
  { href: '/software', label: 'AI software', description: 'llama.cpp first; vLLM and Strata as tries', group: 'learn' },
  { href: '/abliterated', label: 'Abliterated', description: 'Hub: what it is, how to vet files, catalog — educational only', group: 'learn' },
  { href: '/image-gen', label: 'Image gen', description: 'Cited ComfyUI-first Radeon guide for SD / SDXL / Flux-class. Linux first. Not measured on local-desktop', group: 'learn' },
  { href: '/vision', label: 'Vision', description: 'Cited llama.cpp mmproj path for image-in text-out. Linux first. Speeds not yet measured by AMDai', group: 'learn' },
  { href: '/speech', label: 'Speech', description: 'Cited whisper.cpp Vulkan STT plus Piper TTS. Linux first. Not measured on local-desktop', group: 'learn' },
  { href: '/long-context', label: 'Long context', description: '128K–262K on Radeon. Measured 35B llama.cpp cards. f16 KV default. Empty cells stay not measured yet', group: 'learn' },
  { href: '/rag', label: 'RAG', description: 'Cited llama.cpp-first local RAG on Radeon. nomic-embed Q6/Q5/Q4 plus labeled Q3. Linux first. Not measured on local-desktop', group: 'learn' },
  { href: '/harnesses', label: 'Harnesses', description: 'What to plug your local model into — agents, chat UIs, ComfyUI', group: 'learn' },
  { href: '/labs/shannon', label: 'Shannon’s lab', description: 'Cited How I run my Lab — Herdr, Coolify, secure-lab, autoresearch. Not measured by AMDai', group: 'learn' },
  { href: '/hardware', label: 'Hardware', description: 'PSU, cooling, noise, VRAM vs model size', group: 'learn' },
  { href: '/power', label: 'Power', description: 'Cited AMD TBP per Radeon and PSU sizing, including dual R9700. No invented watts', group: 'learn' },
  { href: '/fine-tuning', label: 'Fine-tuning', description: 'Cited LoRA / QLoRA on consumer Radeon. PyTorch ROCm, Unsloth, PEFT/TRL. Not yet measured on our R9700s', group: 'learn' },
  { href: '/tuning', label: 'Speed up llama.cpp', description: 'Cited llama.cpp flags on Radeon — -ngl, threads, batch, -fa, KV, split, draft, power. Measured 35B cells only', group: 'learn' },
  { href: '/bios', label: 'BIOS', description: 'Above 4G, ReBAR/SAM, CSM, x8/x8 vs x16/x4 — cited chipset notes', group: 'learn' },
  { href: '/flash-ram-offload', label: 'Flash RAM offload', description: 'Run Flash with experts on DDR5 — kits, measured DIMM speed, launch shape', group: 'learn' },
  { href: '/tutorials', label: 'Tutorials', description: 'Practical how-tos for this stack', group: 'learn' },
  { href: '/troubleshoot', label: 'Troubleshoot', description: 'Symptom-first fixes — GPU missing, install, OOM, slow, hang, Windows', group: 'learn' },
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
  { href: '/credits', label: 'Credits', description: 'Sybil / 0xSero attribution, the local-desktop first-party set, and Shannon’s cited lab', group: 'learn' },
  { href: '/disclosure', label: 'Disclosure', description: 'Amazon Associates, Rakuten, B&H — and what is not affiliate', group: 'learn' },
];

export const allNav: NavItem[] = [homeLink, ...primaryNav];

export const navGroups: { id: NavItem['group']; label: string }[] = [
  { id: 'path', label: 'Path' },
  { id: 'tools', label: 'Tools' },
  { id: 'learn', label: 'Learn' },
];
