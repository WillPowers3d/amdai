export const site = {
  name: 'R9700 Lab Notes',
  shortName: 'Lab Notes',
  tagline: 'Local AI on consumer AMD Radeon — ROCm notes from a real R9700 test rig.',
  description:
    'The consumer AMD ROCm notebook: llama.cpp and Qwen on Radeon GPUs, grounded in a two-R9700 test rig. Daily driver, fast agent stack, GPU directory, and a quant + hardware calculator.',
  officialGpu: 'AMD Radeon AI PRO R9700',
  informalGpu: 'R9700 Pro',
};

export const officialLinks = {
  product:
    'https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html',
  rocm: 'https://rocm.docs.amd.com/en/latest/',
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
  hermes: 'https://hermes-agent.nousresearch.com/',
  hermesLocal: 'https://hermes-agent.nousresearch.com/docs/user-guide/local-models',
  openclaw: 'https://docs.openclaw.ai/',
  openclawGithub: 'https://github.com/openclaw/openclaw',
  qwen: 'https://huggingface.co/Qwen',
  qwen36: 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B',
  qwen36Gguf: 'https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF',
  qwenFlash: 'https://huggingface.co/Qwen/Qwen3.8-Flash-Next',
  qwenFlashGguf: 'https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF',
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
  { href: '/budget', label: 'Budget', description: 'Starter → Pro Radeon builds, no invented prices', group: 'path' },
  { href: '/calculator', label: 'Calculator', description: 'Quant + hardware VRAM / RAM fit estimates', group: 'path' },
  { href: '/quants', label: 'Quants', description: 'Q4–Q8, UD dynamic, KV types, why not below Q4', group: 'path' },
  { href: '/gpus', label: 'GPU directory', description: 'Radeon cards, gfx IDs, VRAM, official ROCm rows', group: 'stack' },
  { href: '/rocm', label: 'ROCm', description: 'What it is, plus short version notes', group: 'stack' },
  { href: '/backends', label: 'Backends', description: 'llama.cpp first; Vulkan, HIP, Strata, vLLM, Ollama', group: 'stack' },
  { href: '/software', label: 'AI software', description: 'llama.cpp first; vLLM and Strata as tries', group: 'stack' },
  { href: '/abliterated', label: 'Abliterated', description: 'Refusal removal — educational, never the default', group: 'stack' },
  { href: '/harnesses', label: 'Harnesses', description: 'Hermes Agent and OpenClaw above the model', group: 'stack' },
  { href: '/hardware', label: 'Hardware', description: 'PSU, cooling, noise, VRAM vs model size', group: 'stack' },
  { href: '/stack-lab', label: 'Stack Lab', description: 'Ubuntu companion — same catalog as the YAML', group: 'path' },
  { href: '/tutorials', label: 'Tutorials', description: 'Practical how-tos for this stack', group: 'practice' },
  { href: '/troubleshooting', label: 'Troubleshooting', description: 'GPU not seen, wrong wheel, CPU fallback', group: 'practice' },
  { href: '/troubleshoot/errors', label: 'Error paste', description: 'Match a log against cited ROCm / Ollama patterns', group: 'practice' },
  { href: '/updates', label: 'Updates', description: 'RSS + ROCm × llama.cpp × vLLM 0.31 matrix', group: 'practice' },
  { href: '/faq', label: 'FAQ', description: 'Short answers for a first home box', group: 'practice' },
  { href: '/blog', label: 'Blog', description: 'Longer posts and ROCm version notes', group: 'practice' },
  { href: '/disclosure', label: 'Disclosure', description: 'Amazon Associates, Rakuten, B&H — and what is not affiliate', group: 'practice' },
];

export const allNav: NavItem[] = [homeLink, ...primaryNav];

export const navGroups: { id: NavItem['group']; label: string }[] = [
  { id: 'path', label: 'Path' },
  { id: 'stack', label: 'Stack' },
  { id: 'practice', label: 'Practice' },
];
